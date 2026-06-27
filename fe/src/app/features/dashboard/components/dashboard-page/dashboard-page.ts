import { Component, input, output } from '@angular/core';
import { AuthSession } from '../../../../core/models/auth.model';
import { DashboardSection, EmployeeItem, ExamItem, NavItem } from '../../../../core/models/dashboard.model';
import { EmployeeOverviewComponent } from '../employee-overview/employee-overview';
import { ExamOverviewComponent } from '../exam-overview/exam-overview';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar';
import { DashboardTopbarComponent } from '../dashboard-topbar/dashboard-topbar';

@Component({
  selector: 'app-dashboard-page',
  imports: [DashboardSidebarComponent, DashboardTopbarComponent, EmployeeOverviewComponent, ExamOverviewComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPageComponent {
  readonly auth = input.required<AuthSession>();
  readonly navigationItems = input.required<NavItem[]>();
  readonly selectedSection = input.required<DashboardSection>();
  readonly employees = input.required<EmployeeItem[]>();
  readonly exams = input.required<ExamItem[]>();
  readonly pageTitle = input.required<string>();
  readonly pageSubtitle = input.required<string>();
  readonly passedCount = input.required<number>();
  readonly scheduledCount = input.required<number>();
  readonly retakeCount = input.required<number>();
  readonly currentTheme = input.required<'dark' | 'light'>();
  readonly isSidebarCollapsed = input(false);
  readonly themeChange = output<'dark' | 'light'>();
  readonly toggleSidebar = output<void>();
  readonly navigate = output<DashboardSection>();
  readonly logout = output<void>();

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
}
