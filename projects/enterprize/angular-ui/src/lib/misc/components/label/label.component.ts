import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from "@angular/core";

// import { TooltipOptions } from "../../../popovers";

/**
 * @Component
 * Componente de label padrão.
 *
 * @author Giancarlo Dalle Mole
 * @since 22/04/2019
 */
@Component({
    selector: "etz-label",
    templateUrl: "./label.component.html",
    styleUrls: ["./label.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class LabelComponent implements OnChanges {

    //#region Inputs
    /**
     * @Input
     * Id a ser definido no atributo [for] da tag <label>
     */
    @Input()
    public forId: string;
    /**
     * @Input
     * Texto da label a ser exibido.
     */
    @Input()
    public label: string;
    /**
     * @Input
     * Texto ou template do tooltip.
     */
    // @Input()
    // public tooltip: TooltipOptions;
    /**
     * @Input
     * Flag que indica se é requerido. Em componentes etz-* não é necessário pois irá ser obtido a
     * partir do atributo [required] no componente.
     */
    @Input()
    public required: boolean;
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {

        // if (this.tooltip != null) {
        //     this.tooltip.margin = this.tooltip.margin != null ? this.tooltip.margin : 5;
        //     this.tooltip.placement = this.tooltip.placement != null ? this.tooltip.placement : "top-right";
        // }
    }
    //#endregion
}
