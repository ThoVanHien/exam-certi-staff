import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeItem } from '../../../../core/models/dashboard.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-employee-overview',
  imports: [FormsModule, CardModule, TableModule, TagModule, SelectModule, InputTextModule, ButtonModule],
  templateUrl: './employee-overview.html',
  styleUrl: './employee-overview.scss',
})
export class EmployeeOverviewComponent {
  readonly employees = input.required<EmployeeItem[]>();
  readonly passedCount = input.required<number>();
  readonly scheduledCount = input.required<number>();
  readonly retakeCount = input.required<number>();
  readonly userRole = input.required<string>();
  protected readonly rowsPerPageOptions = [5, 10, 20];
  protected draftDepartment = '';
  protected draftCertification = '';
  protected draftExamStatus = '';
  protected draftExpiryYear = '';
  protected draftKeyword = '';
  private readonly appliedDepartment = signal('');
  private readonly appliedCertification = signal('');
  private readonly appliedExamStatus = signal('');
  private readonly appliedExpiryYear = signal('');
  private readonly appliedKeyword = signal('');
  protected readonly departmentOptions = computed(() => this.buildOptions(this.employees().map((item) => item.department)));
  protected readonly certificationOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => item.certification)),
  );
  protected readonly examStatusOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => item.examStatus)),
  );
  protected readonly expiryYearOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => item.expiry.split('-')[0] ?? '')),
  );
  protected readonly filteredEmployees = computed(() => {
    const keyword = this.appliedKeyword().trim().toLowerCase();

    return this.employees().filter((item) => {
      const matchesDepartment = !this.appliedDepartment() || item.department === this.appliedDepartment();
      const matchesCertification =
        !this.appliedCertification() || item.certification === this.appliedCertification();
      const matchesExamStatus = !this.appliedExamStatus() || item.examStatus === this.appliedExamStatus();
      const matchesExpiryYear =
        !this.appliedExpiryYear() || item.expiry.startsWith(this.appliedExpiryYear());
      const matchesKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword) ||
        item.department.toLowerCase().includes(keyword) ||
        item.certification.toLowerCase().includes(keyword);

      return (
        matchesDepartment &&
        matchesCertification &&
        matchesExamStatus &&
        matchesExpiryYear &&
        matchesKeyword
      );
    });
  });
  protected readonly filteredPassedCount = computed(
    () => this.filteredEmployees().filter((item) => item.examStatus === 'Passed').length,
  );
  protected readonly filteredScheduledCount = computed(
    () => this.filteredEmployees().filter((item) => item.examStatus === 'Scheduled').length,
  );
  protected readonly filteredRetakeCount = computed(
    () => this.filteredEmployees().filter((item) => item.examStatus === 'Retake').length,
  );

  protected applyFilters(): void {
    this.appliedDepartment.set(this.draftDepartment);
    this.appliedCertification.set(this.draftCertification);
    this.appliedExamStatus.set(this.draftExamStatus);
    this.appliedExpiryYear.set(this.draftExpiryYear);
    this.appliedKeyword.set(this.draftKeyword);
  }

  protected resetFilters(): void {
    this.draftDepartment = '';
    this.draftCertification = '';
    this.draftExamStatus = '';
    this.draftExpiryYear = '';
    this.draftKeyword = '';
    this.applyFilters();
  }

  protected statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    if (status === 'Passed') {
      return 'success';
    }

    if (status === 'Scheduled') {
      return 'warn';
    }

    if (status === 'Retake') {
      return 'danger';
    }

    return 'info';
  }

  protected statusIcon(status: string): string {
    if (status === 'Passed') {
      return 'pi pi-check-circle';
    }

    if (status === 'Scheduled') {
      return 'pi pi-calendar';
    }

    if (status === 'Retake') {
      return 'pi pi-refresh';
    }

    return 'pi pi-info-circle';
  }

  private buildOptions(values: string[]): { label: string; value: string }[] {
    return Array.from(new Set(values))
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .map((value) => ({ label: value, value }));
  }
}
