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
  selector: 'cefs-textarea-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea-input.component.html',
  styleUrls: ['./textarea-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TextareaInputComponent),
      multi: true
    }
  ]
})
export class TextareaInputComponent implements ControlValueAccessor, Validator {
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() maxLength?: number;
  @Input() rows = 3;
  @Input() showInfo = false;
  @Input() infoTooltip = '';
  @Input() componentKey = 'cefs-bnp-ui-textarea';

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
    const input = event.target as HTMLTextAreaElement;
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

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    if (errors) {
      if (errors['required']) {
        this.errorMessage = `${this.label} is required`;
      } else if (errors['maxLength']) {
        this.errorMessage = `Max ${this.maxLength} characters allowed`;
      }
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value?.trim()) {
      return { required: true };
    }

    if (this.maxLength && this.value?.length > this.maxLength) {
      return {
        maxLength: { actualLength: this.value.length, requiredLength: this.maxLength }
      };
    }

    return null;
  }

  get hasError(): boolean {
    return this.touched && !!this.errorMessage;
  }
}
