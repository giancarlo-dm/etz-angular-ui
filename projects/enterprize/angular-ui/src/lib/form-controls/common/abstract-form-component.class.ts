import {
    AfterViewInit, ElementRef, EventEmitter, HostBinding, HostListener, Injector, Input, OnChanges,
    OnInit, Output, QueryList, SimpleChanges, ViewChildren
} from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

// import { TooltipOptions } from "../../popovers/common";

/**
 * Base class of all form controls components. Provides common functionality to components such as
 * labels and tooltip. Also provides common layout placement options.
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 18/04/2019
 */
export abstract class AbstractFormComponent<T> implements AfterViewInit, ControlValueAccessor, OnInit,
    OnChanges {

    //#region Private Static Attributes
    /**
     * Component id sequence generator.
     */
    private static idSequence: number = 1;
    //#endregion

    //#region Input Bindings
    /**
     * @Input
     * Component label.
     * @optional
     */
    @Input()
    public label: string;
    /**
     * @Input
     * Components disposition. Vertical: the label is above the component. Horizontal: the label is
     * on the left side of the component.
     * @default "VERTICAL"
     */
    @Input()
    public orientation: "HORIZONTAL" | "VERTICAL";
    /**
     * @Input
     * Custom style to be applied on the etz-label component. The syntax is the same as in ngStyle
     * directive.
     * @optional
     */
    @Input()
    public labelStyle: {[key: string]: string|number};
    /**
     * @Input
     * Tooltip para informações de ajuda.
     * @optional
     */
    // @Input()
    // public tooltip: TooltipOptions;
    /**
     * @Input
     * Custom style to be applied on the control container html tag. The syntax is the same as in ngStyle
     * directive.
     * @optional
     */
    @Input()
    public controlStyle: {[key: string]: string|number};
    /**
     * @Input
     * List of validation messages. An object where the key is de validation error code and the value
     * is the message.
     * @optional
     */
    @Input()
    public messages: {[validatorKey: string]: string};
    /**
     * @Input
     * Flag to enable image visual feedback. A green check when valid, a red cross when invalid
     * alongside the components input.
     * @default false
     */
    @Input()
    public imageFeedback: boolean;
    /**
     * @Input
     * Flag that signals the control that it is on readonly mode.
     * @default false
     */
    @Input()
    public readonly: boolean;
    //#endregion

    //#region Two Way Bindings
    /**
     * @TwoWay
     * Components id. You may register an listener on {@link idChange} event to get this components
     * generated id.
     * @default sequence generated with a prefix based on component selector.
     */
    @Input()
    public id: string;
    /**
     * @Output
     * Event emitter of components id update.
     */
    @Output()
    public idChange: EventEmitter<string> = new EventEmitter<string>();
    //#endregion

    //#region Protected Attributes
    /**
     * Referêcia ao {@link Document} do DOM.
     * @injected
     */
    protected readonly document: Document;
    /**
     * Referência do elemento do comoponente.
     * @injected
     */
    protected readonly elementRef: ElementRef<HTMLElement>;
    /**
     * Referência ao serviço injeção de dependência do Angular.
     * @injected
     */
    protected readonly injector: Injector;
    /**
     * Prefixo a ser utilizado na geração de ids.
     * @default ws-abstract-component
     * @injected
     */
    protected readonly idPrefix: string;
    /**
     * @ViewChildren
     * Lista de itens navegáveis pelas setas de teclado.
     */
    @ViewChildren("etzNavigable")
    protected navigableElements: QueryList<ElementRef<HTMLElement>>;
    //#endregion

    //#region Private Attributes
    /**
     * Id do componente padrão. Usado para labels e o controle que a label ativa ao ser clicada.
     */
    private readonly defaultId: string;
    /**
     * Callback a ser invocado em eventos de atualização de valor a partir da UI.
     * @callback
     */
    private onChange: (value: T) => void = () => undefined;
    /**
     * Callback a ser invocado quando ocorrer interação do usuário com o componente.
     * @callback
     */
    private onTouched: () => void = () => undefined;
    /**
     * Valor atual do modelo.
     * @property
     */
    private _model: T;
    /**
     * Flag que identifica o status de "desabilitado" atual do componente.
     * @readonlyProperty
     */
    private _isDisabled: boolean;
    /**
     * NgControl do componente.
     * @readonlyProperty
     */
    private _ngControl: NgControl;
    //#endregion

    //#region Host Bindings
    /**
     * @HostBinding
     * Aplica classe base .etz-component no elemento host do componente.
     */
    @HostBinding("class.etz-component")
    public readonly etzComponent: boolean = true;
    /**
     * @HostBinding
     * Aplica classe para disposição vertical do componente.
     */
    @HostBinding("class.etz-vertical")
    public get verticalOrientation(): boolean {
        return this.orientation === "VERTICAL";
    }
    /**
     * @HostBinding
     * Aplica classe para disposição horizontal do componente.
     */
    @HostBinding("class.etz-horizontal")
    public get horizontalOrientation(): boolean {
        return this.orientation === "HORIZONTAL";
    }
    //#endregion

    //#region Constructor
    protected constructor(document: Document, elementRef: ElementRef<HTMLElement>,
                          injector: Injector, idPrefix: string = "etz-abstract-component") {

        // Injetados
        this.document = document;
        this.elementRef = elementRef;
        this.injector = injector;
        this.idPrefix = idPrefix;

        // Públicos
        this.defaultId = `${this.idPrefix}-${AbstractFormComponent.idSequence++}`;

        // Privados
        this.onChange = () => undefined;
        this.onTouched = () => undefined;
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnInit(): void {

        if (this.id == null) {
            this.id = this.defaultId;
            this.idChange.emit(this.id);
        }

        this.orientation = this.orientation != null ? this.orientation : "VERTICAL";
        this.imageFeedback = this.imageFeedback != null ? this.imageFeedback : false;
        this.readonly = this.readonly != null ? this.readonly : false;
    }

    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.id != null && !changes.id.isFirstChange()) {

            if (this.id == null) {

                this.id = this.defaultId;
                this.idChange.emit(this.id);
            }
        }

        this.orientation = this.orientation != null ? this.orientation : "VERTICAL";
        this.imageFeedback = this.imageFeedback != null ? this.imageFeedback : false;
        this.readonly = this.readonly != null ? this.readonly : false;
    }

    /**
     * @inheritDoc
     */
    public ngAfterViewInit(): void {

        this._ngControl = this.injector.get(NgControl, null);
    }
    //#endregion

    //#region Getters and Setters
    /**
     * Valor do modelo atual.
     */
    protected get model(): T {
        return this._model;
    }

    protected set model(modelValue: T) {
        this._model = modelValue;
        this.onChange(modelValue);
    }

    /**
     * Flag que identifica o status de “desabilitado” atual do componente.
     * @readonly
     */
    public get isDisabled(): boolean {
        return this._isDisabled;
    }

    /**
     * NgControl do componente
     */
    public get ngControl(): NgControl {
        return this._ngControl;
    }
    //#endregion

    //#region Host Listeners
    /**
     * @HostListener
     * Event listener para eventos de pressionamento de tecla "Escape". Usado para tirar o foco do
     * componente simulando a saída do usuário na iteração com o componente.
     * @param event O evento de teclado gerado.
     */
    @HostListener("keydown.escape", ["$event"])
    public onEscKeyPress(event: KeyboardEvent): void {

        this.document.body.click();
    }

    /**
     * @HostListener
     * Event listener para evento de pressionamento das teclas de navegação (e.g. Setas - ArrowUp,
     * ArrowDown, ArrowLeft, ArrowRight). Usado para navegação por teclado (troca de foco entre
     * itens demarcados com "#etzNavigable").
     * @param event O evento de teclado gerado
     */
    @HostListener("keydown.arrowUp", ["$event"])
    @HostListener("keydown.arrowDown", ["$event"])
    @HostListener("keydown.arrowLeft", ["$event"])
    @HostListener("keydown.arrowRight", ["$event"])
    public onNavigationKeyPress(event: KeyboardEvent): void {

        const navigableElements: Array<ElementRef<HTMLElement>> = this.navigableElements.toArray();
        for (let i: number = 0; i < navigableElements.length; i++) {

            if (navigableElements[i].nativeElement === this.document.activeElement) {

                event.preventDefault();

                if (event.key === "ArrowDown" || event.key === "ArrowRight") {

                    let k: number = i + 1;
                    while (k < navigableElements.length) {

                        const elementToFocus: HTMLElement = navigableElements[k].nativeElement;

                        if (elementToFocus.offsetParent != null &&
                            !Boolean((elementToFocus as any).disabled)) {
                            navigableElements[k].nativeElement.focus();
                            break;
                        }

                        k++;
                    }
                }
                else {

                    let k: number = i - 1;
                    while (k >= 0) {

                        const elementToFocus: HTMLElement = navigableElements[k].nativeElement;

                        if (elementToFocus.offsetParent != null &&
                            !Boolean((elementToFocus as any).disabled)) {
                            navigableElements[k].nativeElement.focus();
                            break;
                        }

                        k--;
                    }
                }

                break;
            }
        }
    }
    //#endregion

    //#region ControlValueAccessor Methods
    /**
     * @inheritDoc
     */
    public registerOnChange(cb: (value: T) => void): void {
        this.onChange = cb;
    }

    /**
     * @inheritDoc
     */
    public registerOnTouched(cb: () => void): void {
        this.onTouched = cb;
    }

    /**
     * @inheritDoc
     */
    public setDisabledState(isDisabled: boolean): void {
        this._isDisabled = isDisabled;
    }

    /**
     * @inheritDoc
     */
    public writeValue(modelValue: T): void {

        const oldModelValue: T = this._model;
        this._model = modelValue;
        this.onOuterChange(oldModelValue, modelValue);
    }
    //#endregion

    //#region Public Methods
    /**
     * Marcar o componente como tocado.
     */
    public markAsTouched(): void {
        this.onTouched();
    }
    //#endregion

    //#region Protected Methods
    /**
     * Listener de evento para alterações realizadas de fora do componente.
     * @param oldModelValue Valor do modelo antigo
     * @param newModelValue Novo valor
     */
    protected abstract onOuterChange(oldModelValue: T, newModelValue: T): void;
    //#endregion
}
