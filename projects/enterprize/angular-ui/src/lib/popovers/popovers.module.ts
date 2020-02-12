import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { EtzCoreModule } from "../core/core.module";

import { TooltipComponent } from "./components/tooltip/tooltip.component";

import { FloatElementDirective } from "./directives/float-element.directive";
import { TooltipDirective } from "./directives/tooltip.directive";

export * from "./components/tooltip/tooltip.component";

export * from "./directives/float-element.directive"
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
        FloatElementDirective,
        TooltipDirective
    ],
    exports: [
        // Directives
        FloatElementDirective,
        TooltipDirective
    ],
    entryComponents: [
        TooltipComponent
    ]
})
export class EtzPopoversModule {

}
