import { Component, computed, input, output, signal } from '@angular/core';
import { AuthSession } from '../../../../core/models/auth.model';
import { DashboardSection, EmployeeItem, ExamItem, NavItem } from '../../../../core/models/dashboard.model';
import { EmployeeOverviewComponent } from '../employee-overview/employee-overview';
import { ExamOverviewComponent } from '../exam-overview/exam-overview';
import { ExamTakingComponent } from '../exam-taking/exam-taking';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardTopbarComponent } from '../dashboard-topbar/dashboard-topbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DashboardSidebarComponent,
    DashboardTopbarComponent,
    EmployeeOverviewComponent,
    ExamOverviewComponent,
    ExamTakingComponent,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressBarModule,
    DatePipe,
    UpperCasePipe,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPageComponent {
  readonly auth = input.required<AuthSession>();
  readonly navigationItems = input.required<NavItem[]>();
  readonly selectedSection = input.required<DashboardSection>();
  readonly employees = input.required<EmployeeItem[]>();
  readonly exams = input.required<ExamItem[]>();
  readonly results = input<any[]>([]);
  readonly certTemplate = input<{ exists: boolean; url?: string } | null>(null);
  readonly isUploadingTemplate = input<boolean>(false);
  readonly uploadTemplate = output<File>();
  readonly pageTitle = input.required<string>();
  readonly pageSubtitle = input.required<string>();
  readonly passedCount = input.required<number>();
  readonly scheduledCount = input.required<number>();
  readonly retakeCount = input.required<number>();
  readonly currentTheme = input.required<'dark' | 'light'>();
  readonly isSidebarCollapsed = input(false);
  readonly activeExamId = input<number | null>(null);
  readonly themeChange = output<'dark' | 'light'>();
  readonly toggleSidebar = output<void>();
  readonly navigate = output<DashboardSection>();
  readonly logout = output<void>();
  readonly startExam = output<number>();
  readonly deleteExam = output<number>();
  readonly finishExam = output<void>();

  protected onThemeChange(theme: 'dark' | 'light'): void {
    this.themeChange.emit(theme);
  }

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  protected onNavigate(section: DashboardSection): void {
    this.navigate.emit(section);
  }

  protected onLogout(): void {
    this.logout.emit();
  }

  // Certificate computed signals
  protected readonly passedResults = computed(() => {
    return this.results().filter(r => r.status === 'passed' || r.status === 'Passed');
  });

  protected readonly selectedCertificateIndex = signal<number>(0);

  protected readonly activeCertificate = computed(() => {
    const list = this.passedResults();
    if (list.length === 0) return null;
    const idx = this.selectedCertificateIndex();
    return list[idx] || list[0];
  });

  protected onSelectCertificate(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    this.selectedCertificateIndex.set(Number(selectEl.value));
  }

  protected printCertificate(): void {
    window.print();
  }

  protected onTemplateFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.uploadTemplate.emit(fileInput.files[0]);
    }
  }
}
