import {
    Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewEncapsulation
} from "@angular/core";
import { ITooltip } from "../../common/tooltip.interface";


/**
 * Componente de tooltip
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 29/04/2019
 */
@Component({
    selector: "etz-tooltip",
    templateUrl: "./tooltip.component.html",
    styleUrls: ["./tooltip.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class TooltipComponent implements ITooltip, OnChanges {

    //#region Private Methods
    /**
     * Título do tooltip
     */
    private _title: string;
    /**
     * Texto que será exibido no tooltip
     */
    private _contentText: string;
    /**
     * Url da imagem que será exibida no tooltip
     */
    private _contentImage: string;
    /**
     * Link externo para mais informações.
     */
    private _extraHelp: string;
    /**
     * Template para o conteúdo do Tooltip. Caso este binding for passado, o componente irá ignorar
     * {@link _contentText} e {@link _contentImage}.
     */
    private _contentTemplate: TemplateRef<any>;
    /**
     * Template para o tooltip inteiro.
     */
    private _template: TemplateRef<any>;
    /**
     * Lista de classe customizadas a serem aplicadas no tooltip, separadas por espaços.
     * @optional
     */
    private _tooltipStyle: {[key: string]: string};
    /**
     * Elemento no qual o tooltip terá como base para flutuar.
     */
    private _origin: HTMLElement;
    //#endregion

    //#region Getters / Setters
    /**
     * @Input
     * Recuperar título do tooltip
     */
    @Input()
    public get title(): string {
        return this._title;
    }
    /**
     * Definir título do tooltip
     * @param title Título do tooltip
     */
    public set title(title: string) {
        this._title = title;
    }
    /**
     * @Input
     * Recuperar texto que será exibido no tooltip
     */
    @Input()
    public get contentText(): string {
        return this._contentText;
    }

    /**
     * Definir texto que será exibido no tooltip
     * @param contentText Texto que será exibido no tooltip
     */
    public set contentText(contentText: string) {
        this._contentText = contentText;
    }
    /**
     * @Input
     * Recuperar url da imagem que será exibida no tooltip
     */
    @Input()
    public get contentImage(): string {
        return this._contentImage;
    }

    /**
     * Definir url da imagem que será exibida no tooltip
     * @param contentImage Url da imagem que será exibida no tooltip
     */
    public set contentImage(contentImage: string) {
        this._contentImage = contentImage;
    }

    /**
     * @Input
     * Recuperar link externo para mais informações.
     */
    @Input()
    public get extraHelp(): string {
        return this._extraHelp;
    }

    /**
     * Definir link externo para mais informações.
     * @param extraHelp Link externo para mais informações.
     */
    public set extraHelp(extraHelp: string) {
        this._extraHelp = extraHelp;
    }

    /**
     * @Input
     * Recuperar template para o conteúdo do Tooltip. Caso este binding for passado, o componente irá ignorar
     * {@link _contentText} e {@link _contentImage}.
     */
    @Input()
    public get contentTemplate(): TemplateRef<any> {
        return this._contentTemplate;
    }

    /**
     * Definir template para o conteúdo do Tooltip. Caso este for definido, o componente irá ignorar.
     * {@link _contentText} e {@link _contentImage}.
     * @param contentTemplate Template para o conteúdo do Tooltip.
     */
    public set contentTemplate(contentTemplate: TemplateRef<any>) {
        this._contentTemplate = contentTemplate;
    }

    /**
     * @Input
     * Recuperar template para o tooltip inteiro.
     */
    @Input()
    public get template(): TemplateRef<any> {
        return this._template;
    }

    /**
     * Definir Template para o tooltip inteiro.
     * @param template Template para o tooltip inteiro.
     */
    public set template(template: TemplateRef<any>) {
        this._template = template;
    }
    /**
     * @Input
     * Recuperar lista de classe customizadas a serem aplicadas no tooltip, separadas por espaços.
     * @optional
     */
    @Input()
    public get tooltipStyle(): {[p: string]: string} {
        return this._tooltipStyle;
    }

    /**
     * Definir lista de classe customizadas a serem aplicadas no tooltip, separadas por espaços.
     * @param tooltipStyle Lista de classe customizadas a serem aplicadas no tooltip, separadas por
     * espaços.
     */
    public set tooltipStyle(tooltipStyle: {[p: string]: string}) {
        this._tooltipStyle = tooltipStyle;
    }

    /**
     * @Input
     * Recuperar elemento no qual o tooltip terá como base para flutuar.
     */
    @Input()
    public get origin(): HTMLElement {
        return this._origin;
    }

    /**
     * Definir elemento no qual o tooltip terá como base para flutuar.
     * @param origin Elemento no qual o tooltip terá como base para flutuar.
     */
    public set origin(origin: HTMLElement) {
        this._origin = origin;
    }
    //#endregion

    //#region Constructor
    constructor() {
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.title != null) {
            this._title = changes.title.currentValue;
        }

        if (changes.contentText != null) {
            this._contentText = changes.contentText.currentValue;
        }

        if (changes.contentImage != null) {
            this._contentImage = changes.contentImage.currentValue;
        }

        if (changes.contentTemplate != null) {
            this._contentTemplate = changes.contentTemplate.currentValue;
        }

        if (changes.template != null) {
            this._template = changes.template.currentValue;
        }

        if (changes.tooltipStyle != null) {
            this._tooltipStyle = changes.tooltipStyle.currentValue;
        }
    }
    //#endregion
}
