import {
  Component,
  Input,
  forwardRef,
  OnInit,
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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface InputTextValidation {
  required?: boolean;
  maxLength?: number;
  pattern?: string;
}

@Component({
  selector: 'cefs-input-text',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ]
})
export class InputTextComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() maxLength?: number;
  @Input() pattern?: string;
  @Input() showInfo = false;
  @Input() infoTooltip = '';
  @Input() componentKey = 'cefs-bnp-ui-txt';

  value = '';
  touched = false;
  disabled = false;
  errorMessage = '';

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  writeValue(val: string): void {
    this.value = val ?? '';
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
      if (errors['required']) this.errorMessage = `${this.label} is required`;
      else if (errors['maxLength']) this.errorMessage = `Max ${this.maxLength} characters allowed`;
      else if (errors['pattern']) this.errorMessage = `${this.label} contains invalid characters`;
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.value?.trim()) {
      return { required: true };
    }
    if (this.maxLength && this.value?.length > this.maxLength) {
      return { maxLength: { actualLength: this.value.length, requiredLength: this.maxLength } };
    }
    if (this.pattern && this.value) {
      const regex = new RegExp(this.pattern);
      if (!regex.test(this.value)) {
        return { pattern: true };
      }
    }
    return null;
  }

  get hasError(): boolean {
    return this.touched && !!this.errorMessage;
  }
}
