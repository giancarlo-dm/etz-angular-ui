import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxMaskModule } from "ngx-mask";

import { EtzCoreModule } from "../core/core.module";
import { EtzMiscModule } from "../misc/misc.module";
import { EtzPopoversModule } from "../popovers/popovers.module";

import { DatepickerComponent } from "./components/datepicker/datepicker.component";
import { CheckboxComponent } from "./components/checkbox/checkbox.component";
import { InputComponent } from "./components/input/input.component";
import { SelectComponent } from "./components/select/select.component";
import { SwitcherComponent } from "./components/switcher/switcher.component";

import { MessageErrorDefaultDirective } from "./directives/message-error-default.directive";
import { MessageErrorDirective } from "./directives/message-error.directive";
import { MessagesDirective } from "./directives/messages.directive";

import { MonthPipe } from "./pipes/month.pipe";

export * from "./components/datepicker/datepicker.component";
export * from "./components/checkbox/checkbox.component";
export * from "./components/input/input.component";
export * from "./components/select/select.component";
export * from "./components/switcher/switcher.component";

export * from "./directives/message-error-default.directive";
export * from "./directives/message-error.directive";
export * from "./directives/messages.directive";

export * from "./pipes/month.pipe";

@NgModule({
    imports: [
        // Angular Dependencies
        CommonModule,
        ReactiveFormsModule,
        // 3rd Party Dependencies
        NgxMaskModule.forRoot({}),
        // Lib Dependencies
        EtzCoreModule,
        EtzMiscModule,
        EtzPopoversModule
    ],
    declarations: [
        // Components
        DatepickerComponent,
        CheckboxComponent,
        InputComponent,
        SelectComponent,
        SwitcherComponent,
        // Directives
        MessageErrorDirective,
        MessageErrorDefaultDirective,
        MessagesDirective,
        // Pipes
        MonthPipe
    ],
    exports: [
        // Components
        DatepickerComponent,
        CheckboxComponent,
        InputComponent,
        SelectComponent,
        SwitcherComponent,
        // Directives
        MessageErrorDirective,
        MessageErrorDefaultDirective,
        MessagesDirective,
        // Pipes
        MonthPipe
    ]
})
export class EtzFormControlsModule {

}
