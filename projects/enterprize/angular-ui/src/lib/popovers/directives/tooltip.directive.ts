import {
    ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, HostBinding,
    HostListener, Injector, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges, TemplateRef,
    ViewContainerRef
} from "@angular/core";
import { Placement } from "../common/placements.type";
import { ITooltip } from "../common/tooltip.interface";
import { TooltipComponent } from "../components/tooltip/tooltip.component";
import { FloatElementService } from "../services/float-element.service";


/**
 * @Directive
 * Diretiva para exibição de tooltip.
 *
 * @author Tcharles Michael Moraes
 * @since 06/05/2019
 */
@Directive({
    selector: "[etzTooltip]"
})
export class TooltipDirective implements ITooltip, OnChanges, OnDestroy {

    //#region Inputs
    /**
     * @Input
     * Título do tooltip
     */
    @Input()
    public title: string;
    /**
     * @Input
     * Texto que será exibido no tooltip
     */
    @Input()
    public contentText: string;
    /**
     * @Input
     * Url da imagem que será exibida no tooltip
     */
    @Input()
    public contentImage: string;
    /**
     * @Input
     * Link externo para mais informações.
     */
    @Input()
    public extraHelp: string;
    /**
     * @Input
     * Template para o conteúdo do Tooltip. Caso este binding for passado, o componente irá ignorar
     * {@link contentText} e {@link contentImage}.
     */
    @Input()
    public contentTemplate: TemplateRef<any>;
    /**
     * @Input
     * Template para o tooltip inteiro.
     */
    @Input()
    public template: TemplateRef<any>;
    /**
     * @Input
     * Lista de classe customizadas a serem aplicadas no tooltip, separadas por espaços.
     * @optional
     */
    @Input()
    public tooltipStyle: {[key: string]: string};
    /**
     * @Input
     * Posicionamento do tooltip.
     * @default 'top'
     */
    @Input()
    public placement: Placement;
    /**
     * @Input
     * Margem entre o tooltip e a sua origem.
     * @default 5
     */
    @Input()
    public margin: number;
    /**
     * @Input
     * Container do tooltip
     */
    @Input()
    public container: "body"|null;
    /**
     * @Input
     * Delay para o aparecimento do tooltip
     * @default 500
     */
    @Input()
    public startDelay: number;
    /**
     * @Input
     * Flag que desablita o tooltip.
     * @default false
     */
    @Input()
    public tooltipDisabled: boolean;
    /**
     * @Input
     * @HostBinding
     * Altera cursor para "help".
     */
    @Input()
    public cursor: boolean;
    //#endregion

    //#region Private Attributes
    /**
     * Componente de tooltip criado dinamicamente.
     */
    private component: ComponentRef<TooltipComponent>;
    /**
     * Flag que indica se o mouse está sobre o componente.
     * @default false
     */
    private isMouseOnComponent: boolean;
    /**
     * Id do timeout utilizado para inicializador do tooltip
     */
    private openTimerId: number;
    /**
     * Factory de componentes de tooltip
     */
    private readonly tooltipComponentFactory: ComponentFactory<TooltipComponent>;
    /**
     * Serviço de renderização de templates para o DOM do angular
     * @injected
     */
    private readonly renderer: Renderer2;
    /**
     * Injetor do elemento base do tooltip
     * @injected
     */
    private readonly injector: Injector;
    /**
     * Elemento de origem do tooltip.
     * @injected
     */
    private readonly element: ElementRef<HTMLElement>;
    /**
     * Container de visões que contém a origem do tooltip e onde será renderizado o tooltip.
     * @injected
     */
    private readonly viewContainerRef: ViewContainerRef;
    /**
     * Serviço de elementos flutuantes.
     * @injected
     */
    private readonly floatElementService: FloatElementService;
    //#endregion

    //#region Constructor
    constructor(renderer: Renderer2, injector: Injector, element: ElementRef<HTMLElement>,
                viewContainerRef: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver,
                floatElementService: FloatElementService) {

        // Injetados
        this.renderer = renderer;
        this.injector = injector;
        this.element = element;
        this.viewContainerRef = viewContainerRef;
        this.floatElementService = floatElementService;

        // Privados
        this.tooltipComponentFactory = componentFactoryResolver.resolveComponentFactory(TooltipComponent);
        this.isMouseOnComponent = false;
    }
    //#endregion

    //#region Host Bindings
    /**
     * @HostBinding
     * Define o cursor para "help"
     */
    @HostBinding("class.cursor-help")
    @HostBinding("class.cursor-force-all-children")
    public get setCursor(): boolean {
        return this.cursor && !this.tooltipDisabled;
    }
    //#endregion

    //#region Host Listeners
    /**
     * @inheritDoc
     */
    @HostListener("mouseenter")
    public onMouseEnter() {

        if (this.component == null && !this.tooltipDisabled) {
            this.createComponent();
        }

        if (!this.tooltipDisabled) {

            if (this.viewContainerRef.indexOf(this.component.hostView) === -1) {

                //Work around para conseguir buscar o tamanho do tooltip.
                this.component.location.nativeElement.style.visibility = "hidden";
                this.viewContainerRef.insert(this.component.hostView);

                this.openTimerId = setTimeout(() => {

                    this.openTimerId = null;
                    this.floatElementService.positionElement(this.renderer, this.component.location.nativeElement,
                        this.element.nativeElement, this.margin, this.placement, this.container);
                    this.component.location.nativeElement.style.visibility = "visible";
                }, this.startDelay);
            }
        }
    }

    /**
     * @inheritDoc
     */
    @HostListener("mouseleave")
    public onMouseLeave() {

        if (this.component != null) {

            setTimeout(() => {

                clearTimeout(this.openTimerId);
                this.openTimerId = null;

                if (this.viewContainerRef.indexOf(this.component.hostView) !== -1 && this.isMouseOnComponent == false) {

                    this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.component.hostView));
                }
            }, 100);
        }
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {


        this.margin = this.margin != null ? this.margin : 5;
        this.placement = this.placement != null ? this.placement : "top";
        this.startDelay = this.startDelay != null ? this.startDelay : 500;
        this.tooltipDisabled = this.tooltipDisabled != null ? this.tooltipDisabled : false;
        this.container = this.container != null ? this.container : "body";
        this.cursor = this.cursor != null ? this.cursor : true;

        if (this.component != null) {

            this.component.changeDetectorRef.markForCheck();

            if (changes.title != null) {
                this.component.instance.title = changes.title.currentValue;
            }

            if (changes.contentText != null) {
                this.component.instance.contentText = changes.contentText.currentValue;
            }

            if (changes.contentImage != null) {
                this.component.instance.contentImage = changes.contentImage.currentValue;
            }

            if (changes.contentTemplate != null) {
                this.component.instance.contentTemplate = changes.contentTemplate.currentValue;
            }

            if (changes.template != null) {
                this.component.instance.template = changes.template.currentValue;
            }

            if (changes.tooltipStyle != null) {
                this.component.instance.tooltipStyle = changes.tooltipStyle.currentValue;
            }

            if (changes.tooltipDisabled) {

                if (this.viewContainerRef.indexOf(this.component.hostView) !== -1 && this.isMouseOnComponent == false) {

                    if (this.openTimerId != null) {

                        clearTimeout(this.openTimerId);
                        this.openTimerId = null;
                    }
                    this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.component.hostView));
                }
            }

            this.component.changeDetectorRef.detectChanges();
        }
    }

    /**
     * @inheritDoc
     */
    public ngOnDestroy(): void {

        if (this.component != null &&
            this.viewContainerRef.indexOf(this.component.hostView) !== -1 &&
            this.isMouseOnComponent == false) {
            this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.component.hostView));
        }

        clearTimeout(this.openTimerId);
    }
    //#endregion

    //#region Private Methods
    /**
     * Criar componente dinâmico com base em uma factory.
     */
    private createComponent(): void {

        this.component = this.tooltipComponentFactory.create(this.injector);
        this.component.instance.title = this.title;
        this.component.instance.contentText = this.contentText;
        this.component.instance.contentImage = this.contentImage;
        this.component.instance.extraHelp = this.extraHelp;
        this.component.instance.contentTemplate = this.contentTemplate;
        this.component.instance.template = this.template;
        this.component.instance.origin = this.element.nativeElement;
        this.component.instance.tooltipStyle = this.tooltipStyle;

        this.renderer.listen(this.component.location.nativeElement, "mouseenter", () => {
            this.isMouseOnComponent = true;
        });

        this.renderer.listen(this.component.location.nativeElement, "mouseleave", () => {

            this.isMouseOnComponent = false;
            this.viewContainerRef.detach(this.viewContainerRef.indexOf(this.component.hostView));
        });
    }
    //#endregion
}
