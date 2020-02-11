import { DOCUMENT } from "@angular/common";
import {
    Component, ElementRef, forwardRef, Inject, Injector, Input, SimpleChanges, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { AbstractControl, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { IllegalArgumentException, NotImplementedYetException } from "@enterprize/exceptions";
import { StringFormatter } from "@enterprize/string-formatter";
import { BigNumber } from "bignumber.js";

import { AbstractFormComponent } from "../../common/abstract-form-component.class";
import { InputType } from "../../common/input-type.enum";


/**
 * @Component
 * Componente básico de entrada de dados (análogo a <input>). Pode ser customizado para aceitar máscaras,
 * tipo (number, email, tel, color, password, search, url)
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 12/06/2019
 */
@Component({
    selector: "etz-input",
    templateUrl: "./input.component.html",
    styleUrls: ["./input.component.scss"],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent extends AbstractFormComponent<string|number> implements Validator {

    //#region Protected Static Attributes
    /**
     * Formatador monetário.
     */
    protected static currencyFormatter: StringFormatter = new StringFormatter("$ #.##0,00", {reverse: true});
    /**
     * Formatador de porcentagem.
     */
    protected static percentFormatter: StringFormatter = new StringFormatter("#.##0,00%", {reverse: true});
    /**
     * Formatador numérico,
     */
    protected static numberFormatter: StringFormatter = new StringFormatter("#.##0", {reverse: true});
    //#endregion

    //#region Inputs
    /**
     * @Input
     * Tipo do input.
     * @default "text"
     */
    @Input()
    public inputType: InputType;
    /**
     * @Input
     * Tamanho diferenciado do input.
     */
    @Input()
    public inputSize: "sm"|"lg";
    /**
     * @Input
     * Nome do input a ser usado.
     */
    @Input()
    public inputName: string;
    /**
     * @Input
     * Atributo "title" a ser aplicado no input
     */
    @Input()
    public inputTitle: string;
    /**
     * @Input
     * Flag para habilitar ou desabilitar o autocomplete
     * @default "on"
     */
    @Input()
    public inputAutocomplete: "on"|"off";
    /**
     * @Input
     * Tipo de máscara a ser usada. Prevalece sobre {@link mask}. Se usado, {@link inputType} será "text".
     */
    @Input()
    public maskType: "currency"|"percent"|"number";
    /**
     * @Input
     * Máscara customizada. Se usado {@link inputType} será "text".
     */
    @Input()
    public customMask: string;
    //#endregion

    //#region Protected Methods
    /**
     * Callback a ser invocado para reexecutar a validação. Usado quando ocorreu alguma alteração de
     * estado interno que pode afetar a validação.
     * @callback
     */
    protected onValidatorChange: () => void = () => undefined;
    /**
     * Elemento input nativo usado internamente para entrada de dados.
     */
    @ViewChild("inputElement", {static: true})
    protected inputElem: ElementRef<HTMLInputElement>;
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, elementRef: ElementRef<HTMLElement>,
                injector: Injector) {
        super(document, elementRef, injector, "etz-input");
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnInit(): void {
        super.ngOnInit();

        // Default bindings
        this.inputType = this.inputType != null ? this.inputType : "text";
        this.inputAutocomplete = this.inputAutocomplete != null ? this.inputAutocomplete : "on";
        this.inputElem.nativeElement.type = this.inputType;
    }

    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        this.inputAutocomplete = this.inputAutocomplete != null ? this.inputAutocomplete : "on";

        if (changes.maskType != null) {

            if (this.maskType === "currency" || this.maskType === "percent" || this.maskType === "number") {
                this.inputType = "text";
            }
            else {
                throw new IllegalArgumentException(`Unknown mask type: "${this.maskType}"`, "maskType");
            }
        }

        if (changes.inputType != null && !changes.inputType.firstChange &&
            this.maskType == null && this.customMask == null) {

            this.inputType = this.inputType != null ? this.inputType : "text";
            this.inputElem.nativeElement.type = this.inputType;

            if (this.model == null) {
                this.inputValue = null;
            }
            else {
                if (this.inputType === "number") {
                    let number: number = Number(this.model);
                    this.inputValue = Number.isNaN(number) ? null : number;
                }
                else {
                    this.inputValue = String(this.model);
                }
            }
        }
    }
    //#endregion

    //#region Getters and Setters
    /**
     * Valor inicial do input. Setado na inicialização ou quando alteração externa ocorrer efetuando
     * override no modelo.
     */
    protected get inputValue(): string|number {

        if (this.inputElem.nativeElement.type === "number") {
            return this.inputElem.nativeElement.valueAsNumber;
        }
        else {
            return this.inputElem.nativeElement.value;
        }
    }

    protected set inputValue(value: string|number) {

        if (this.inputElem.nativeElement.type === "number") {
            this.inputElem.nativeElement.valueAsNumber = value != null ? Number(value) : NaN;
        }
        else {
            this.inputElem.nativeElement.value = value != null ? String(value) : "";
        }
    }
    //#endregion

    //#region Validator Methods
    /**
     * @inheritDoc
     */
    public registerOnValidatorChange(cb: () => void): void {
        this.onValidatorChange = cb;
    }

    /**
     * @inheritDoc
     */
    public validate(control: AbstractControl): ValidationErrors | null {
        return null;
    }
    //#endregion

    //#region AbstractFormComponent Methods
    /**
     * @inheritDoc
     */
    protected onOuterChange(oldModelValue: string|number, newModelValue: string|number): void {

        if (this.model == null) {
            this.inputValue = null;
        }
        else if (this.maskType != null || this.customMask != null) {

            const maskResult: [string, string|number] = this.processMask(this.model);
            this.inputValue = maskResult[0];
        }
        else {
            this.inputValue = this.model;
        }
    }
    //#endregion

    //#region Public Methods
    /**
     * Processar evento entrada de dados do input.
     * @param event (opcional) Evento InputEvent gerado
     */
    public onInput(event?: any): void {

        if ((typeof this.inputValue === "string" && this.inputValue.length === 0) ||
            typeof this.inputValue === "number" && Number.isNaN(this.inputValue)) {
            this.model = null;
        }
        else if (this.maskType != null || this.customMask != null) {

            const maskResult: [string, string|number] = this.processMask(this.inputValue, event);
            this.inputValue = maskResult[0];
            this.model = maskResult[1];
        }
        else {

            if (this.inputValue != this.model) {
                this.model = this.inputValue;
            }
        }
    }
    //#endregion

    //#region Protected Methods
    /**
     * Processar entrada de dados aplicando a mascara adequada
     * @param value Valor a ser processado (pode ser de modelo ou de visão)
     * @param event (opcional) Evento de etrada de dados ('input'). Algumas mascaras tem comportamento
     * diferente na presença deste evento.
     */
    protected processMask(value: string|number, event?: any): [string, string|number] {

        if (this.maskType != null) {

            if (this.maskType === "currency") {
                return this.currencyMask(value);
            }
            else if (this.maskType === "percent") {
                return this.percentMask(value, event != null ? event.inputType === "deleteContentBackward" : false);
            }
            else {
                return this.numberMask(value);
            }
        }
        else {
            //TODO implementar processamento de mascara comum
            throw new NotImplementedYetException("Custom masks are not implemented yet.");
        }
    }

    /**
     * Aplicar máscara monetária.
     * @param value
     */
    protected currencyMask(value: string|number): [string, number] {

        let strValue: string;
        if (typeof value === "number") {
            strValue = new BigNumber(value).multipliedBy(100).toString();
        }
        else {
            strValue = value;
        }

        strValue = strValue.replace(/\D/gi, "");
        strValue = strValue.replace(/^0+/, "");

        const maskedValue: string = InputComponent.currencyFormatter.apply(strValue.length > 0 ? strValue : "0");
        const modelValue = Number(strValue.slice(0, strValue.length - 2) + "." +
            strValue.slice(strValue.length - 2, strValue.length).padStart(2, "0"));

        return [maskedValue, modelValue];
    }

    /**
     * Aplicar máscara de porcentagem.
     * @param value
     * @param backSpace
     */
    protected percentMask(value: string|number, backSpace: boolean = false): [string, number] {

        let strValue: string;
        if (typeof value === "number") {
            strValue = new BigNumber(value).multipliedBy(100).toString();
        }
        else {
            strValue = value;
        }

        strValue = strValue.replace(/\D/gi, "");
        strValue = strValue.replace(/^0+/, "");
        if (backSpace && strValue.length > 0) {
            strValue = strValue.slice(0, strValue.length - 1);
        }

        const maskedValue: string = InputComponent.percentFormatter.apply(strValue.length > 0 ? strValue : "0");
        const modelValue: number = new BigNumber(strValue.slice(0, strValue.length - 2) + "." +
            strValue.slice(strValue.length - 2, strValue.length).padStart(2, "0")).dividedBy(100).toNumber();

        return [maskedValue, modelValue];
    }

    /**
     * Aplicar máscara numérica.
     * @param value
     */
    protected numberMask(value: string|number): [string, number] {

        let strValue: string;
        if (typeof value === "number") {
            strValue = new BigNumber(value).toString();
        }
        else {
            strValue = value;
        }

        strValue = strValue.replace(/\D/gi, "");
        strValue = strValue.replace(/^0+/, "");

        const maskedValue: string = InputComponent.numberFormatter.apply(strValue.length > 0 ? strValue : "0");
        const modelValue: number = Number(strValue);

        return [maskedValue, modelValue];
    }
    //#endregion
}
