import { NgModule } from "@angular/core";

import { EtzCoreModule } from "./core/core.module";
import { EtzFormControlsModule } from "./form-controls/form-controls.module";
import { EtzMiscModule } from "./misc/misc.module";
import { EtzPopoversModule } from "./popovers/popovers.module";

@NgModule({
    declarations: [],
    imports: [
        EtzCoreModule,
        EtzFormControlsModule,
        EtzMiscModule,
        EtzPopoversModule,
    ],
    exports: [
        EtzCoreModule,
        EtzFormControlsModule,
        EtzMiscModule,
        EtzPopoversModule,
    ]
})
export class AngularUiModule {
}
