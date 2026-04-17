import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DropdownComponent, DropdownOption } from '../../../projects/cefs-ui-lib/src/lib/dropdown/dropdown.component';
import { SearchSelectComponent, SearchSelectOption } from '../../../projects/cefs-ui-lib/src/lib/search-select/search-select.component';

interface FieldValidation {
  required?: boolean;
  maxLength?: number;
  singleSelect?: boolean;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  componentKey: string;
  layout?: 'full' | 'col-left' | 'col-right';
  ui?: { placeholder?: string };
  options?: DropdownOption[];
  optionsByParent?: Record<string, DropdownOption[]>;
  dependsOn?: string;
  validation?: FieldValidation;
}

interface EmployeeFormConfig {
  formId: string;
  title: string;
  fields: FormFieldConfig[];
}

// Pair up col-left / col-right fields into rows for two-column layout
export interface FieldRow {
  left: FormFieldConfig;
  right?: FormFieldConfig;
  full?: FormFieldConfig;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownComponent,
    SearchSelectComponent
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  config!: EmployeeFormConfig;
  form!: FormGroup;
  fieldRows: FieldRow[] = [];
  submitted = false;
  submitSuccess = false;
  resolvedOptions: Record<string, DropdownOption[]> = {};

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<EmployeeFormConfig>('/assets/employee-form.json').subscribe(cfg => {
      this.config = cfg;
      this.buildForm();
      this.buildRows();
      this.setupCascading();
    });
  }

  private buildForm(): void {
    const controls: Record<string, AbstractControl> = {};
    for (const field of this.config.fields) {
      if (field.componentKey === 'cefs-bnp-ui-readonly') continue;
      const v = field.validation ?? {};
      const validators = v.required ? [Validators.required] : [];
      controls[field.name] = this.fb.control('', validators);
    }
    this.form = this.fb.group(controls);
    this.form.addValidators(this.dateRangeValidator());
  }

  private buildRows(): void {
    this.fieldRows = [];
    const fields = this.config.fields;
    let i = 0;
    while (i < fields.length) {
      const f = fields[i];
      // search-select spans full width on its own
      if (!f.layout || f.layout === 'full' || f.componentKey === 'cefs-bnp-ui-search') {
        this.fieldRows.push({ left: f, full: f });
        i++;
      } else if (f.layout === 'col-left') {
        const next = fields[i + 1];
        if (next && next.layout === 'col-right') {
          this.fieldRows.push({ left: f, right: next });
          i += 2;
        } else {
          this.fieldRows.push({ left: f });
          i++;
        }
      } else {
        // orphan col-right
        this.fieldRows.push({ left: f });
        i++;
      }
    }
  }

  private setupCascading(): void {
    for (const field of this.config.fields) {
      if (field.dependsOn && field.optionsByParent) {
        const parentCtrl = this.form.get(field.dependsOn);
        if (!parentCtrl) continue;
        parentCtrl.valueChanges.subscribe((val: string) => {
          this.resolvedOptions[field.name] = field.optionsByParent![val] ?? [];
          this.form.get(field.name)?.setValue('');
        });
      }
    }

    // Origin and destination should never resolve to the same city.
    const originCtrl = this.form.get('originCity');
    const destinationCtrl = this.form.get('destinationCity');
    if (originCtrl && destinationCtrl) {
      originCtrl.valueChanges.subscribe((origin: string) => {
        if (origin && destinationCtrl.value === origin) {
          destinationCtrl.setValue('');
        }
      });
      destinationCtrl.valueChanges.subscribe((destination: string) => {
        if (destination && originCtrl.value === destination) {
          originCtrl.setValue('');
        }
      });
    }
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      if (!startDate || !endDate) return null;

      return new Date(endDate) < new Date(startDate)
        ? { invalidDateRange: true }
        : null;
    };
  }

  getDateMin(fieldName: string): string | null {
    if (fieldName === 'endDate') {
      return this.form?.get('startDate')?.value || null;
    }
    return null;
  }

  getDateMax(fieldName: string): string | null {
    if (fieldName === 'startDate') {
      return this.form?.get('endDate')?.value || null;
    }
    return null;
  }

  hasDateRangeError(fieldName: string): boolean {
    if (fieldName !== 'startDate' && fieldName !== 'endDate') return false;
    const touched = this.form?.get('startDate')?.touched || this.form?.get('endDate')?.touched || this.submitted;
    return !!(touched && this.form?.hasError('invalidDateRange'));
  }

  openDatePicker(input: HTMLInputElement): void {
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  getOptions(field: FormFieldConfig): DropdownOption[] {
    // Keep origin/destination lists mutually exclusive to prevent same-city trips.
    if (field.name === 'originCity') {
      const destination = this.form?.get('destinationCity')?.value;
      return (field.options ?? []).filter(o => o.value !== destination);
    }
    if (field.name === 'destinationCity') {
      const origin = this.form?.get('originCity')?.value;
      return (field.options ?? []).filter(o => o.value !== origin);
    }

    return field.dependsOn
      ? (this.resolvedOptions[field.name] ?? [])
      : (field.options ?? []);
  }

  isDropdown(f: FormFieldConfig): boolean { return f.componentKey === 'cefs-bnp-ui-ddl'; }
  isSearch(f: FormFieldConfig): boolean   { return f.componentKey === 'cefs-bnp-ui-search'; }
  isReadonly(f: FormFieldConfig): boolean { return f.componentKey === 'cefs-bnp-ui-readonly'; }
  isDate(f: FormFieldConfig): boolean     { return f.componentKey === 'cefs-bnp-ui-date'; }
  isTextarea(f: FormFieldConfig): boolean { return f.componentKey === 'cefs-bnp-ui-textarea'; }

  // Derive traveller UID/Name from the search selection
  get travellerUid(): string {
    return this.form?.get('traveller')?.value ?? '';
  }

  onSubmit(): void {
    this.submitted = true;
    Object.values(this.form.controls).forEach(c => c.markAsTouched());
    if (this.form.valid) {
      this.submitSuccess = true;
    }
  }

  onReset(): void {
    this.form.reset();
    this.resolvedOptions = {};
    this.submitted = false;
    this.submitSuccess = false;
  }

  get formValue(): string { return JSON.stringify(this.form.value, null, 2); }
}
