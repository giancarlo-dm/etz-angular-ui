import { DatePipe, DOCUMENT } from "@angular/common";
import {
    Component, ElementRef, forwardRef, HostListener, Inject, Injector, Input, OnChanges,
    OnInit, SimpleChanges, ViewChild
} from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { distinctUntilChanged } from "rxjs/operators";

import { AbstractFormComponent } from "../../common/abstract-form-component.class";
import { EtzDateItem } from "../../common/date-item.class";

/**
 * @Component
 * Componente de datepicker.
 *
 * @since 18/03/2019
 */
@Component({
    selector: "etz-datepicker",
    templateUrl: "./datepicker.component.html",
    styleUrls: ["./datepicker.component.scss"],
    providers: [
        DatePipe,
        {
            provide: AbstractFormComponent,
            useExisting: forwardRef(() => DatepickerComponent),
            multi: true
        },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatepickerComponent),
            multi: true
        }
    ]
})
export class DatepickerComponent extends AbstractFormComponent<string | Date> implements OnInit, OnChanges {

    //#region Inputs
    /**
     * @Input
     * Nome do input
     * @default "wsDatepicker"
     */
    @Input()
    public name: string;
    /**
     * Flag para habilitar ou desabilitar o autocomplete
     * @default "on"
     */
    @Input()
    public inputAutoComplete: "on" | "off";
    /**
     * @Input
     * Formato que será exibido a data selecionada.
     * Variáveis de formato disponíveis
     * yyyy - Para ano. Ex: 2010;
     * MM - Para mês. Ex: 11;
     * dd - Para dia. Ex: 08;
     * Obs: O formato deve incluir as 3 variáveis.
     * @default 'dd/MM/yyyy'
     */
    @Input()
    public viewFormat: string;
    /**
     * @Input
     * Tipo do modelo que será utilizado pelo Datepicker.
     */
    @Input()
    public modelType: "DATE_OBJECT" | "STRING";
    /**
     * @Input
     * Timestamp que o datepicker utilizará em objetos selecionados.
     */
    @Input()
    public timestamp: "ZULU" | "LOCAL";
    /**
     * @Input
     * Flag que indica se o componente deve definir o vehicle como nulo quando o valor é inválido.
     * @default true
     */
    @Input()
    public nullModelOnInvalid: boolean;
    /**
     * @Input
     * Data mínima permitida. Esta opção desabilitará as datas inferiores a esta.
     */
    @Input()
    public minDate: Date;
    /**
     * @Input
     * Data máxima permitida. Esta opção desabilitará as datas superiores a esta.
     */
    @Input()
    public maxDate: Date;
    //#endregion

    //#region Public Attributes
    /**
     * Menu de referência do datepicker.
     */
    @ViewChild("datepickerMenu", {static: false})
    public datepickerMenu: ElementRef<HTMLElement>;
    /**
     * TODO: MIGRAR PARA VIEWCHILD
     * Controle de mês selecionado no calendário.
     */
    public monthFormControl: FormControl;
    /**
     * TODO: MIGRAR PARA VIEWCHILD
     * Controle de ano selecionado no calendário.
     */
    public yearFormControl: FormControl;
    /**
     * Matriz contendo os dias apresentados no calendário.
     */
    public days: Array<Array<EtzDateItem>>;
    /**
     * Mascara do datepicker.
     */
    public mask: string;
    /**
     * Flag que indica se o menu de calendário está aberto.
     * @default false
     */
    public isOpen: boolean;
    //#endregion

    //#region Protected Attributes
    /**
     * Elemento input nativo usado internamente para entrada de dados.
     */
    @ViewChild("inputElement", {static: true})
    protected inputElem: ElementRef<HTMLInputElement>;
    //#endregion

    //#region Private Attributes
    /**
     * Transformador de data padrão do angular
     */
    private readonly datePipe: DatePipe;
    /**
     * Flag que indica se o click do usuário foi dentro do componente.
     */
    private isInsideClick: boolean;
    /**
     * Data selecionada.
     */
    private selectedDate: EtzDateItem;
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, elementRef: ElementRef<HTMLElement>,
                injector: Injector, datePipe: DatePipe) {
        super(document, elementRef, injector, "etz-datepicker");

        //Privados
        this.datePipe = datePipe;

        //Públicos
        this.isOpen = false;
    }

    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnInit(): void {

        super.ngOnInit();
        this.viewFormat = this.viewFormat != null ? this.viewFormat : "dd/MM/yyyy";

        //Inicializar Form Controls
        this.initFormControls();
        // this.generateCalendar();
    }

    public ngOnChanges(changes: SimpleChanges): void {

        super.ngOnChanges(changes);

        this.name = this.name != null ? this.name : "wsDatepicker";
        this.viewFormat = this.viewFormat != null ? this.viewFormat : "dd/MM/yyyy";
        this.modelType = this.modelType != null ? this.modelType : "DATE_OBJECT";
        this.inputAutoComplete = this.inputAutoComplete != null ? this.inputAutoComplete : "off";
        this.timestamp = this.timestamp != null ? this.timestamp : "LOCAL";
        this.nullModelOnInvalid = this.nullModelOnInvalid != null ? this.nullModelOnInvalid : true;

        this.mask = this.viewFormat.replace(/[dMy]/g, "0");

        if (changes.minDate != null && !changes.minDate.isFirstChange()) {

            this.minDate = changes.minDate.currentValue;
            const etzDate: EtzDateItem = this.getEtzDateFromString(this.datepickerValue);

            if (this.nullModelOnInvalid && etzDate != null && etzDate.isDisabled) {
                this.model = null;
                this.datepickerValue = null;
                this.selectedDate = null;
            }
            else {
                this.ngControl.control.updateValueAndValidity();
            }
        }

        if (changes.maxDate != null && !changes.maxDate.isFirstChange()) {

            this.maxDate = changes.maxDate.currentValue;
            const etzDate: EtzDateItem = this.getEtzDateFromString(this.datepickerValue);

            if (this.nullModelOnInvalid && etzDate != null && etzDate.isDisabled) {
                this.model = null;
                this.datepickerValue = null;
                this.selectedDate = null;
            }
            this.ngControl.control.updateValueAndValidity();
        }
    }

    //#endregion

    //#region Getters and Setters
    /**
     * Valor do input que representa a data selecionada no datepicker.
     */
    protected get datepickerValue(): string {

        return this.inputElem.nativeElement.value;
    }

    protected set datepickerValue(value: string) {

        this.inputElem.nativeElement.value = value;
    }

    //#endregion

    //#region Public Methods
    /**
     * Processar evento entrada de dados do datepicker.
     * @param event (opcional) Evento InputEvent gerado
     */
    public onInput(event?: any): void {

        const etzDateItem = this.getEtzDateFromString(this.datepickerValue);
        if (etzDateItem == null) {

            this.model = null;
            this.selectedDate = null;
        }
        else if (etzDateItem.isDisabled) {

            if (this.nullModelOnInvalid) {
                this.model = null;
                this.selectedDate = null;
            }
            else {
                this.model = this.modelType === "STRING" ? etzDateItem.toString() :
                    etzDateItem.toDate(this.timestamp);
                this.ngControl.control.updateValueAndValidity();
            }
        }
        else {

            this.model = this.modelType === "STRING" ? etzDateItem.toString() :
                etzDateItem.toDate(this.timestamp);
            this.datepickerValue = this.datePipe.transform(this.model, this.viewFormat,
                this.timestamp === "ZULU" ? "UTC" : null);
            this.selectedDate = etzDateItem;

            this.yearFormControl.setValue(etzDateItem.year, {emitEvent: false});
            this.monthFormControl.setValue(etzDateItem.month, {emitEvent: false});
            this.generateCalendar();
        }
    }

    /**
     * Processar evento de desfoco do datepicker.
     * @param event (opcional) Evento InputEvent gerado
     */
    public onBlur(event?: any): void {

        const etzDate = this.getEtzDateFromString(this.datepickerValue);
        if (etzDate == null || etzDate.isDisabled) {

            if (this.nullModelOnInvalid) {

                this.model = null;
                this.datepickerValue = null;
                this.selectedDate = null;
            }
            else {
                this.ngControl.control.updateValueAndValidity();
            }
        }
        this.markAsTouched();
    }

    /**
     * Abrir calendário.
     */
    public openCalendar() {

        this.generateCalendar();

        this.isOpen = true;
    }

    /**
     * Selecionar data do calendário
     * @param etzDateItem Data a ser selecionada.
     */
    public selectDate(etzDateItem: EtzDateItem) {

        this.selectedDate = etzDateItem;

        if (this.modelType === "STRING") {
            this.model = etzDateItem.toString();
        }
        else {
            this.model = etzDateItem.toDate(this.timestamp);
        }

        this.datepickerValue = this.datePipe.transform(this.model, this.viewFormat,
            this.timestamp === "ZULU" ? "UTC" : null);

        if (!etzDateItem.isNextMonthDate && !etzDateItem.isLastMonthDate) {
            this.isOpen = false;
        }
        else {

            this.monthFormControl.setValue(etzDateItem.month, {emitEvent: false});
            this.yearFormControl.setValue(etzDateItem.year, {emitEvent: false});
            setTimeout(() => {
                this.generateCalendar();
            });
        }

        this.inputElem.nativeElement.focus();
    }

    /**
     * Event listener para o botão de voltar um mês no calendário
     */
    public previousMonth(): void {

        let month = Number(this.monthFormControl.value);
        let year = Number(this.yearFormControl.value);

        year = month - 1 < 0 ? year - 1 : year;
        month = month - 1 < 0 ? 11 : month - 1;

        //Emitir apenas evento do mẽs, pois ambos (re)fazem o calendário.
        this.yearFormControl.setValue(year, {emitEvent: false});
        this.monthFormControl.setValue(month);
    }

    /**
     * Event listener para o botão de avançar um mês no calendário
     */
    public nextMonth(): void {

        let month = Number(this.monthFormControl.value);
        let year = Number(this.yearFormControl.value);

        year = month + 1 == 12 ? year + 1 : year;
        month = month + 1 == 12 ? 0 : month + 1;

        //Emitir apenas evento do mẽs, pois ambos (re)fazem o calendário.
        this.yearFormControl.setValue(year, {emitEvent: false});
        this.monthFormControl.setValue(month);
    }

    /**
     * Retornar se a data passada como parametro esta desabilitada para seleção.
     * @param etzDateItem Objeto de item de data padrão do componente.
     */
    public isEtzDateDisabled(etzDateItem: EtzDateItem): boolean {

        if (this.minDate != null) {

            if (etzDateItem.year === this.minDate.getFullYear()) {

                if (etzDateItem.month === this.minDate.getMonth()) {
                    if (etzDateItem.day < this.minDate.getDate()) {
                        return true;
                    }
                }
                else if (etzDateItem.month < this.minDate.getMonth()) {
                    return true;
                }
            }
            else if (etzDateItem.year < this.minDate.getFullYear()) {
                return true;
            }
        }

        if (this.maxDate != null) {

            if (etzDateItem.year === this.maxDate.getFullYear()) {

                if (etzDateItem.month === this.maxDate.getMonth()) {
                    if (etzDateItem.day > this.maxDate.getDate()) {
                        return true;
                    }
                }
                else if (etzDateItem.month > this.maxDate.getMonth()) {
                    return true;
                }
            }
            else if (etzDateItem.year > this.maxDate.getFullYear()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Retornar se a data passada como parametro é a data selecionada.
     * @param etzDateItem Objeto de item de data padrão do componente.
     */
    public isEtzDateSelected(etzDateItem: EtzDateItem): boolean {

        return this.selectedDate != null && etzDateItem.year === this.selectedDate.year &&
            etzDateItem.month === this.selectedDate.month &&
            etzDateItem.day === this.selectedDate.day;
    }

    /**
     * Retornar se a data é referente ao dia de hoje.
     * @param etzDateItem Objeto de item de data padrão do componente.
     */
    public isEtzDateToday(etzDateItem: EtzDateItem): boolean {

        const currentDate: Date = new Date();
        return etzDateItem.year === currentDate.getFullYear() &&
            etzDateItem.month === currentDate.getMonth() &&
            etzDateItem.day === currentDate.getDate();
    }

    //#endregion

    //#region Protected Methods
    /**
     * @inheritDoc
     */
    protected onOuterChange(oldModelValue: string | Date, newModelValue: string | Date): void {

        if (this.model == null) {
            this.datepickerValue = null;
        }
        else {

            setTimeout(() => {

                this.datepickerValue = this.datePipe.transform(this.model, this.viewFormat,
                    this.timestamp === "ZULU" ? "UTC" : null);

                const etzDateItem = this.getEtzDateFromString(this.datepickerValue);
                if (etzDateItem != null) {

                    this.selectedDate = etzDateItem;
                    this.yearFormControl.setValue(etzDateItem.year, {emitEvent: false});
                    this.monthFormControl.setValue(etzDateItem.month, {emitEvent: false});
                    // this.generateCalendar();
                }
            });
        }
    }

    //#endregion

    //#region Private Methods
    /**
     * Inicializar controles de formulario internos do componente.
     */
    private initFormControls(): void {

        const date: Date = new Date();

        // Inicializar controles do formulário
        this.monthFormControl = new FormControl(date.getMonth());
        this.yearFormControl = new FormControl(date.getFullYear());

        this.monthFormControl.valueChanges
            .pipe(
                distinctUntilChanged()
            )
            .subscribe(() => this.generateCalendar());

        this.yearFormControl.valueChanges
            .pipe(
                distinctUntilChanged()
            )
            .subscribe(() => this.generateCalendar());
    }

    /**
     * Gerar calendário com base nos form controls de mês e ano.
     */
    private generateCalendar(): void {

        const month = Number(this.monthFormControl.value);
        const year = Number(this.yearFormControl.value);

        //Inicio do mês exibido.
        const date: Date = new Date("1970-01-01 00:00:00");
        date.setFullYear(year, month);

        let day: number = date.getDate();

        //Buscar último dia do mês selecionado.
        const lastDate: Date = new Date("1970-01-01 00:00:00");
        lastDate.setFullYear(year, date.getMonth() + 1, 0);
        let lastDay: number = lastDate.getDate();

        //Buscar os dias que serão necessários exibir do último mês.
        const lastMonth: Date = new Date("1970-01-01 00:00:00");
        lastMonth.setFullYear(year, month);
        lastMonth.setDate(0);
        lastMonth.setDate(lastMonth.getDate() - (date.getDay() - 1));
        let lastMonthDay: number = lastMonth.getDate();

        let nextMonthDay: number = 1;

        //Flag que indica quando o loop deve ser parado pois o calendário já está preenchido.
        let breakOnNextLoop: boolean = false;

        this.days = [];
        for (let week = 0; week <= 5; week++) {

            this.days[week] = [];
            for (let weekDay = 0; weekDay <= 6; weekDay++) {

                let wsDateItem: EtzDateItem;

                //Dias do mês anterior
                if (week === 0 && weekDay < date.getDay()) {

                    wsDateItem = new EtzDateItem(lastMonth.getFullYear(), lastMonth.getMonth(),
                        lastMonthDay, weekDay, false, true, false, false, false);
                    lastMonthDay++;
                }
                //Dias do mês seguinte
                else if (day > lastDay) {

                    const nextMonthYear = month + 1 == 12 ? year + 1 : year;
                    const nextMonth = month + 1 == 12 ? 0 : month + 1;

                    wsDateItem = new EtzDateItem(nextMonthYear, nextMonth, nextMonthDay, weekDay,
                        false, false, true, false, false);
                    breakOnNextLoop = true;
                    nextMonthDay++;
                }
                //Dias do mês corrente
                else {

                    wsDateItem = new EtzDateItem(year, month, day, weekDay, false,
                        false, false, false, false);

                    if (weekDay === 6 && day == lastDay) {
                        breakOnNextLoop = true;
                    }
                    day++;
                }

                wsDateItem.isSelected = this.isEtzDateSelected(wsDateItem);
                wsDateItem.isDisabled = this.isEtzDateDisabled(wsDateItem);
                wsDateItem.isToday = this.isEtzDateToday(wsDateItem);

                this.days[week][weekDay] = wsDateItem;
            }

            if (breakOnNextLoop) {
                break;
            }
        }
    }

    /**
     * Retornar um objeto date padrão do componente baseado no formato passado por binding e na
     * string passada como parâmetro.
     * @param dateString Data em formato de texto.
     */
    private getEtzDateFromString(dateString: string): EtzDateItem {

        // Valor do ano
        const yearStartIndex = this.viewFormat.indexOf("y");
        const yearEndIndex = this.viewFormat.lastIndexOf("y");
        let stringYear = "";
        for (let i = yearStartIndex; i <= yearEndIndex; i++) {
            stringYear += dateString[i];
        }

        // Valor do mês
        const monthStartIndex = this.viewFormat.indexOf("M");
        const monthEndIndex = this.viewFormat.lastIndexOf("M");
        let stringMonth = "";
        for (let i = monthStartIndex; i <= monthEndIndex; i++) {
            stringMonth += dateString[i];
        }

        // Valor do dia
        const dayStartIndex = this.viewFormat.indexOf("d");
        const dayEndIndex = this.viewFormat.lastIndexOf("d");
        let stringDay = "";
        for (let i = dayStartIndex; i <= dayEndIndex; i++) {
            stringDay += dateString[i];
        }

        const year = Number(stringYear);
        const month = Number(stringMonth);
        const day = Number(stringDay);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return null;
        }
        else {

            const date: Date = new Date(Date.UTC(year, month - 1, day));

            const etzDateItem = new EtzDateItem(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            etzDateItem.isDisabled = this.isEtzDateDisabled(etzDateItem);
            return etzDateItem;
        }
    }

    //#endregion

    //#region Host Listeners
    /**
     * @HostListener
     * Event listener para eventos de clique dentro do componente.
     */
    @HostListener("click")
    public clickInside() {

        this.isInsideClick = true;
    }

    /**
     * @HostListener
     * Event listener para eventos de clique em qualquer parte do documento inteiro.
     */
    @HostListener("document:click", ["$event"])
    public handleClickEvent(event: MouseEvent) {

        if (this.datepickerMenu != null &&
            !this.datepickerMenu.nativeElement.contains(event.target as Node) &&
            this.isInsideClick == false) {
            this.isOpen = false;
        }

        this.isInsideClick = false;
    }

    //#endregion
}
