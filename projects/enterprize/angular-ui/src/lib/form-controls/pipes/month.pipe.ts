import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe para retornar o nome do mês a partir de seu número (Date JS)
 *
 * @author Tcharles Michael Moraes
 * @since 09/04/2019
 */
@Pipe({name: "etzMonth"})
export class MonthPipe implements PipeTransform {

    /**
     * @inheritDoc
     */
    public transform(value: number | string): string {

        value = Number(value);

        switch (value) {

            case 0:
                return "Janeiro";
            case 1:
                return "Fevereiro";
            case 2:
                return "Março";
            case 3:
                return "Abril";
            case 4:
                return "Maio";
            case 5:
                return "Junho";
            case 6:
                return "Julho";
            case 7:
                return "Agosto";
            case 8:
                return "Setembro";
            case 9:
                return "Outubro";
            case 10:
                return "Novembro";
            case 11:
                return "Dezembro";
            default:
                return "Mês inválido!";
        }
    }
}