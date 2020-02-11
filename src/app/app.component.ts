import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "etz-angular-ui";

    myControl: FormControl = new FormControl(null, [Validators.required]);
    currencyControl: FormControl = new FormControl(null);
    percentControl: FormControl = new FormControl(null);
    numberControl: FormControl = new FormControl(null);
}
