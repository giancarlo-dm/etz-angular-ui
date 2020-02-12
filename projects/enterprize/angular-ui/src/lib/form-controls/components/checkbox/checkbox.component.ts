import {
    Component, ElementRef, EventEmitter, forwardRef, Inject, Injector, Input, Output, SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { DOCUMENT } from "@angular/common";

import { AbstractFormComponent } from "../../common/abstract-form-component.class";

@Component({
    selector: "etz-checkbox",
    templateUrl: "./checkbox.component.html",
    styleUrls: ["./checkbox.component.scss"],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent extends AbstractFormComponent<boolean> {

    //#region Inputs
    /**
     * @Input
     * Status do switcher
     * @bidirectional
     */
    @Input()
    public value: boolean;
    /**
     * @Output
     * Emissor de eventos de alteração de status do switcher
     */
    @Output()
    public valueChange: EventEmitter<boolean> = new EventEmitter();
    //#endregion

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, elementRef: ElementRef<HTMLElement>,
                injector: Injector) {
        super(document, elementRef, injector, "etz-checkbox");
    }
    //#endregion

    //#region Lifecycle Hooks
    /**
     * @inheritDoc
     */
    public ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        if (changes.value != null) {
            this.model = changes.value.currentValue;
        }

        this.orientation = "HORIZONTAL";
    }
    //#endregion

    public getModel(): boolean {
        return this.model;
    }

    public setModel(): void {
        this.model = !this.model;
        this.valueChange.emit(this.model);
    }

    //#region AbstractFormComponent Methods
    /**
     * @inheritDoc
     */
    protected onOuterChange(oldModelValue: boolean, newModelValue: boolean): void {
        //Not used
    }
    //#endregion

    //#region Public Methods
    /**
     *
     * @param event
     */
    public onCheckboxChange(event: Event) {

        this.model = (event.target as HTMLInputElement).checked;
        this.valueChange.emit(this.model);
    }
    //#endregion
}
