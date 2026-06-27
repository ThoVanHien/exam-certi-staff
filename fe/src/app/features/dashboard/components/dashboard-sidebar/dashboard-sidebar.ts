import { Component, computed, input, output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthSession } from '../../../../core/models/auth.model';
import { DashboardSection, NavItem } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [ButtonModule, MenuModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.scss',
})
export class DashboardSidebarComponent {
  readonly auth = input.required<AuthSession>();
  readonly navigationItems = input.required<NavItem[]>();
  readonly isCollapsed = input(false);
  readonly toggleSidebar = output<void>();
  readonly navigate = output<DashboardSection>();
  protected readonly menuItems = computed<MenuItem[]>(() =>
    this.navigationItems().map((item) => ({
      key: item.key,
      label: item.label,
      icon: this.resolveIcon(item.icon),
      tooltip: this.isCollapsed() ? item.label : undefined,
      tooltipPosition: 'right',
      styleClass: item.active ? 'nav-item--active' : '',
      hint: item.hint,
    })),
  );

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  protected onNavigate(section: DashboardSection): void {
    this.navigate.emit(section);
  }

  private resolveIcon(icon: NavItem['icon']): string {
    switch (icon) {
      case 'employees':
        return 'pi pi-users';
      case 'exams':
        return 'pi pi-file-edit';
      case 'certificates':
        return 'pi pi-verified';
      case 'results':
        return 'pi pi-chart-bar';
    }
  }
}
