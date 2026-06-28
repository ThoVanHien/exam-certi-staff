import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { examItems, navigationItems } from './core/data/dashboard.data';
import { LoginResponse } from './core/models/auth.model';
import { DashboardSection, EmployeeItem, ExamItem, NavItem } from './core/models/dashboard.model';
import { LoginPanelComponent } from './features/auth/components/login-panel/login-panel';
import { DashboardPageComponent } from './features/dashboard/components/dashboard-page/dashboard-page';
import { DashboardService } from './core/services/dashboard.service';

@Component({
  selector: 'app-root',
  imports: [LoginPanelComponent, DashboardPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly dashboardService = inject(DashboardService);

  protected readonly apiBaseUrl = 'http://localhost:3000/api';
  protected readonly currentTheme = signal<'dark' | 'light'>('dark');
  protected readonly isSidebarCollapsed = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly loginResult = signal<LoginResponse['data'] | null>(null);
  protected readonly selectedSection = signal<DashboardSection>('employees');
  protected readonly backendExams = signal<any[]>([]);
  protected readonly myResults = signal<any[]>([]);
  protected readonly certTemplate = signal<{ exists: boolean; url?: string } | null>(null);
  protected readonly isUploadingTemplate = signal(false);
  protected readonly activeExamId = signal<number | null>(null);
  protected readonly employeeItems = signal<EmployeeItem[]>([]);
  protected readonly examItems = examItems;
  protected readonly navigationItems = computed<NavItem[]>(() => {
    const user = this.loginResult()?.user;
    const isEmp = user?.role === 'employee';
    return navigationItems
      .filter((item) => !(isEmp && item.key === 'employees'))
      .map((item) => {
        let label = item.label;
        if (isEmp) {
          if (item.key === 'examinations') {
            label = 'My Exams';
          } else if (item.key === 'certificates') {
            label = 'My Certificates';
          } else if (item.key === 'results') {
            label = 'My Results';
          }
        }
        return {
          ...item,
          label,
          active: item.key === this.selectedSection(),
        };
      });
  });

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['admin@company.local', [Validators.required, Validators.email]],
    password: ['admin', [Validators.required]],
  });

  constructor() {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['employees', 'examinations', 'certificates', 'results'].includes(hash)) {
      this.selectedSection.set(hash as DashboardSection);
    }
    
    // Apply initial theme
    this.applyThemeClass(this.currentTheme());
  }

  private applyThemeClass(theme: 'dark' | 'light'): void {
    const root = this.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    }
  }

  private loadExams(token: string): void {
    this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiBaseUrl}/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.backendExams.set(res.data || []);
        },
        error: () => {
          this.backendExams.set([]);
        },
      });
  }

  private loadMyResults(token: string): void {
    console.log('App: loadMyResults called with token', token ? 'PRESENT' : 'MISSING');
    this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiBaseUrl}/exams/my-results`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          console.log('App: loadMyResults succeeded, results count:', res.data?.length, res.data);
          this.myResults.set(res.data || []);
        },
        error: (err) => {
          console.error('App: loadMyResults failed:', err);
          this.myResults.set([]);
        },
      });
  }

  private loadCertTemplate(token: string): void {
    this.http
      .get<{ success: boolean; data: { exists: boolean; url?: string } }>(`${this.apiBaseUrl}/certificates/template`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.certTemplate.set(res.data);
        },
        error: () => {
          this.certTemplate.set({ exists: false });
        },
      });
  }

  private loadEmployees(token: string): void {
    this.dashboardService.getEmployees(token).subscribe({
      next: (data) => {
        this.employeeItems.set(data);
      },
      error: (err) => {
        console.error('App: loadEmployees failed:', err);
        this.employeeItems.set([]);
      }
    });
  }

  protected uploadTemplateFile(file: File): void {
    const auth = this.loginResult();
    if (!auth) return;

    const formData = new FormData();
    formData.append('file', file);

    this.isUploadingTemplate.set(true);
    this.http
      .post<{ success: boolean; data: { exists: boolean; url?: string } }>(`${this.apiBaseUrl}/certificates/template`, formData, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      .subscribe({
        next: (res) => {
          this.certTemplate.set(res.data);
          this.isUploadingTemplate.set(false);
        },
        error: (err) => {
          console.error('App: Upload template failed', err);
          this.isUploadingTemplate.set(false);
        },
      });
  }

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
          if (response.data.user.role === 'employee') {
            this.setSection('examinations');
          } else {
            const hash = window.location.hash.replace('#/', '').replace('#', '');
            if (['employees', 'examinations', 'certificates', 'results'].includes(hash)) {
              this.setSection(hash as DashboardSection);
            } else {
              this.setSection('employees');
            }
          }
          this.loadExams(response.data.accessToken);
          this.loadMyResults(response.data.accessToken);
          this.loadCertTemplate(response.data.accessToken);
          this.loadEmployees(response.data.accessToken);
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
    this.backendExams.set([]);
    this.myResults.set([]);
    this.certTemplate.set(null);
    this.activeExamId.set(null);
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
      return this.employeeItems();
    }

    if (auth.user.role === 'partleader') {
      return this.employeeItems().filter((item) => item.department === auth.user.department);
    }

    return [];
  }

  protected get visibleExams(): ExamItem[] {
    const auth = this.loginResult();

    if (!auth) {
      return [];
    }

    const bExams: ExamItem[] = this.backendExams().map((e: any) => ({
      id: e.id,
      code: e.code || `EX-${String(e.id).padStart(3, '0')}`,
      title: e.title,
      description: e.description || 'No description provided.',
      department: e.department || 'Production',
      createdBy: e.createdByUser?.name || e.createdBy || 'admin',
      questionCount: e.questionCount || e.totalQuestions || 0,
      durationMinutes: e.durationMinutes || e.duration || 30,
      status: e.status || 'Published',
    }));

    if (auth.user.role === 'super_admin') {
      return bExams;
    }

    if (auth.user.role === 'partleader') {
      return bExams.filter((item) => item.department === auth.user.department);
    }

    if (auth.user.role === 'employee') {
      return bExams;
    }

    return [];
  }

  protected get pageTitle(): string {
    const auth = this.loginResult();

    if (!auth) {
      return '';
    }

    if (this.selectedSection() === 'take-exam') {
      return 'Màn hình làm bài thi';
    }

    if (this.selectedSection() === 'examinations') {
      if (auth.user.role === 'employee') {
        return 'Danh sách bài thi của tôi';
      }
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

    if (this.selectedSection() === 'take-exam') {
      return 'Vui lòng đọc kỹ câu hỏi và chọn câu trả lời chính xác nhất. Hệ thống sẽ tự động nộp bài khi hết giờ.';
    }

    if (this.selectedSection() === 'examinations') {
      if (auth.user.role === 'employee') {
        return 'Xem các kỳ thi chứng chỉ được chỉ định cho bộ phận của bạn và tiến hành thi trực tuyến.';
      }
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
    return this.visibleEmployees.filter((item) => item.examResultStatus === 'PASSED').length;
  }

  protected get scheduledCount(): number {
    return this.visibleEmployees.filter((item) => item.approvalStatus === 'WAITING_APPROVAL').length;
  }

  protected get retakeCount(): number {
    return this.visibleEmployees.filter((item) => item.examResultStatus === 'FAILED').length;
  }

  protected setTheme(theme: 'dark' | 'light'): void {
    this.currentTheme.set(theme);
    this.applyThemeClass(theme);
  }

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }

  protected setSection(section: DashboardSection): void {
    this.selectedSection.set(section);
    window.history.pushState(null, '', '#/' + section);
    
    if (section === 'results') {
      const auth = this.loginResult();
      if (auth) {
        this.loadMyResults(auth.accessToken);
      }
    } else if (section === 'certificates') {
      const auth = this.loginResult();
      if (auth) {
        this.loadCertTemplate(auth.accessToken);
      }
    } else if (section === 'employees') {
      const auth = this.loginResult();
      if (auth) {
        this.loadEmployees(auth.accessToken);
      }
    }
  }

  protected startExam(examId: number): void {
    console.log('App: startExam called with examId', examId);
    this.activeExamId.set(examId);
    this.selectedSection.set('take-exam');
    console.log('App: activeExamId is now', this.activeExamId(), 'selectedSection is now', this.selectedSection());
  }

  protected finishExam(): void {
    this.activeExamId.set(null);
    this.selectedSection.set('examinations');
    const auth = this.loginResult();
    if (auth) {
      this.loadExams(auth.accessToken);
      this.loadMyResults(auth.accessToken);
      this.loadCertTemplate(auth.accessToken);
      this.loadEmployees(auth.accessToken);
    }
  }

  protected deleteExam(examId: number): void {
    const auth = this.loginResult();
    if (!auth) return;

    this.http
      .delete<{ success: boolean }>(`${this.apiBaseUrl}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      .subscribe({
        next: () => {
          this.loadExams(auth.accessToken);
        },
        error: (err) => {
          console.error('App: deleteExam failed:', err);
        }
      });
  }
}
