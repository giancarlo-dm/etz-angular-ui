/**
 * Classe referente aos items de data do Componente {@link DatepickerComponent}
 *
 * @since 10/04/2019
 */
export class EtzDateItem {

    //#region Properties
    /**
     * Ano da data.
     */
    public year: number;
    /**
     * Mês da data.
     */
    public month: number;
    /**
     * Dia da data.
     */
    public day: number;
    /**
     * Dia da semana da data, de 0 para domingo até 6 para sabado.
     */
    public weekDay: number;
    /**
     * Flag que indica se a data está disabilitada para seleção.
     */
    public isDisabled: boolean;
    /**
     * Flag que indica se a data é do mês anterior ao mês exibido no calendário.
     */
    public isLastMonthDate: boolean;
    /**
     * Flag que indica se a data é do mês seguinte ao mês exibido no calendário.
     */
    public isNextMonthDate: boolean;
    /**
     * Flag que indica se a data está selecionada.
     */
    public isSelected: boolean;
    /**
     * Flag que indica se a data é referente ao dia atual.
     */
    public isToday: boolean;
    //#endregion

    //#region Constructor
    constructor(instance: EtzDateItem);
    constructor(year: number, month: number, day: number, weekDay?: number, isDisabled?: boolean, isLastMonthDate?: boolean,
    isNextMonthDate?: boolean, isSelected?: boolean, isToday?: boolean);
    constructor(...args: any[]) {

        if (args[0] instanceof EtzDateItem) {
            this.initWithInstance(args[0] as EtzDateItem);
        }
        else {
            this.initWithArgs(args);
        }
    }

    private initWithInstance(dateItem: EtzDateItem): void {

        this.year = dateItem.year;
        this.month = dateItem.month;
        this.day = dateItem.day;
        this.weekDay = dateItem.weekDay;
        this.isDisabled = dateItem.isDisabled;
        this.isLastMonthDate = dateItem.isLastMonthDate;
        this.isNextMonthDate = dateItem.isNextMonthDate;
        this.isSelected = dateItem.isSelected;
        this.isToday = dateItem.isToday;
    }

    private initWithArgs(args: any[]): void {

        this.year = args[0];
        this.month = args[1];
        this.day = args[2];
        this.weekDay = args[3];
        this.isDisabled = args[4];
        this.isLastMonthDate = args[5];
        this.isNextMonthDate = args[6];
        this.isSelected = args[7];
        this.isToday = args[8];
    }
    //#endregion

    //#region Public Methods
    /**
     * Retornar no tipo Date o item de data do Enterprize
     * @param timestamp Timestamp a ser usado.
     */
    public toDate(timestamp: "ZULU" | "LOCAL"): Date {

        if (timestamp === "ZULU") {
            return new Date(Date.UTC(this.year, this.month, this.day));
        }
        else {

            let date = new Date("1970-01-01 00:00:00");
            date.setFullYear(this.year, this.month, this.day);
            return date;
        }
    }

    /**
     * Retornar no tipo String o item de data do Enterprize.
     */
    public toString(): string {

       return `${this.year}-${this.month+1}-${this.day}`;
    }
    //#endregion
}
