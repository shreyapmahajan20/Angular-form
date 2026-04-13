import { Component } from '@angular/core';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EmployeeFormComponent],
  template: `<app-employee-form></app-employee-form>`
})
export class AppComponent {}
