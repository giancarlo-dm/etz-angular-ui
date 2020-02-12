import { DOCUMENT } from "@angular/common";
import {
    Component, ElementRef, forwardRef, Inject, Injector, ViewEncapsulation
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { CheckboxComponent } from "../checkbox/checkbox.component";

/**
 * @Component
 * Componente de switcher (checkbox em formato diferenciado).
 *
 * @author Giancarlo Dalle Mole
 * @since 06/06/2019
 */
@Component({
    selector: "etz-switcher",
    templateUrl: "./switcher.component.html",
    styleUrls: ["./switcher.component.scss"],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitcherComponent),
            multi: true
        }
    ]
})
export class SwitcherComponent extends CheckboxComponent {

    //#region Constructor
    constructor(@Inject(DOCUMENT) document: any, elementRef: ElementRef<HTMLElement>,
                injector: Injector) {
        super(document, elementRef, injector);
    }
    //#endregion
}
