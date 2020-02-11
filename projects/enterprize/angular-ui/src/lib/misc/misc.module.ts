import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { LabelComponent } from "./components/label/label.component";

export * from "./components/label/label.component";

@NgModule({
    imports: [
        // Angular
        CommonModule,
        ReactiveFormsModule,
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
export class MiscModule {

}
