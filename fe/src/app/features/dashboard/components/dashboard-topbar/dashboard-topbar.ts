import { Component, input, output } from '@angular/core';
import { AuthSession } from '../../../../core/models/auth.model';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-dashboard-topbar',
  imports: [ButtonModule, PopoverModule],
  templateUrl: './dashboard-topbar.html',
  styleUrl: './dashboard-topbar.scss',
})
export class DashboardTopbarComponent {
  readonly auth = input.required<AuthSession>();
  readonly pageTitle = input.required<string>();
  readonly pageSubtitle = input.required<string>();
  readonly currentTheme = input.required<'dark' | 'light'>();
  readonly themeChange = output<'dark' | 'light'>();
  readonly logout = output<void>();
  private hidePopoverTimeout: ReturnType<typeof setTimeout> | null = null;

  protected setTheme(theme: 'dark' | 'light'): void {
    this.themeChange.emit(theme);
  }

  protected onLogout(): void {
    this.logout.emit();
  }

  protected get roleLabel(): string {
    return this.auth().user.role === 'super_admin' ? 'Super Admin' : 'Part Leader';
  }

  protected get user(): AuthSession['user'] {
    return this.auth().user;
  }

  protected get userInitials(): string {
    return this.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected showAccountPopover(event: Event, popover: Popover): void {
    this.clearHidePopoverTimeout();
    popover.show(event);
  }

  protected scheduleHideAccountPopover(popover: Popover): void {
    this.clearHidePopoverTimeout();
    this.hidePopoverTimeout = setTimeout(() => {
      popover.hide();
    }, 120);
  }

  protected keepAccountPopoverOpen(): void {
    this.clearHidePopoverTimeout();
  }

  private clearHidePopoverTimeout(): void {
    if (this.hidePopoverTimeout) {
      clearTimeout(this.hidePopoverTimeout);
      this.hidePopoverTimeout = null;
    }
  }
}
