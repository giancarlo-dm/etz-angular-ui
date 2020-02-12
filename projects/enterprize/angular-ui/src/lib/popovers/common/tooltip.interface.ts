import { TemplateRef } from "@angular/core";

/**
 * Interface contendo inputs/outputs base para implementação de um componente/diretiva de tooltip.
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 06/05/2019
 */
export interface ITooltip {

    //#region Inputs
    /**
     * @input
     * Título do tooltip
     */
    title?: string;
    /**
     * @input
     * Texto que será exibido no tooltip
     */
    contentText?: string;
    /**
     * @input
     * Url da imagem que será exibida no tooltip
     */
    contentImage?: string;
    /**
     * @input
     * Link externo para mais informações.
     */
    extraHelp?: string;
    /**
     * @input
     * Template para o conteúdo do Tooltip. Caso este binding for passado, o componente irá ignorar
     * {@link contentText} e {@link contentImage}.
     */
    contentTemplate?: TemplateRef<any>;
    /**
     * @input
     * Template para o tooltip inteiro.
     */
    template?: TemplateRef<any>;
    /**
     * @Input
     * Lista de classe customizadas a serem aplicadas no tooltip, separadas por espaços.
     * @optional
     */
    tooltipStyle?: {[key: string]: string};
    //#endregion
}
