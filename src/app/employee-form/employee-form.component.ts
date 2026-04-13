import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import from the library (after build: from 'cefs-ui-lib')
// During development we import directly from the source
import { InputTextComponent } from '../../../projects/cefs-ui-lib/src/lib/input-text/input-text.component';
import { EmailInputComponent } from '../../../projects/cefs-ui-lib/src/lib/email-input/email-input.component';
import { DropdownComponent, DropdownOption } from '../../../projects/cefs-ui-lib/src/lib/dropdown/dropdown.component';

// ── Form Config Types ─────────────────────────────────────────────────────────
interface FieldValidation {
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  singleSelect?: boolean;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  componentKey: string;
  ui?: { placeholder?: string };
  options?: DropdownOption[];
  validation?: FieldValidation;
  config?: { enabledFlag?: string };
}

interface EmployeeFormConfig {
  formId: string;
  title: string;
  description: string;
  fields: FormFieldConfig[];
}

// ── Hard-coded config (mirrors employee-form.json) ───────────────────────────
const EMPLOYEE_FORM_CONFIG: EmployeeFormConfig = {
  formId: 'employeeCreate',
  title: 'Employee Details',
  description: "Form for entering a new employee's personal and remuneration data.",
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      componentKey: 'cefs-bnp-ui-txt',
      ui: { placeholder: 'Enter first name' },
      validation: { required: true, maxLength: 50, pattern: '^[A-Za-z\\s]+$' }
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      componentKey: 'cefs-bnp-ui-txt',
      ui: { placeholder: 'Enter last name' },
      validation: { required: true, maxLength: 50, pattern: '^[A-Za-z\\s]+$' }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      componentKey: 'cefs-bnp-ui-email',
      ui: { placeholder: 'Enter e-mail address' },
      validation: { required: false, maxLength: 100 },
      config: { enabledFlag: 'emailEnabled' }
    },
    {
      name: 'salaryCurrency',
      label: 'Salary Currency',
      type: 'select',
      componentKey: 'cefs-bnp-ui-ddl',
      options: [
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' },
        { value: 'JPY', label: 'Japanese Yen' },
        { value: 'GBP', label: 'British Pound' },
        { value: 'CHF', label: 'Swiss Franc' },
        { value: 'CAD', label: 'Canadian Dollar' },
        { value: 'AUD', label: 'Australian Dollar' },
        { value: 'CNY', label: 'Chinese Yuan' },
        { value: 'HKD', label: 'Hong Kong Dollar' },
        { value: 'NZD', label: 'New Zealand Dollar' }
      ],
      validation: { required: true, singleSelect: true }
    },
    {
      name: 'salary',
      label: 'Salary',
      type: 'number',
      componentKey: 'cefs-bnp-ui-txt',
      ui: { placeholder: 'Enter salary amount' },
      validation: { required: true }
    }
  ]
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    EmailInputComponent,
    DropdownComponent
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  config: EmployeeFormConfig = EMPLOYEE_FORM_CONFIG;
  form!: FormGroup;
  submitted = false;
  submitSuccess = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const controls: Record<string, AbstractControl> = {};
    for (const field of this.config.fields) {
      const v = field.validation ?? {};
      const validators = [];
      if (v.required) validators.push(Validators.required);
      if (v.maxLength) validators.push(Validators.maxLength(v.maxLength));
      if (v.pattern) validators.push(Validators.pattern(v.pattern));
      controls[field.name] = this.fb.control('', validators);
    }
    this.form = this.fb.group(controls);
  }

  getField(name: string): FormFieldConfig | undefined {
    return this.config.fields.find(f => f.name === name);
  }

  isTextField(field: FormFieldConfig): boolean {
    return field.type === 'text' || field.type === 'number';
  }

  isEmailField(field: FormFieldConfig): boolean {
    return field.type === 'email';
  }

  isDropdownField(field: FormFieldConfig): boolean {
    return field.type === 'select';
  }

  onSubmit(): void {
    this.submitted = true;
    // Mark all controls touched to trigger validation display
    Object.values(this.form.controls).forEach(ctrl => ctrl.markAsTouched());

    if (this.form.valid) {
      this.submitSuccess = true;
      console.log('Form submitted:', this.form.value);
    }
  }

  onReset(): void {
    this.form.reset();
    this.submitted = false;
    this.submitSuccess = false;
  }

  get formValue(): string {
    return JSON.stringify(this.form.value, null, 2);
  }
}
