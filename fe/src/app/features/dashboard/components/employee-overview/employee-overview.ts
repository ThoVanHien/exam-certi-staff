import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { examItems } from '../../../../core/data/dashboard.data';
import { AuthSession } from '../../../../core/models/auth.model';
import { CertificationEntry, CreateCertificationPayload, EmployeeItem } from '../../../../core/models/dashboard.model';
import { ExamItem } from '../../../../core/models/dashboard.model';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { buildExamPreviewHtml, ExamPreviewDraft } from '../exam-overview/exam-preview.template';

type RemainingCategory = 'Delay' | 'D7' | 'D15' | 'D30' | 'Complete' | 'Total';

interface RemainingStatus {
  plant: string;
  delay: number;
  d7: number;
  d15: number;
  d30: number;
  complete: number;
  total: number;
}

interface CertificationRow extends CertificationEntry {
  isDraft?: boolean;
  certificateFile?: File | null;
}

@Component({
  selector: 'app-employee-overview',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './employee-overview.html',
  styleUrl: './employee-overview.scss',
})
export class EmployeeOverviewComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly employees = input.required<EmployeeItem[]>();
  readonly authSession = input.required<AuthSession>();
  readonly passedCount = input.required<number>();
  readonly scheduledCount = input.required<number>();
  readonly retakeCount = input.required<number>();
  readonly userRole = input.required<string>();
  protected readonly rowsPerPageOptions = [5, 10, 20];

  protected appliedRemainingPlant = signal<string | null>(null);
  protected appliedRemainingCategory = signal<RemainingCategory | null>(null);

  protected certDialogVisible = false;
  protected certFileDialogVisible = false;
  protected examFileDialogVisible = false;
  protected selectedEmployee: EmployeeItem | null = null;
  protected selectedExamFileEmployee: EmployeeItem | null = null;
  protected selectedCertFileEmployee: EmployeeItem | null = null;
  protected isAddingCertification = false;
  protected isSavingCertification = false;
  protected draftCertification: CertificationRow | null = null;

  protected draftDepartment = '';
  protected draftPlant = '';
  protected draftDetailProcess = '';
  protected draftCertificateStatus = '';
  protected draftKeyword = '';

  private readonly appliedDepartment = signal('');
  private readonly appliedPlant = signal('');
  private readonly appliedDetailProcess = signal('');
  private readonly appliedCertificateStatus = signal('');
  private readonly appliedKeyword = signal('');

  protected readonly departmentOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => item.department)),
  );
  protected readonly plantOptions = computed(() => this.buildOptions(this.employees().map((item) => item.plant)));
  protected readonly detailProcessOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => item.detailProcess)),
  );
  protected readonly certificateStatusOptions = computed(() =>
    this.buildOptions(this.employees().map((item) => this.statusLabel(item.certificateStatus))).map((option) => ({
      ...option,
      value: option.value.replaceAll(' ', '_'),
    })),
  );
  protected readonly approvalStatusFormOptions = [
    { label: 'DRAFT', value: 'DRAFT' },
    { label: 'WAITING APPROVAL', value: 'WAITING_APPROVAL' },
    { label: 'APPROVED', value: 'APPROVED' },
    { label: 'REJECTED', value: 'REJECTED' },
    { label: 'CANCELLED', value: 'CANCELLED' },
  ];
  private readonly examCatalog = examItems;

  protected readonly remainingStatuses = computed(() => {
    const statsMap = new Map<string, RemainingStatus>();

    for (const employee of this.employees()) {
      const plantKey = employee.plant;
      if (!statsMap.has(plantKey)) {
        statsMap.set(plantKey, {
          plant: plantKey,
          delay: 0,
          d7: 0,
          d15: 0,
          d30: 0,
          complete: 0,
          total: 0,
        });
      }

      const stat = statsMap.get(plantKey)!;
      const remainingDays = this.calculateRemainingDays(employee.expireDate);

      if (remainingDays === null) {
        stat.total++;
        continue;
      }

      if (remainingDays < 0) stat.delay++;
      else if (remainingDays <= 7) stat.d7++;
      else if (remainingDays <= 15) stat.d15++;
      else if (remainingDays <= 30) stat.d30++;
      else stat.complete++;

      stat.total++;
    }

    return Array.from(statsMap.values()).sort((left, right) => left.plant.localeCompare(right.plant));
  });

  protected readonly totalRemainingStatus = computed(() =>
    this.remainingStatuses().reduce(
      (acc, curr) => ({
        plant: 'TOTAL',
        delay: acc.delay + curr.delay,
        d7: acc.d7 + curr.d7,
        d15: acc.d15 + curr.d15,
        d30: acc.d30 + curr.d30,
        complete: acc.complete + curr.complete,
        total: acc.total + curr.total,
      }),
      { plant: 'TOTAL', delay: 0, d7: 0, d15: 0, d30: 0, complete: 0, total: 0 },
    ),
  );

  protected readonly filteredEmployees = computed(() => {
    const keyword = this.appliedKeyword().trim().toLowerCase();

    return this.employees().filter((item) => {
      const matchesDepartment = !this.appliedDepartment() || item.department === this.appliedDepartment();
      const matchesPlant = !this.appliedPlant() || item.plant === this.appliedPlant();
      const matchesDetailProcess =
        !this.appliedDetailProcess() || item.detailProcess === this.appliedDetailProcess();
      const matchesCertificateStatus =
        !this.appliedCertificateStatus() || item.certificateStatus === this.appliedCertificateStatus();

      let matchesRemaining = true;
      if (this.appliedRemainingCategory()) {
        const category = this.appliedRemainingCategory();
        if (
          this.appliedRemainingPlant() &&
          this.appliedRemainingPlant() !== 'TOTAL' &&
          item.plant !== this.appliedRemainingPlant()
        ) {
          matchesRemaining = false;
        } else if (category !== 'Total') {
          const remainingDays = this.calculateRemainingDays(item.expireDate);
          if (remainingDays === null) {
            matchesRemaining = false;
          } else if (category === 'Delay' && remainingDays >= 0) {
            matchesRemaining = false;
          } else if (category === 'D7' && (remainingDays < 0 || remainingDays > 7)) {
            matchesRemaining = false;
          } else if (category === 'D15' && (remainingDays <= 7 || remainingDays > 15)) {
            matchesRemaining = false;
          } else if (category === 'D30' && (remainingDays <= 15 || remainingDays > 30)) {
            matchesRemaining = false;
          } else if (category === 'Complete' && remainingDays <= 30) {
            matchesRemaining = false;
          }
        }
      }

      const matchesKeyword =
        !keyword ||
        item.id.toLowerCase().includes(keyword) ||
        item.knoxId.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.department.toLowerCase().includes(keyword) ||
        item.team.toLowerCase().includes(keyword) ||
        item.product.toLowerCase().includes(keyword) ||
        item.certificateNo.toLowerCase().includes(keyword);

      return (
        matchesDepartment &&
        matchesPlant &&
        matchesDetailProcess &&
        matchesCertificateStatus &&
        matchesRemaining &&
        matchesKeyword
      );
    });
  });

  openCertDialog(employee: EmployeeItem): void {
    this.selectedEmployee = employee;
    this.isAddingCertification = false;
    this.draftCertification = null;
    this.certDialogVisible = true;
  }

  protected certificationRows(): CertificationRow[] {
    if (!this.selectedEmployee) return [];

    const savedRows = [...this.selectedEmployee.certifications];
    if (this.draftCertification) {
      return [this.draftCertification, ...savedRows];
    }

    return savedRows;
  }

  protected addCertificationRow(): void {
    if (!this.selectedEmployee || this.isAddingCertification) return;

    this.isAddingCertification = true;
    this.draftCertification = {
      isDraft: true,
      examCode: this.selectedEmployee.examCode,
      trainingStartDate: '',
      trainingEndDate: '',
      examDate: '',
      examScore: null,
      passingScore: this.selectedEmployee.passingScore,
      approvalStatus: 'DRAFT',
      certificateNo: '',
      certificateDate: '',
      expireDate: '',
      approver: '',
      certificateFileName: '',
      certificateFile: null,
    };
  }

  protected cancelAddCertification(): void {
    if (this.isSavingCertification) return;

    this.isAddingCertification = false;
    this.draftCertification = null;
  }

  protected saveCertification(): void {
    if (!this.selectedEmployee || !this.draftCertification || !this.canSaveCertification() || this.isSavingCertification) {
      return;
    }

    const examScore = this.toNullableNumber(this.draftCertification.examScore);
    if (examScore === null) return;

    const payload: CreateCertificationPayload = {
      inspectorEid: this.selectedEmployee.id,
      examCode: this.draftCertification.examCode.trim() || this.selectedEmployee.examCode,
      trainingStartDate: this.draftCertification.trainingStartDate,
      trainingEndDate: this.draftCertification.trainingEndDate,
      examDate: this.draftCertification.examDate,
      examScore,
      approvalStatus: this.draftCertification.approvalStatus,
      certificateNo: this.draftCertification.certificateNo.trim(),
      certificateDate: this.draftCertification.certificateDate,
      expireDate: this.draftCertification.expireDate,
      approver: this.draftCertification.approver.trim(),
      certificateFileName: this.draftCertification.certificateFile?.name || this.draftCertification.certificateFileName || '',
    };

    this.isSavingCertification = true;

    this.dashboardService.createCertification(this.authSession().accessToken, payload).subscribe({
      next: (savedEntry) => {
        this.isSavingCertification = false;
        if (!this.selectedEmployee) return;

        this.selectedEmployee.certifications = [savedEntry, ...this.selectedEmployee.certifications];
        this.syncEmployeeSummary(this.selectedEmployee, savedEntry);
        this.cancelAddCertification();
      },
      error: (error) => {
        console.error('Failed to save certification', error);
        this.isSavingCertification = false;
        window.alert(error?.error?.message || 'Failed to save certification.');
      },
    });
  }

  protected deleteCertification(tableIndex: number): void {
    if (!this.selectedEmployee) return;

    const actualIndex = this.isAddingCertification ? tableIndex - 1 : tableIndex;
    if (actualIndex < 0) return;

    this.selectedEmployee.certifications.splice(actualIndex, 1);

    const latest = this.selectedEmployee.certifications[0];
    if (latest) {
      this.syncEmployeeSummary(this.selectedEmployee, latest);
    }
  }

  protected canSaveCertification(): boolean {
    if (!this.draftCertification) return false;

    const examScore = this.toNullableNumber(this.draftCertification.examScore);
    const passingScore = this.toNumber(this.draftCertification.passingScore);

    return Boolean(
      this.draftCertification.trainingStartDate &&
        this.draftCertification.trainingEndDate &&
        this.draftCertification.examDate &&
        examScore !== null &&
        passingScore > 0,
    );
  }

  protected onDraftCertificateFileSelected(event: Event): void {
    if (!this.draftCertification) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.draftCertification.certificateFile = file;
    this.draftCertification.certificateFileName = file?.name ?? '';
  }

  protected clearDraftCertificateFile(input?: HTMLInputElement | null): void {
    if (!this.draftCertification) return;

    this.draftCertification.certificateFile = null;
    this.draftCertification.certificateFileName = '';

    if (input) {
      input.value = '';
    }
  }

  toggleRemainingFilter(plant: string | null, category: RemainingCategory | null): void {
    if (this.appliedRemainingPlant() === plant && this.appliedRemainingCategory() === category) {
      this.appliedRemainingPlant.set(null);
      this.appliedRemainingCategory.set(null);
      return;
    }

    this.appliedRemainingPlant.set(plant);
    this.appliedRemainingCategory.set(category);
  }

  protected applyFilters(): void {
    this.appliedDepartment.set(this.draftDepartment);
    this.appliedPlant.set(this.draftPlant);
    this.appliedDetailProcess.set(this.draftDetailProcess);
    this.appliedCertificateStatus.set(this.draftCertificateStatus);
    this.appliedKeyword.set(this.draftKeyword);
  }

  protected resetFilters(): void {
    this.draftDepartment = '';
    this.draftPlant = '';
    this.draftDetailProcess = '';
    this.draftCertificateStatus = '';
    this.draftKeyword = '';
    this.applyFilters();
  }

  protected getRemainingDays(expireDate: string): number | string {
    const remainingDays = this.calculateRemainingDays(expireDate);
    return remainingDays === null ? '-' : remainingDays;
  }

  protected getRemainingDaysClass(expireDate: string): string {
    const remainingDays = this.calculateRemainingDays(expireDate);
    if (remainingDays === null) return '';
    if (remainingDays < 0) return 'remaining-days-capsule--red';
    if (remainingDays <= 30) return 'remaining-days-capsule--yellow';
    return 'remaining-days-capsule--green';
  }

  protected examStatusSeverity(status: EmployeeItem['examResultStatus']): 'success' | 'warn' | 'danger' {
    if (status === 'PASSED') return 'success';
    if (status === 'FAILED') return 'danger';
    return 'warn';
  }

  protected approvalStatusSeverity(status: EmployeeItem['approvalStatus']): 'success' | 'warn' | 'danger' | 'info' {
    if (status === 'APPROVED') return 'success';
    if (status === 'WAITING_APPROVAL') return 'warn';
    if (status === 'REJECTED') return 'danger';
    return 'info';
  }

  protected certificateStatusSeverity(
    status: EmployeeItem['certificateStatus'],
  ): 'success' | 'warn' | 'danger' | 'info' {
    if (status === 'ACTIVE') return 'success';
    if (status === 'EXPIRED') return 'danger';
    if (status === 'REVOKED') return 'warn';
    return 'info';
  }

  protected statusLabel(value: string): string {
    return value.replaceAll('_', ' ');
  }

  protected formatScore(score: number | null): string {
    return typeof score === 'number' ? `${score}` : '-';
  }

  protected formatDateLabel(value: string): string {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-GB');
  }

  protected certificationStatusForRow(row: CertificationEntry): EmployeeItem['certificateStatus'] {
    if (!row.certificateDate) return 'NOT_ISSUED';

    const remainingDays = this.calculateRemainingDays(row.expireDate);
    return typeof remainingDays === 'number' && remainingDays < 0 ? 'EXPIRED' : 'ACTIVE';
  }

  protected previewExamPdf(examCode: string, examDate?: string, employee?: EmployeeItem | null, event?: Event): void {
    event?.stopPropagation();

    const examItem = this.examCatalog.find((item) => item.code === examCode) ?? this.buildFallbackExamItem(examCode);
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const html = buildExamPreviewHtml(this.buildPreviewDraft(examItem, examDate, employee ?? this.selectedEmployee), examItem, 'dark');
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  }

  protected hasExamFile(employee: EmployeeItem): boolean {
    return Boolean(employee.examCode);
  }

  protected examFileName(employee: EmployeeItem): string {
    return this.hasExamFile(employee) ? `${employee.examCode}.pdf` : '-';
  }

  protected hasCertFile(employee: EmployeeItem): boolean {
    return employee.approvalStatus === 'APPROVED' && Boolean(employee.certificateNo);
  }

  protected certFileName(employee: EmployeeItem): string {
    return this.hasCertFile(employee) ? `${employee.certificateNo}.pdf` : '';
  }

  protected openExamFileActions(employee: EmployeeItem, event?: Event): void {
    event?.stopPropagation();
    this.selectedExamFileEmployee = employee;
    this.examFileDialogVisible = true;
  }

  protected viewExamFileDirectly(): void {
    if (!this.selectedExamFileEmployee) return;

    const employee = this.selectedExamFileEmployee;
    this.examFileDialogVisible = false;
    this.previewExamPdf(employee.examCode, employee.examDate, employee);
  }

  protected downloadExamFile(): void {
    if (!this.selectedExamFileEmployee) return;

    const employee = this.selectedExamFileEmployee;
    const examItem = this.examCatalog.find((item) => item.code === employee.examCode) ?? this.buildFallbackExamItem(employee.examCode);
    const html = buildExamPreviewHtml(this.buildPreviewDraft(examItem, employee.examDate, employee), examItem, 'dark');
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.examFileName(employee).replace(/\.pdf$/i, '.html');
    anchor.click();
    URL.revokeObjectURL(url);
    this.examFileDialogVisible = false;
  }

  protected openCertFileActions(employee: EmployeeItem, event?: Event): void {
    event?.stopPropagation();
    this.selectedCertFileEmployee = employee;
    this.certFileDialogVisible = true;
  }

  protected openCertRowFileActions(row: CertificationEntry, event?: Event): void {
    event?.stopPropagation();
    if (!this.selectedEmployee) return;

    const blendedEmployee: EmployeeItem = {
      ...this.selectedEmployee,
      certificateNo: row.certificateNo,
      certificateDate: row.certificateDate,
      expireDate: row.expireDate,
      approver: row.approver,
      approvalStatus: row.approvalStatus
    };
    this.selectedCertFileEmployee = blendedEmployee;
    this.certFileDialogVisible = true;
  }

  protected viewCertFileDirectly(): void {
    if (!this.selectedCertFileEmployee) return;

    const employee = this.selectedCertFileEmployee;
    this.certFileDialogVisible = false;
    this.previewCertificatePdf(employee);
  }

  protected downloadCertFile(): void {
    if (!this.selectedCertFileEmployee) return;

    const employee = this.selectedCertFileEmployee;
    const html = this.buildCertificateHtml(employee);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.certFileName(employee).replace(/\.pdf$/i, '.html');
    anchor.click();
    URL.revokeObjectURL(url);
    this.certFileDialogVisible = false;
  }

  protected previewCertificatePdf(employee: EmployeeItem): void {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const html = this.buildCertificateHtml(employee);
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  }

  private buildCertificateHtml(employee: EmployeeItem): string {
    const certDate = employee.certificateDate ? new Date(employee.certificateDate).toLocaleDateString('vi-VN') : '-';
    const expireDate = employee.expireDate ? new Date(employee.expireDate).toLocaleDateString('vi-VN') : '-';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Certificate - ${employee.certificateNo}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #090d16;
        color: #e2e8f0;
        font-family: 'Montserrat', sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 80px);
      }
      .cert-container {
        position: relative;
        width: 800px;
        height: 560px;
        padding: 40px;
        border: 12px double #d4af37;
        background: #111827;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        box-sizing: border-box;
      }
      .cert-container::before {
        content: "";
        position: absolute;
        top: 8px;
        bottom: 8px;
        left: 8px;
        right: 8px;
        border: 2px solid #d4af37;
        pointer-events: none;
      }
      .cert-title {
        font-family: 'Cinzel', serif;
        font-size: 32px;
        color: #fbbf24;
        letter-spacing: 4px;
        margin-top: 10px;
        margin-bottom: 5px;
        text-transform: uppercase;
        font-weight: 700;
      }
      .cert-subtitle {
        font-size: 14px;
        letter-spacing: 3px;
        color: #94a3b8;
        text-transform: uppercase;
        margin-bottom: 30px;
      }
      .cert-to {
        font-size: 16px;
        font-style: italic;
        color: #94a3b8;
        margin-bottom: 15px;
      }
      .cert-name {
        font-family: 'Cinzel', serif;
        font-size: 36px;
        font-weight: 700;
        color: #ffffff;
        border-bottom: 2px solid #d4af37;
        display: inline-block;
        padding-bottom: 8px;
        margin-bottom: 20px;
        min-width: 320px;
      }
      .cert-desc {
        font-size: 15px;
        line-height: 1.6;
        color: #cbd5e1;
        max-width: 600px;
        margin: 0 auto 30px;
      }
      .cert-desc strong {
        color: #ffffff;
        font-weight: 600;
      }
      .cert-meta-row {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        margin-top: 40px;
      }
      .meta-item {
        flex: 1;
      }
      .meta-line {
        border-top: 1px solid #475569;
        margin-top: 8px;
        padding-top: 6px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #94a3b8;
      }
      .meta-value {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }
      .cert-seal {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, #fbbf24 40%, #d4af37 100%);
        border-radius: 50%;
        border: 4px double #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .cert-seal-inner {
        font-family: 'Cinzel', serif;
        font-size: 10px;
        font-weight: 700;
        color: #111827;
        text-align: center;
        line-height: 1.1;
      }
    </style>
  </head>
  <body>
    <div class="cert-container">
      <div class="cert-title">Certificate of Competency</div>
      <div class="cert-subtitle">Inspector Certification</div>
      <div class="cert-to">This is proudly presented to</div>
      <div class="cert-name">${employee.name}</div>
      <div class="cert-desc">
        For successfully demonstrating the required competence and qualification standards as a certified Inspector for the process of 
        <strong>${employee.process}</strong> / <strong>${employee.detailProcess}</strong> at plant <strong>${employee.plant}</strong>.
      </div>
      <div class="cert-meta-row">
        <div class="meta-item">
          <div class="meta-value">${employee.certificateNo}</div>
          <div class="meta-line">Certificate No</div>
        </div>
        <div class="meta-item" style="visibility: hidden; max-width: 100px;">
        </div>
        <div class="meta-item">
          <div class="meta-value">${certDate}</div>
          <div class="meta-line">Issue Date</div>
        </div>
        <div class="meta-item">
          <div class="meta-value">${employee.approver || '-'}</div>
          <div class="meta-line">Authorized By</div>
        </div>
      </div>
      <div class="cert-seal">
        <div class="cert-seal-inner">SEHC<br>PASSED</div>
      </div>
    </div>
  </body>
</html>`;
  }

  protected openApprovalPreview(employee: EmployeeItem, event?: Event): void {
    event?.stopPropagation();

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Approval Preview</title>
    <style>
      body{margin:0;padding:32px;font-family:Inter,Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0}
      .sheet{max-width:880px;margin:0 auto;padding:28px;border:1px solid #334155;border-radius:20px;background:#111c2d}
      h1{margin:0 0 8px;font-size:28px}
      p{margin:0 0 24px;color:#94a3b8}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .item{padding:14px 16px;border:1px solid #334155;border-radius:14px;background:#0f172a}
      .label{display:block;margin-bottom:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8}
      .value{font-size:16px;font-weight:600}
      .status{display:inline-flex;align-items:center;justify-content:center;margin-top:22px;padding:10px 18px;border-radius:999px;background:#1d4d40;color:#86efac;font-weight:700}
    </style>
  </head>
  <body>
    <div class="sheet">
      <h1>Approval Preview</h1>
      <p>Temporary preview for approval module integration.</p>
      <div class="grid">
        <div class="item"><span class="label">Inspector</span><span class="value">${employee.name}</span></div>
        <div class="item"><span class="label">EID</span><span class="value">${employee.id}</span></div>
        <div class="item"><span class="label">Approval Status</span><span class="value">${this.statusLabel(employee.approvalStatus)}</span></div>
        <div class="item"><span class="label">Approver</span><span class="value">${employee.approver || '-'}</span></div>
        <div class="item"><span class="label">Certificate No</span><span class="value">${employee.certificateNo || '-'}</span></div>
        <div class="item"><span class="label">Exam Code</span><span class="value">${employee.examCode || '-'}</span></div>
      </div>
      <div class="status">${this.statusLabel(employee.approvalStatus)}</div>
    </div>
  </body>
</html>`;

    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  }

  protected trackCertificationRow(index: number, row: CertificationRow): string {
    if (row.isDraft) return 'draft-row';

    return `${row.certificateNo || 'no-cert'}-${row.examDate || index}`;
  }

  private calculateRemainingDays(expireDate: string): number | null {
    if (!expireDate) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endDate = new Date(expireDate).getTime();

    if (Number.isNaN(endDate)) return null;

    return Math.floor((endDate - startOfToday) / (1000 * 60 * 60 * 24));
  }

  private buildOptions(values: string[]): { label: string; value: string }[] {
    return Array.from(new Set(values))
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .map((value) => ({ label: value, value }));
  }

  private toNumber(value: number | string | null): number {
    return Number(value ?? 0);
  }

  private toNullableNumber(value: number | string | null): number | null {
    if (value === null || value === '') return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private syncEmployeeSummary(employee: EmployeeItem, latest: CertificationEntry): void {
    employee.examCode = latest.examCode;
    employee.trainingStartDate = latest.trainingStartDate;
    employee.trainingEndDate = latest.trainingEndDate;
    employee.examDate = latest.examDate;
    employee.examScore = latest.examScore;
    employee.passingScore = latest.passingScore;
    employee.approvalStatus = latest.approvalStatus;
    employee.certificateNo = latest.certificateNo;
    employee.certificateDate = latest.certificateDate;
    employee.expireDate = latest.expireDate;
    employee.approver = latest.approver;
    employee.examResultStatus =
      typeof latest.examScore === 'number' && latest.examScore >= latest.passingScore ? 'PASSED' : 'FAILED';

    if (!latest.certificateDate) {
      employee.certificateStatus = 'NOT_ISSUED';
      return;
    }

    const remainingDays = this.calculateRemainingDays(latest.expireDate);
    employee.certificateStatus =
      typeof remainingDays === 'number' && remainingDays < 0 ? 'EXPIRED' : 'ACTIVE';
  }

  private buildFallbackExamItem(examCode: string): ExamItem {
    return {
      id: 0,
      code: examCode || 'EX-UNKNOWN',
      title: this.selectedEmployee ? `${this.selectedEmployee.detailProcess} Certification Exam` : 'Certification Exam',
      description: 'Generated preview for inspector certification review.',
      department: this.selectedEmployee?.department || 'General',
      createdBy: 'System',
      questionCount: 2,
      durationMinutes: 20,
      status: 'Published',
    };
  }

  private buildPreviewDraft(examItem: ExamItem, examDate?: string, employee?: EmployeeItem | null): ExamPreviewDraft {
    const detailProcess = employee?.detailProcess || 'inspection';
    const product = employee?.product || 'current product';

    return {
      description: examItem.description,
      employeeName: employee?.name,
      employeeEid: employee?.id,
      employeeKnoxId: employee?.knoxId,
      employeeDepartment: employee?.department,
      employeeTeam: employee?.team,
      examDate: examDate ? this.formatDateLabel(examDate) : undefined,
      questions: [
        {
          prompt: `What is the correct inspection flow for ${detailProcess} on ${product}?`,
          imagePreview: null,
          correctAnswer: 'B',
          answers: [
            { key: 'A', text: 'Skip visual verification if prior lot was approved.', imagePreview: null },
            { key: 'B', text: 'Verify standard, inspect sample, record result, and escalate abnormalities.', imagePreview: null },
            { key: 'C', text: 'Approve the lot before documenting the result.', imagePreview: null },
            { key: 'D', text: 'Inspect only if the operator requests support.', imagePreview: null },
          ],
        },
        {
          prompt: `Which action is required before issuing an inspector certificate for ${examItem.code}?`,
          imagePreview: null,
          correctAnswer: 'C',
          answers: [
            { key: 'A', text: 'Only training completion is required.', imagePreview: null },
            { key: 'B', text: 'Approval can be skipped for renewals.', imagePreview: null },
            { key: 'C', text: 'A passing exam result and approval completion are both required.', imagePreview: null },
            { key: 'D', text: 'Certificate can be issued before the exam date.', imagePreview: null },
          ],
        },
      ],
    };
  }
}
