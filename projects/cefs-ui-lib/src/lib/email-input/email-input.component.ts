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
  selector: 'cefs-email-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailInputComponent),
      multi: true
    }
  ]
})
export class EmailInputComponent implements ControlValueAccessor, Validator {
  @Input() name = 'email';
  @Input() label = 'Email';
  @Input() placeholder = 'Enter e-mail address';
  @Input() required = false;
  @Input() maxLength = 100;
  @Input() showInfo = false;
  @Input() infoTooltip = '';
  /** Feature flag: if false, field is hidden */
  @Input() enabledFlag = true;
  @Input() componentKey = 'cefs-bnp-ui-txt';

  // Email pattern from JSON
  private readonly EMAIL_PATTERN = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;

  value = '';
  touched = false;
  disabled = false;
  errorMessage = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(val: string): void {
    this.value = val ?? '';
    this.cdr.markForCheck();
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    if (this.touched) this.runValidation();
    this.cdr.markForCheck();
  }

  onBlur(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
      this.runValidation();
      this.cdr.markForCheck();
    }
  }

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    if (errors) {
      if (errors['required']) this.errorMessage = 'Email address is required';
      else if (errors['maxLength']) this.errorMessage = `Max ${this.maxLength} characters allowed`;
      else if (errors['email']) this.errorMessage = 'Please enter a valid email address';
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value?.trim()) {
      return { required: true };
    }
    if (this.maxLength && this.value?.length > this.maxLength) {
      return { maxLength: true };
    }
    if (this.value && !this.EMAIL_PATTERN.test(this.value)) {
      return { email: true };
    }
    return null;
  }

  get hasError(): boolean {
    return this.touched && !!this.errorMessage;
  }
}
