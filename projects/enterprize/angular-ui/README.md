# Enterprize Angular UI

The Enterprize Angular UI package provides a reusable and easy to consume and customize UI toolkit based on Bootstrap 4 and Font Awesome 5.

# :warning: WORK IN PROGRESSS :warning:

## Components

### Misc

### Components

- Label

### Form Controls

### Components

- Input


### Directives

- Validation Messages

# Usage

### Basic Input with validation messages

```typescript
@Component({
    selector: "app-root",
    template: `
        <etz-input label="Hello" required
                   [imageFeedback]="true"
                   [formControl]="myControl"
                   [messages]="{'required': 'Hello is required!'}"></etz-input>
    `,
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    title = "etz-angular-ui";

    myControl: FormControl = new FormControl(null, [Validators.required]);
}
``` 

This examples show a basic input of type text that has label, validation and image feedback. The input border will become red or green (invalid/valid) after the user has touched and show/hide validation messages that are displayed below the input box in red.
