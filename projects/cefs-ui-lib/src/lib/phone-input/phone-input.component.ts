import {
  Component, Input, forwardRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  AbstractControl, ValidationErrors, Validator
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cefs-phone-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PhoneInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PhoneInputComponent), multi: true }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {
  @Input() name = 'phone';
  @Input() label = 'Phone number';
  @Input() placeholder = '00 00 00 00 00';
  @Input() required = false;
  @Input() showInfo = false;
  @Input() infoTooltip = '';
  @Input() componentKey = 'cefs-bnp-ui-phone';

  value = '';
  touched = false;
  disabled = false;
  errorMessage = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: string): void {
    this.value = val ?? '';
    if (val === null || val === undefined) { this.touched = false; this.errorMessage = ''; }
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; this.cdr.markForCheck(); }

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
    if (this.touched) this.runValidation();
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
    this.runValidation();
    this.cdr.markForCheck();
  }

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    if (errors) {
      if (errors['required']) this.errorMessage = `${this.label} is required`;
      else if (errors['phone']) this.errorMessage = 'Please enter a valid phone number';
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value?.trim()) return { required: true };
    if (this.value && !/^[\d\s\+\-\(\)]{6,20}$/.test(this.value)) return { phone: true };
    return null;
  }

  get hasError(): boolean { return this.touched && !!this.errorMessage; }
}
