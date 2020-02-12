import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

export * from "./common/paginated-result.class";
export * from "./common/paginated-result-metadata.class";

@NgModule({
    imports: [
        // Angular Dependencies
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
    ]
})
export class EtzCoreModule {

}
