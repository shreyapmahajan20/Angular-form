import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextComponent } from '../../../projects/cefs-ui-lib/src/lib/input-text/input-text.component';
import { EmailInputComponent } from '../../../projects/cefs-ui-lib/src/lib/email-input/email-input.component';
import { DropdownComponent, DropdownOption } from '../../../projects/cefs-ui-lib/src/lib/dropdown/dropdown.component';

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
  config!: EmployeeFormConfig;
  form!: FormGroup;
  submitted = false;
  submitSuccess = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<EmployeeFormConfig>('/assets/employee-form.json').subscribe(cfg => {
      this.config = cfg;
      this.buildForm();
    });
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

  isTextField(field: FormFieldConfig): boolean {
    return field.componentKey === 'cefs-bnp-ui-txt';
  }

  isEmailField(field: FormFieldConfig): boolean {
    return field.componentKey === 'cefs-bnp-ui-email';
  }

  isDropdownField(field: FormFieldConfig): boolean {
    return field.componentKey === 'cefs-bnp-ui-ddl';
  }

  onSubmit(): void {
    this.submitted = true;
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
