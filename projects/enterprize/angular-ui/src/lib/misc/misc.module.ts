import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { EtzCoreModule } from "../core/core.module";
import { EtzPopoversModule } from "../popovers/popovers.module";

import { LabelComponent } from "./components/label/label.component";

export * from "./components/label/label.component";

@NgModule({
    imports: [
        // Angular
        CommonModule,
        ReactiveFormsModule,
        // Lib Module
        EtzCoreModule,
        EtzPopoversModule
    ],
    declarations: [
        // Components
        LabelComponent
    ],
    exports: [
        // Components
        LabelComponent
    ]
})
export class EtzMiscModule {

}
