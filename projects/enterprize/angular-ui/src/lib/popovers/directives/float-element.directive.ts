import {
    AfterViewInit, Directive, DoCheck, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit,
    Renderer2, SimpleChanges
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { Placement } from "../common/placements.type";
import { FloatElementService } from "../services/float-element.service";


/**
 * Diretiva para elementos flutuantes.
 * Utilizado para posicionar elementos flutuantes de acordo com a parametrição e da sua localização
 * de origem.
 *
 * @author Tcharles Michael Moraes
 * @since 15/04/2019
 */
@Directive({
    selector: "[etzFloatElement]"
})
export class FloatElementDirective implements AfterViewInit, DoCheck, OnChanges, OnInit, OnDestroy {

    //#region Input
    /**
     * @Input
     * Elemento de origem que serve de base para a abertura do elemento flutuante.
     */
    @Input()
    public origin: HTMLElement;
    /**
     * @Input
     * Margem que o elemento flutuante terá de sua origem {@link origin}.
     * @default 0
     */
    @Input()
    public margin: number;
    /**
     * @Input
     * Localização onde o elemento flutuante irá ser renderizado.
     * @default 'auto'
     */
    @Input()
    public placement: Placement;
    /**
     * @Input
     * Container no qual o elemento flutuante será criado.
     * @default null
     */
    @Input()
    public container: "body" | null;
    /**
     * @Input
     * Flag que indica se deve redimensionar o elemento flutuante conforme o tamanho do pai.
     * @default false
     */
    @Input()
    public resize: boolean;
    //#endregion

    //#region Private Attributes
    /**
     * Flag que indica se já inicializou
     */
    private init: boolean;
    /**
     * @injected
     * Serviço de renderização de templates para o DOM do angular
     */
    private readonly renderer: Renderer2;
    /**
     * @injected
     * Elemento que será flutuado e posicionado na tela.
     */
    private readonly floatElement: ElementRef<HTMLElement>;
    /**
     * @injected
     * Serviço Document da raíz do JS.
     */
    private readonly document: Document;
    /**
     * @injected
     * Serviço de elementos flutuantes.
     */
    private readonly floatElementService: FloatElementService;
    //#endregion

    //#region Constructor
    constructor(renderer: Renderer2, element: ElementRef<HTMLElement>,
                @Inject(DOCUMENT) document: any, floatElementService: FloatElementService) {

        // Injetados
        this.renderer = renderer;
        this.floatElement = element;
        this.document = document;
        this.floatElementService = floatElementService;

        // Privados
        this.init = false;
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnInit(): void {

        this.resize = this.resize != null ? this.resize : false;
    }

    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.resize != null) {
            this.resize = changes.resize.currentValue != null ? changes.resize.currentValue : false;
        }
    }

    /**
     * @inheritDoc
     */
    public ngAfterViewInit(): void {

        this.placement = this.placement != null ? this.placement : "auto";
        this.margin = this.margin != null ? this.margin : 0;

        this.floatElementService.positionElement(this.renderer, this.floatElement.nativeElement,
            this.origin, this.margin, this.placement, this.container);

        if (this.resize) {
            this.floatElementService.resizeElement(this.floatElement.nativeElement, this.origin);
        }

        this.init = true;
    }

    /**
     * @inheritDoc
     */
    public ngDoCheck(): void {

        //REVIEW descobrir o porque do angular chamar o ngDoCheck antes do evento de clique em
        // containers dialog e remover do if as comparações:
        // "(openedDialog == null || this.container == 'body')"
        const openedDialog = this.floatElementService.getOpenDialog();
        if (this.init && (openedDialog == null || this.container !== "body")) {

            if (this.resize) {
                this.floatElementService.resizeElement(this.floatElement.nativeElement, this.origin);
            }

            this.floatElementService.positionElement(this.renderer, this.floatElement.nativeElement, this.origin,
                this.margin, this.placement, this.container);
        }
    }

    /**
     * @inheritDoc
     */
    public ngOnDestroy(): void {

        if (this.document.body.contains(this.floatElement.nativeElement)) {
            this.renderer.removeChild(this.document.body, this.floatElement.nativeElement);
        }
    }
    //#endregion
}
