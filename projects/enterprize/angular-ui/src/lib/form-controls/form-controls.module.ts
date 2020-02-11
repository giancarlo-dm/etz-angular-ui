import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { MiscModule } from "../misc/misc.module";

import { InputComponent } from "./components/input/input.component";

import { MessageErrorDefaultDirective } from "./directives/message-error-default.directive";
import { MessageErrorDirective } from "./directives/message-error.directive";
import { MessagesDirective } from "./directives/messages.directive";

export * from "./components/input/input.component";

export * from "./directives/message-error-default.directive";
export * from "./directives/message-error.directive";
export * from "./directives/messages.directive";

@NgModule({
    imports: [
        // Angular Dependencies
        CommonModule,
        ReactiveFormsModule,
        // Lib Dependencies
        MiscModule
    ],
    declarations: [
        // Components
        InputComponent,
        // Directives
        MessageErrorDirective,
        MessageErrorDefaultDirective,
        MessagesDirective
    ],
    exports: [
        // Components
        InputComponent,
        // Directives
        MessageErrorDirective,
        MessageErrorDefaultDirective,
        MessagesDirective
    ]
})
export class EtzFormControlsModule {

}
