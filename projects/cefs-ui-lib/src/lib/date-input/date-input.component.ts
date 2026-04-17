import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cefs-date-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    }
  ]
})
export class DateInputComponent implements ControlValueAccessor, Validator {
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() min: string | null = null;
  @Input() max: string | null = null;
  @Input() componentKey = 'cefs-bnp-ui-date';

  value = '';
  touched = false;
  disabled = false;
  errorMessage = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: string): void {
    this.value = val ?? '';
    if (val === null || val === undefined) {
      this.touched = false;
      this.errorMessage = '';
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    if (this.touched) {
      this.runValidation();
    }
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
    this.runValidation();
    this.cdr.markForCheck();
  }

  openDatePicker(input: HTMLInputElement): void {
    if (!input || this.disabled) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    if (errors?.['required']) {
      this.errorMessage = `${this.label} is required`;
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value?.trim()) {
      return { required: true };
    }
    return null;
  }

  get hasError(): boolean {
    return this.touched && !!this.errorMessage;
  }
}
