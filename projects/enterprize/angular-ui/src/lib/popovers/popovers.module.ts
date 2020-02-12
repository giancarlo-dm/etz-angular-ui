import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { EtzCoreModule } from "../core/core.module";

import { TooltipComponent } from "./components/tooltip/tooltip.component";
import { TooltipDirective } from "./directives/tooltip.directive";

export * from "./components/tooltip/tooltip.component";
export * from "./directives/tooltip.directive";

export * from "./services/float-element.service";

@NgModule({
    imports: [
        // Angular
        CommonModule,
        ReactiveFormsModule,
        // Lib Module
        EtzCoreModule
    ],
    declarations: [
        // Components
        TooltipComponent,
        // Directives
        TooltipDirective
    ],
    exports: [
        // Directives
        TooltipDirective
    ],
    entryComponents: [
        TooltipComponent
    ]
})
export class EtzPopoversModule {

}
