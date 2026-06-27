import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ExamItem } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-exam-overview',
  imports: [FormsModule, CardModule, InputTextModule, SelectModule, ButtonModule, TableModule, TagModule],
  templateUrl: './exam-overview.html',
  styleUrl: './exam-overview.scss',
})
export class ExamOverviewComponent {
  readonly exams = input.required<ExamItem[]>();
  readonly userRole = input.required<string>();
  protected readonly rowsPerPageOptions = [5, 10, 20];
  protected draftKeyword = '';
  protected draftDepartment = '';
  private readonly appliedKeyword = signal('');
  private readonly appliedDepartment = signal('');
  protected readonly departmentOptions = computed(() => this.buildOptions(this.exams().map((item) => item.department)));
  protected readonly filteredExams = computed(() => {
    const keyword = this.appliedKeyword().trim().toLowerCase();

    return this.exams().filter((item) => {
      const matchesDepartment = !this.appliedDepartment() || item.department === this.appliedDepartment();
      const matchesKeyword =
        !keyword ||
        item.code.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.createdBy.toLowerCase().includes(keyword);

      return matchesDepartment && matchesKeyword;
    });
  });

  protected applyFilters(): void {
    this.appliedKeyword.set(this.draftKeyword);
    this.appliedDepartment.set(this.draftDepartment);
  }

  protected resetFilters(): void {
    this.draftKeyword = '';
    this.draftDepartment = '';
    this.applyFilters();
  }

  protected statusSeverity(status: ExamItem['status']): 'success' | 'warn' | 'secondary' {
    if (status === 'Published') {
      return 'success';
    }

    if (status === 'Draft') {
      return 'warn';
    }

    return 'secondary';
  }

  private buildOptions(values: string[]): { label: string; value: string }[] {
    return Array.from(new Set(values))
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .map((value) => ({ label: value, value }));
  }
}
