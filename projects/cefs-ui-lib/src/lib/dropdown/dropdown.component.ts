import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  HostListener,
  ElementRef
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

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'cefs-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() name = '';
  @Input() label = '';
  @Input() options: DropdownOption[] = [];
  @Input() required = false;
  @Input() singleSelect = false;
  @Input() showInfo = false;
  @Input() infoTooltip = '';
  @Input() placeholder = 'Select...';
  @Input() componentKey = 'cefs-bnp-ui-ddl';

  isOpen = false;
  touched = false;
  disabled = false;
  errorMessage = '';

  // For multi-select: array of selected values; for single: single string
  selectedValues: string[] = [];

  private onChange: (v: string | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef) {}

  ngOnInit(): void {}

  // Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        if (!this.touched) {
          this.touched = true;
          this.onTouched();
          this.runValidation();
        }
        this.cdr.markForCheck();
      }
    }
  }

  writeValue(val: string | string[]): void {
    if (val === null || val === undefined) {
      this.selectedValues = [];
      this.touched = false;
      this.errorMessage = '';
      this.cdr.markForCheck();
      return;
    }
    if (this.singleSelect) {
      this.selectedValues = val ? [val as string] : [];
    } else {
      this.selectedValues = Array.isArray(val) ? val : (val ? [val] : []);
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string | string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen && !this.touched) {
      this.touched = true;
      this.onTouched();
      this.runValidation();
    }
    this.cdr.markForCheck();
  }

  toggleOption(option: DropdownOption): void {
    if (this.singleSelect) {
      this.selectedValues = [option.value];
      this.isOpen = false;
    } else {
      const idx = this.selectedValues.indexOf(option.value);
      if (idx === -1) {
        this.selectedValues = [...this.selectedValues, option.value];
      } else {
        this.selectedValues = this.selectedValues.filter(v => v !== option.value);
      }
    }

    this.touched = true;
    const emitValue = this.singleSelect ? this.selectedValues[0] : this.selectedValues;
    this.onChange(emitValue);
    this.onTouched();
    this.runValidation();
    this.cdr.markForCheck();
  }

  isSelected(value: string): boolean {
    return this.selectedValues.includes(value);
  }

  get displayLabel(): string {
    if (this.selectedValues.length === 0) return '';
    if (this.singleSelect) {
      const opt = this.options.find(o => o.value === this.selectedValues[0]);
      return opt ? opt.label : '';
    }
    if (this.selectedValues.length === 1) {
      const opt = this.options.find(o => o.value === this.selectedValues[0]);
      return opt ? opt.label : '';
    }
    return `${this.selectedValues.length} selected`;
  }

  get hasError(): boolean {
    return this.touched && !!this.errorMessage;
  }

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    if (errors) {
      if (errors['required']) this.errorMessage = `${this.label} is required`;
    } else {
      this.errorMessage = '';
    }
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    if (this.required && this.selectedValues.length === 0) {
      return { required: true };
    }
    return null;
  }
}
