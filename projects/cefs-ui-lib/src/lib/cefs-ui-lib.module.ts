import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { InputTextComponent } from './input-text/input-text.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { PhoneInputComponent } from './phone-input/phone-input.component';
import { SearchSelectComponent } from './search-select/search-select.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextComponent,
    EmailInputComponent,
    DropdownComponent,
    PhoneInputComponent,
    SearchSelectComponent
  ],
  exports: [
    InputTextComponent,
    EmailInputComponent,
    DropdownComponent,
    PhoneInputComponent,
    SearchSelectComponent
  ]
})
export class CefsUiLibModule {}
