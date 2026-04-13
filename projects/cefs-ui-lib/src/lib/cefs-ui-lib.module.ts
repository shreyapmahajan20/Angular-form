import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { InputTextComponent } from './input-text/input-text.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextComponent,
    EmailInputComponent,
    DropdownComponent
  ],
  exports: [
    InputTextComponent,
    EmailInputComponent,
    DropdownComponent
  ]
})
export class CefsUiLibModule {}
