# CEFS BNP UI Library + Demo App

## Project Structure

```
cefs-angular-workspace/
├── projects/
│   └── cefs-ui-lib/              ← Angular Library (3 components)
│       └── src/
│           └── lib/
│               ├── _variables.scss          ← Shared design tokens
│               ├── input-text/              ← Component 1: InputTextComponent
│               ├── email-input/             ← Component 2: EmailInputComponent
│               ├── dropdown/                ← Component 3: DropdownComponent
│               └── cefs-ui-lib.module.ts    ← NgModule barrel
├── src/
│   └── app/
│       └── employee-form/        ← Demo app consuming the library
├── angular.json
├── package.json
└── tsconfig.json
```

## Components

| Selector | componentKey | Description |
|---|---|---|
| `<cefs-input-text>` | `cefs-bnp-ui-txt` | Text/number input with required, maxLength, pattern validation |
| `<cefs-email-input>` | `cefs-bnp-ui-email` | Email input with RFC-compliant validation + feature flag |
| `<cefs-dropdown>` | `cefs-bnp-ui-ddl` | Multi/single select dropdown with checkbox UI |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the library first
npm run build:lib

# 3. Run the demo app
npm start
```

Then open http://localhost:4200

## Using in External Projects (after publishing)

```bash
npm install cefs-ui-lib
```

```typescript
// app.module.ts
import { CefsUiLibModule } from 'cefs-ui-lib';

@NgModule({
  imports: [CefsUiLibModule]
})
export class AppModule {}
```

```html
<!-- Usage examples -->
<cefs-input-text
  formControlName="firstName"
  name="firstName"
  label="First Name"
  placeholder="Enter first name"
  [required]="true"
  [maxLength]="50"
  pattern="^[A-Za-z\s]+$"
></cefs-input-text>

<cefs-email-input
  formControlName="email"
  name="email"
  label="Email"
  placeholder="Enter e-mail address"
  [enabledFlag]="true"
></cefs-email-input>

<cefs-dropdown
  formControlName="salaryCurrency"
  name="salaryCurrency"
  label="Salary Currency"
  [options]="currencyOptions"
  [required]="true"
  [singleSelect]="true"
></cefs-dropdown>
```

## Component APIs

### `<cefs-input-text>`
| Input | Type | Default | Description |
|---|---|---|---|
| `name` | string | '' | Field name |
| `label` | string | '' | Display label |
| `placeholder` | string | '' | Placeholder text |
| `required` | boolean | false | Required validation |
| `maxLength` | number | undefined | Max character limit |
| `pattern` | string | '' | RegExp pattern string |
| `showInfo` | boolean | false | Show ⓘ tooltip icon |
| `infoTooltip` | string | '' | Tooltip text |

### `<cefs-email-input>`
| Input | Type | Default | Description |
|---|---|---|---|
| `name` | string | 'email' | Field name |
| `label` | string | 'Email' | Display label |
| `required` | boolean | false | Required validation |
| `maxLength` | number | 100 | Max character limit |
| `enabledFlag` | boolean | true | Feature flag to show/hide |
| `showInfo` | boolean | false | Show ⓘ icon |

### `<cefs-dropdown>`
| Input | Type | Default | Description |
|---|---|---|---|
| `name` | string | '' | Field name |
| `label` | string | '' | Display label |
| `options` | DropdownOption[] | [] | Array of `{value, label}` |
| `required` | boolean | false | Required validation |
| `singleSelect` | boolean | false | Single vs multi-select |
| `placeholder` | string | 'Select...' | Placeholder text |

## Validation

All 3 components implement `ControlValueAccessor` + `Validator` so they integrate seamlessly with Angular Reactive Forms. Error messages appear after the field is touched (blurred).

### Error states
- **Required**: shows `{Label} is required`
- **MaxLength**: shows `Max N characters allowed`  
- **Pattern**: shows `{Label} contains invalid characters`
- **Email**: shows `Please enter a valid email address`

The error state turns the input border **red** and shows a red **!** icon with the message.
