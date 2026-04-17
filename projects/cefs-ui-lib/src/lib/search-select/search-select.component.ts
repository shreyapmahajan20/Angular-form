import {
  Component, Input, OnChanges, SimpleChanges, forwardRef,
  ChangeDetectionStrategy, ChangeDetectorRef,
  HostListener, ElementRef
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  AbstractControl, ValidationErrors, Validator
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchSelectOption {
  uid: string;
  name: string;
}

@Component({
  selector: 'cefs-search-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SearchSelectComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => SearchSelectComponent), multi: true }
  ]
})
export class SearchSelectComponent implements ControlValueAccessor, Validator, OnChanges {
  @Input() name = '';
  @Input() label = '';
  @Input() options: SearchSelectOption[] = [];
  @Input() required = false;
  @Input() componentKey = 'cefs-bnp-ui-search';

  searchQuery = '';
  isOpen = false;
  touched = false;
  isDisabled = false;
  errorMessage = '';
  selectedOption: SearchSelectOption | null = null;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      if (this.selectedOption && !this.options.find(o => o.uid === this.selectedOption!.uid)) {
        this.selectedOption = null;
        this.onChange('');
        this.runValidation();
      }
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.searchQuery = '';
      this.touched = true;
      this.onTouched();
      this.runValidation();
      this.cdr.markForCheck();
    }
  }

  get filteredOptions(): SearchSelectOption[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(
      o => o.name.toLowerCase().includes(q) || o.uid.toLowerCase().includes(q)
    );
  }

  togglePanel(): void {
    if (this.isDisabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchQuery = '';
      this.touched = true;
      this.onTouched();
      this.runValidation();
    }
    this.cdr.markForCheck();
  }

  openPanel(): void {
    if (this.isDisabled || this.isOpen) return;
    this.isOpen = true;
    this.cdr.markForCheck();
  }

  select(option: SearchSelectOption): void {
    this.selectedOption = option;
    this.isOpen = false;
    this.searchQuery = '';
    this.touched = true;
    this.onChange(option.uid);
    this.onTouched();
    this.runValidation();
    this.cdr.markForCheck();
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedOption = null;
    this.onChange('');
    this.runValidation();
    this.cdr.markForCheck();
  }

  writeValue(val: string): void {
    this.selectedOption = this.options.find(o => o.uid === val) ?? null;
    if (!val) { this.touched = false; this.errorMessage = ''; }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  private runValidation(): void {
    const errors = this.validate(null as unknown as AbstractControl);
    this.errorMessage = errors?.['required'] ? `${this.label} is required` : '';
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.required && !this.selectedOption ? { required: true } : null;
  }

  get hasError(): boolean { return this.touched && !!this.errorMessage; }
}
