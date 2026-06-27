import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login-panel',
  imports: [ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './login-panel.html',
  styleUrl: './login-panel.scss',
})
export class LoginPanelComponent {
  readonly form = input.required<FormGroup>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input('');
  readonly submitForm = output<void>();

  protected onSubmit(): void {
    this.submitForm.emit();
  }
}
