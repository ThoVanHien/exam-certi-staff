import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { employeeItems, examItems, navigationItems } from './core/data/dashboard.data';
import { LoginResponse } from './core/models/auth.model';
import { DashboardSection, EmployeeItem, ExamItem, NavItem } from './core/models/dashboard.model';
import { LoginPanelComponent } from './features/auth/components/login-panel/login-panel';
import { DashboardPageComponent } from './features/dashboard/components/dashboard-page/dashboard-page';

@Component({
  selector: 'app-root',
  imports: [LoginPanelComponent, DashboardPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  protected readonly apiBaseUrl = 'http://localhost:3000/api';
  protected readonly currentTheme = signal<'dark' | 'light'>('dark');
  protected readonly isSidebarCollapsed = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly loginResult = signal<LoginResponse['data'] | null>(null);
  protected readonly selectedSection = signal<DashboardSection>('employees');
  protected readonly employeeItems = employeeItems;
  protected readonly examItems = examItems;
  protected readonly navigationItems = computed<NavItem[]>(() =>
    navigationItems.map((item) => ({
      ...item,
      active: item.key === this.selectedSection(),
    })),
  );

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['admin@company.local', [Validators.required, Validators.email]],
    password: ['admin', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.loginResult.set(null);

    this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, this.loginForm.getRawValue())
      .subscribe({
        next: (response) => {
          this.loginResult.set(response.data);
          this.isSubmitting.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.message || 'Unable to sign in. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }

  protected logout(): void {
    this.loginResult.set(null);
    this.errorMessage.set('');
    this.loginForm.patchValue({ password: '' });
    this.currentTheme.set('dark');
    this.isSidebarCollapsed.set(false);
    this.selectedSection.set('employees');
  }

  protected get visibleEmployees(): EmployeeItem[] {
    const auth = this.loginResult();

    if (!auth) {
      return [];
    }

    if (auth.user.role === 'super_admin') {
      return this.employeeItems;
    }

    if (auth.user.role === 'partleader') {
      return this.employeeItems.filter((item) => item.department === auth.user.department);
    }

    return [];
  }

  protected get visibleExams(): ExamItem[] {
    const auth = this.loginResult();

    if (!auth) {
      return [];
    }

    if (auth.user.role === 'super_admin') {
      return this.examItems;
    }

    if (auth.user.role === 'partleader') {
      return this.examItems.filter((item) => item.department === auth.user.department);
    }

    return [];
  }

  protected get pageTitle(): string {
    const auth = this.loginResult();

    if (!auth) {
      return '';
    }

    if (this.selectedSection() === 'examinations') {
      return auth.user.role === 'super_admin' ? 'Examination Management' : `${auth.user.department} Examination Management`;
    }

    if (auth.user.role === 'super_admin') {
      return 'Employee Certification Management';
    }

    return `${auth.user.department} Part Management`;
  }

  protected get pageSubtitle(): string {
    const auth = this.loginResult();

    if (!auth) {
      return '';
    }

    if (this.selectedSection() === 'examinations') {
      return auth.user.role === 'super_admin'
        ? 'Search, review, and maintain examination definitions across all parts.'
        : `Search, review, and maintain examination definitions for the ${auth.user.department} part.`;
    }

    if (auth.user.role === 'super_admin') {
      return 'Manage employees, examinations, and certificate issuance across all parts.';
    }

    return `Manage employees, examinations, and certification activity for the ${auth.user.department} part.`;
  }

  protected get passedCount(): number {
    return this.visibleEmployees.filter((item) => item.examStatus === 'Passed').length;
  }

  protected get scheduledCount(): number {
    return this.visibleEmployees.filter((item) => item.examStatus === 'Scheduled').length;
  }

  protected get retakeCount(): number {
    return this.visibleEmployees.filter((item) => item.examStatus === 'Retake').length;
  }

  protected setTheme(theme: 'dark' | 'light'): void {
    this.currentTheme.set(theme);
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }

  protected setSection(section: DashboardSection): void {
    this.selectedSection.set(section);
  }
}
