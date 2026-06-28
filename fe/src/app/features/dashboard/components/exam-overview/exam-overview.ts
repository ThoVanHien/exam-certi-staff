import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ExamItem } from '../../../../core/models/dashboard.model';
import { buildExamPreviewHtml, ExamPreviewAnswer, ExamPreviewQuestion } from './exam-preview.template';


type ChoiceKey = 'A' | 'B' | 'C' | 'D';
type EditorMode = 'list' | 'create' | 'edit';

interface AnswerDraft {
  key: ChoiceKey;
  text: string;
  imageName: string;
  imagePreview: string | null;
}

interface QuestionDraft {
  id: number;
  sourceNumber: number;
  prompt: string;
  imageName: string;
  imagePreview: string | null;
  correctAnswer: ChoiceKey;
  answers: AnswerDraft[];
}

interface ExamDraft {
  code: string;
  title: string;
  description: string;
  questions: QuestionDraft[];
}

type DraftField = keyof Omit<ExamDraft, 'questions'>;

interface ParsedPdfExam {
  title: string;
  description: string;
  questions: QuestionDraft[];
  answerKeyDetected: boolean;
}

@Component({
  selector: 'app-exam-overview',
  imports: [FormsModule, CardModule, InputTextModule, SelectModule, ButtonModule, TableModule, TagModule, ConfirmDialogModule],
  templateUrl: './exam-overview.html',
  styleUrl: './exam-overview.scss',
  providers: [ConfirmationService],
})
export class ExamOverviewComponent implements OnInit, OnDestroy {
  readonly exams = input.required<ExamItem[]>();
  readonly userRole = input.required<string>();
  readonly currentTheme = input<'light' | 'dark'>('dark');
  readonly startExam = output<number>();
  readonly deleteExamApi = output<number>();
  private readonly confirmationService = inject(ConfirmationService);

  protected onStartExam(item: ExamItem): void {
    console.log('ExamOverviewComponent: onStartExam called for exam', item.id);
    this.startExam.emit(item.id);
  }

  protected readonly rowsPerPageOptions = [5, 10, 20];
  protected draftKeyword = '';
  protected draftDepartment = '';
  protected readonly editorMode = signal<EditorMode>('list');
  protected readonly notice = signal('');
  protected readonly editingExamId = signal<number | null>(null);
  protected readonly isImportingPdf = signal(false);
  protected readonly importSummary = signal('');
  protected readonly importDebug = signal('');
  protected readonly examDraft = signal<ExamDraft>(this.createEmptyExamDraft());
  protected readonly totalQuestionCount = computed(() => this.examDraft().questions.length);

  private readonly appliedKeyword = signal('');
  private readonly appliedDepartment = signal('');
  private readonly createdExams = signal<ExamItem[]>([]);
  private readonly editedExams = signal<Record<number, ExamItem>>({});
  private readonly deletedExamIds = signal<number[]>([]);
  private readonly storedDrafts = signal<Record<number, ExamDraft>>({});

  protected readonly allExams = computed(() => {
    const deletedIds = new Set(this.deletedExamIds());
    const edited = this.editedExams();
    const originalExams = this.exams()
      .filter((item) => !deletedIds.has(item.id))
      .map((item) => edited[item.id] ?? item);
    const localExams = this.createdExams().filter((item) => !deletedIds.has(item.id));

    return [...localExams, ...originalExams];
  });

  protected readonly departmentOptions = computed(() => this.buildOptions(this.allExams().map((item) => item.department)));

  protected readonly filteredExams = computed(() => {
    const keyword = this.appliedKeyword().trim().toLowerCase();

    return this.allExams().filter((item) => {
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

  protected readonly editorTitle = computed(() =>
    this.editorMode() === 'edit' ? 'Edit Multiple Choice Exam' : 'Create Multiple Choice Exam',
  );

  protected readonly editorDescription = computed(() =>
    this.editorMode() === 'edit'
      ? 'Update the exam metadata, refine ABCD questions, and refresh uploaded images before saving the revision.'
      : 'Draft exam metadata, add ABCD questions, mark the correct answer, and upload images for both the prompt and each choice.',
  );

  protected applyFilters(): void {
    this.appliedKeyword.set(this.draftKeyword);
    this.appliedDepartment.set(this.draftDepartment);
  }

  protected resetFilters(): void {
    this.draftKeyword = '';
    this.draftDepartment = '';
    this.applyFilters();
  }

  protected openCreatePage(): void {
    this.examDraft.set(this.createEmptyExamDraft());
    this.editingExamId.set(null);
    this.notice.set('');
    this.importSummary.set('');
    this.importDebug.set('');
    this.editorMode.set('create');
    this.setEditorHash('new');
  }

  protected openEditPage(item: ExamItem): void {
    const storedDraft = this.storedDrafts()[item.id];
    const nextDraft = storedDraft ? this.cloneDraft(storedDraft) : this.createDraftFromExam(item);

    this.examDraft.set(nextDraft);
    this.editingExamId.set(item.id);
    this.notice.set('');
    this.importSummary.set('');
    this.importDebug.set('');
    this.editorMode.set('edit');
    this.setEditorHash(`edit/${item.id}`);
  }

  protected returnToListPage(): void {
    this.editorMode.set('list');
    this.editingExamId.set(null);
    this.setEditorHash('');
  }

  protected addQuestion(): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: [...draft.questions, this.createEmptyQuestionDraft()],
    }));
  }

  protected removeQuestion(questionId: number): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.filter((question) => question.id !== questionId),
    }));
  }

  protected updateDraftField(field: DraftField, value: string): void {
    this.examDraft.update((draft) => ({
      ...draft,
      [field]: value,
    }));
  }

  protected updateQuestionPrompt(questionId: number, value: string): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              prompt: value,
            }
          : question,
      ),
    }));
  }

  protected updateQuestionCorrectAnswer(questionId: number, answerKey: ChoiceKey): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              correctAnswer: answerKey,
            }
          : question,
      ),
    }));
  }

  protected updateAnswerText(questionId: number, answerKey: ChoiceKey, value: string): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) =>
                answer.key === answerKey
                  ? {
                      ...answer,
                      text: value,
                    }
                  : answer,
              ),
            }
          : question,
      ),
    }));
  }

  protected async onImportSourceSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isImportingPdf.set(true);
    this.notice.set('');
    this.importSummary.set('');
    this.importDebug.set('');

    try {
      const parsed = await this.parseImportSource(file);

      if (parsed.questions.length === 0) {
        this.notice.set('No multiple-choice questions were detected in that file. Please try another file or enter questions manually.');
      } else {
        this.examDraft.update((draft) => ({
          ...draft,
          title: parsed.title || draft.title,
          description: parsed.description || draft.description,
          questions: parsed.questions,
        }));
        this.importSummary.set(
          parsed.answerKeyDetected
            ? `Imported ${parsed.questions.length} questions from ${file.name} and detected at least part of the answer key.`
            : `Imported ${parsed.questions.length} questions from ${file.name}. OCR support was used where possible, but please still review the correct answers manually if needed.`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown PDF import error.';
      this.importDebug.set(message);
      this.notice.set('Unable to read that file right now. Please try another file or check whether the source image/text is clear enough.');
    } finally {
      this.isImportingPdf.set(false);
      input.value = '';
    }
  }

  protected onQuestionImageSelected(event: Event, questionId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.readFileAsDataUrl(file).then((result) => {
      this.examDraft.update((draft) => ({
        ...draft,
        questions: draft.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                imageName: file.name,
                imagePreview: result,
              }
            : question,
        ),
      }));
    });

    input.value = '';
  }

  protected clearQuestionImage(questionId: number): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              imageName: '',
              imagePreview: null,
            }
          : question,
      ),
    }));
  }

  protected onAnswerImageSelected(event: Event, questionId: number, answerKey: ChoiceKey): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.readFileAsDataUrl(file).then((result) => {
      this.examDraft.update((draft) => ({
        ...draft,
        questions: draft.questions.map((question) =>
          question.id === questionId
            ? {
                ...question,
                answers: question.answers.map((answer) =>
                  answer.key === answerKey
                    ? {
                        ...answer,
                        imageName: file.name,
                        imagePreview: result,
                      }
                    : answer,
                ),
              }
            : question,
        ),
      }));
    });

    input.value = '';
  }

  protected clearAnswerImage(questionId: number, answerKey: ChoiceKey): void {
    this.examDraft.update((draft) => ({
      ...draft,
      questions: draft.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answers: question.answers.map((answer) =>
                answer.key === answerKey
                  ? {
                      ...answer,
                      imageName: '',
                      imagePreview: null,
                    }
                  : answer,
              ),
            }
          : question,
      ),
    }));
  }

  protected saveExam(status: ExamItem['status']): void {
    const examId = this.editingExamId();
    const draft = this.cloneDraft(this.examDraft());
    const existingExam = examId ? this.allExams().find((item) => item.id === examId) ?? null : null;
    const nextId = examId ?? this.allExams().reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
    const nextItem = this.buildExamItem(nextId, draft, status, existingExam);

    this.storedDrafts.update((drafts) => ({
      ...drafts,
      [nextId]: draft,
    }));

    if (examId === null) {
      this.createdExams.update((items) => [nextItem, ...items]);
      this.notice.set(
        status === 'Published'
          ? 'The new examination has been published to the local roster.'
          : 'The new examination has been saved as a local draft.',
      );
    } else if (this.createdExams().some((item) => item.id === examId)) {
      this.createdExams.update((items) => items.map((item) => (item.id === examId ? nextItem : item)));
      this.notice.set('The local examination draft has been updated.');
    } else {
      this.editedExams.update((items) => ({
        ...items,
        [examId]: nextItem,
      }));
      this.notice.set('The examination has been updated in this local preview session.');
    }

    this.editorMode.set('list');
    this.editingExamId.set(null);
    this.examDraft.set(this.createEmptyExamDraft());
    this.setEditorHash('');
  }

  protected previewCurrentDraftPdf(): void {
    const examId = this.editingExamId();
    const currentItem = examId ? this.allExams().find((item) => item.id === examId) ?? null : null;
    const exam = this.buildExamItem(examId ?? 0, this.examDraft(), currentItem?.status ?? 'Draft', currentItem);

    this.openPdfPreview(this.examDraft(), exam, this.currentTheme());
  }

  protected previewExamPdf(item: ExamItem): void {
    const draft = this.storedDrafts()[item.id] ?? this.createDraftFromExam(item);
    this.openPdfPreview(draft, item, this.currentTheme());
  }

  protected confirmDeleteExam(event: Event, item: ExamItem): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn xóa đề thi "${item.title}" khỏi danh sách?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-trash',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => this.deleteExam(item),
    });
  }

  protected deleteExam(item: ExamItem): void {
    if (this.createdExams().some((entry) => entry.id === item.id)) {
      this.createdExams.update((items) => items.filter((entry) => entry.id !== item.id));
    } else {
      this.deletedExamIds.update((ids) => Array.from(new Set([...ids, item.id])));
    }

    this.storedDrafts.update((drafts) => {
      const nextDrafts = { ...drafts };
      delete nextDrafts[item.id];
      return nextDrafts;
    });

    this.editedExams.update((items) => {
      const nextItems = { ...items };
      delete nextItems[item.id];
      return nextItems;
    });

    // Notify parent to delete in database
    this.deleteExamApi.emit(item.id);

    this.notice.set(`The examination "${item.title}" has been deleted.`);
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

  private createEmptyExamDraft(): ExamDraft {
    return {
      code: '',
      title: '',
      description: '',
      questions: [this.createEmptyQuestionDraft()],
    };
  }

  private createDraftFromExam(item: ExamItem): ExamDraft {
    return {
      code: item.code,
      title: item.title,
      description: item.description,
      questions: [this.createEmptyQuestionDraft()],
    };
  }

  private createEmptyQuestionDraft(): QuestionDraft {
    return {
      id: this.createQuestionId(),
      sourceNumber: 0,
      prompt: '',
      imageName: '',
      imagePreview: null,
      correctAnswer: 'A',
      answers: ['A', 'B', 'C', 'D'].map((key) => ({
        key: key as ChoiceKey,
        text: '',
        imageName: '',
        imagePreview: null,
      })),
    };
  }

  private async extractPdfLines(file: File): Promise<string[]> {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url,
    ).toString();
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    } as unknown as Parameters<typeof pdfjs.getDocument>[0]);
    const pdf = await loadingTask.promise;
    const lines: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = (content.items as Array<{ str: string; transform: number[] }>)
        .filter((item) => item.str?.trim())
        .map((item) => ({
          text: item.str.trim(),
          x: item.transform[4],
          y: item.transform[5],
        }))
        .sort((left, right) => {
          if (Math.abs(left.y - right.y) > 3) {
            return right.y - left.y;
          }

          return left.x - right.x;
        });

      const groupedLines: Array<{ y: number; parts: Array<{ x: number; text: string }> }> = [];

      items.forEach((item) => {
        const lastLine = groupedLines[groupedLines.length - 1];

        if (lastLine && Math.abs(lastLine.y - item.y) <= 3) {
          lastLine.parts.push({ x: item.x, text: item.text });
          return;
        }

        groupedLines.push({
          y: item.y,
          parts: [{ x: item.x, text: item.text }],
        });
      });

      groupedLines.forEach((line) => {
        const text = line.parts
          .sort((left, right) => left.x - right.x)
          .map((part) => part.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (text) {
          lines.push(text);
        }
      });
    }

    return lines;
  }

  private async extractPdfOcrLines(file: File): Promise<string[]> {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url,
    ).toString();
    const { createWorker, PSM } = await import('tesseract.js');
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    } as unknown as Parameters<typeof pdfjs.getDocument>[0]).promise;
    const worker = await createWorker('vie+eng', 1, {
      logger: (message: { status: string; progress: number }) => {
        if (message.status && typeof message.progress === 'number') {
          this.importDebug.set(`OCR ${message.status} ${Math.round(message.progress * 100)}%`);
        }
      },
    });
    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const lines: string[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        this.importDebug.set(`OCR page ${pageNumber}/${pdf.numPages}...`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Unable to create OCR canvas context.');
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const {
          data: { text },
        } = await worker.recognize(canvas);

        text
          .split(/\n+/)
          .map((line) => this.normalizeOcrLine(line))
          .filter(Boolean)
          .forEach((line) => lines.push(line));
      }
    } finally {
      await worker.terminate();
    }

    return lines;
  }

  private async extractImageOcrLines(file: File): Promise<string[]> {
    const { createWorker, PSM } = await import('tesseract.js');
    const worker = await createWorker('vie+eng', 1, {
      logger: (message: { status: string; progress: number }) => {
        if (message.status && typeof message.progress === 'number') {
          this.importDebug.set(`OCR ${message.status} ${Math.round(message.progress * 100)}%`);
        }
      },
    });
    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: PSM.AUTO,
    });

    try {
      this.importDebug.set('OCR image source...');
      const {
        data: { text },
      } = await worker.recognize(file);

      return text
        .split(/\n+/)
        .map((line) => this.normalizeOcrLine(line))
        .filter(Boolean);
    } finally {
      await worker.terminate();
    }
  }

  private parseExamFromPdf(lines: string[], fileName: string): ParsedPdfExam {
    const normalizedLines = lines.map((line) => this.normalizePdfLine(line)).filter(Boolean);
    const answerKey = this.extractAnswerKey(normalizedLines);
    const blankContexts = this.extractBlankContexts(normalizedLines);
    const blocks = this.extractQuestionBlocks(normalizedLines);
    const questions = blocks
      .map((block) => this.parseQuestionBlock(block, answerKey, blankContexts))
      .filter((question): question is QuestionDraft => question !== null);

    return {
      title: this.extractPdfTitle(normalizedLines, fileName),
      description: `Imported from ${fileName}. Review the generated questions and attached choices before publishing.`,
      questions,
      answerKeyDetected: Object.keys(answerKey).length > 0,
    };
  }

  private extractAnswerKey(lines: string[]): Record<number, ChoiceKey> {
    const answerKey: Record<number, ChoiceKey> = {};

    lines
      .filter((line) => /answer key|đáp án|answers:/i.test(line))
      .forEach((line) => {
        const matches = line.matchAll(/\b(\d{1,3})[\.\):\-\s]+([ABCD])\b/g);

        for (const match of matches) {
          const questionNumber = Number(match[1]);
          const answer = match[2] as ChoiceKey;

          if (questionNumber > 0 && !answerKey[questionNumber]) {
            answerKey[questionNumber] = answer;
          }
        }
      });

    return answerKey;
  }

  private extractQuestionBlocks(lines: string[]): string[] {
    const blocks: string[] = [];
    let currentBlock = '';

    lines.forEach((line) => {
      if (/^(?:Question\s+)?\d{1,3}\s*[\.\):]/i.test(line)) {
        if (currentBlock) {
          blocks.push(currentBlock.trim());
        }

        currentBlock = line;
        return;
      }

      if (currentBlock) {
        currentBlock = `${currentBlock} ${line}`.trim();
      }
    });

    if (currentBlock) {
      blocks.push(currentBlock.trim());
    }

    return blocks;
  }

  private parseQuestionBlock(
    block: string,
    answerKey: Record<number, ChoiceKey>,
    blankContexts: Record<number, string>,
  ): QuestionDraft | null {
    const normalizedBlock = this.normalizePdfLine(block);
    const questionMatch = normalizedBlock.match(/^(?:Question\s+)?(\d{1,3})\s*[\.\):]?\s*(.*)$/i);

    if (!questionMatch) {
      return null;
    }

    const questionNumber = Number(questionMatch[1]);
    const body = questionMatch[2].trim();
    const optionPattern = /(^|\s)\(?([ABCD])\)?\s*[\.\):]?\s*(.*?)(?=(\s+\(?[ABCD]\)?\s*[\.\):]?\s*)|$)/gs;
    const optionMatches = [...body.matchAll(optionPattern)];

    if (optionMatches.length < 4) {
      return null;
    }

    const firstOptionIndex = optionMatches[0].index ?? 0;
    const inlinePrompt = body.slice(0, firstOptionIndex).trim();
    const prompt =
      inlinePrompt ||
      blankContexts[questionNumber] ||
      `Imported question ${questionNumber}`;
    const answerMap = new Map<ChoiceKey, string>();

    optionMatches.forEach((match) => {
      answerMap.set(match[2] as ChoiceKey, match[3].trim());
    });

    if (answerMap.size < 4) {
      return null;
    }

    return {
      id: this.createQuestionId(),
      sourceNumber: questionNumber,
      prompt,
      imageName: '',
      imagePreview: null,
      correctAnswer: answerKey[questionNumber] ?? 'A',
      answers: ['A', 'B', 'C', 'D'].map((key) => ({
        key: key as ChoiceKey,
        text: answerMap.get(key as ChoiceKey) ?? '',
        imageName: '',
        imagePreview: null,
      })),
    };
  }

  private extractPdfTitle(lines: string[], fileName: string): string {
    const detectedTitle =
      lines.find((line) => /môn thi|exam|test|assessment|đề thi/i.test(line) && line.length > 10) ??
      lines.find((line) => line.length > 12 && !/^(?:Question\s+)?\d{1,3}\s*[\.\):]/i.test(line));

    if (detectedTitle) {
      return detectedTitle.slice(0, 140);
    }

    return fileName.replace(/\.pdf$/i, '');
  }

  private mergeParsedExams(primary: ParsedPdfExam, ocr: ParsedPdfExam, fileName: string): ParsedPdfExam {
    const base = primary.questions.length >= ocr.questions.length ? primary : ocr;
    const supplemental = base === primary ? ocr : primary;
    const supplementalByNumber = new Map(supplemental.questions.map((question) => [question.sourceNumber, question]));
    const mergedQuestions = base.questions.map((question) => {
      const supplementalQuestion = supplementalByNumber.get(question.sourceNumber);

      if (!supplementalQuestion) {
        return question;
      }

      return {
        ...question,
        prompt: this.pickBetterPrompt(question.prompt, supplementalQuestion.prompt),
        correctAnswer:
          question.correctAnswer === 'A' && supplementalQuestion.correctAnswer !== 'A'
            ? supplementalQuestion.correctAnswer
            : question.correctAnswer,
        answers: question.answers.map((answer) => {
          const supplementalAnswer = supplementalQuestion.answers.find((item) => item.key === answer.key);
          return supplementalAnswer
            ? {
                ...answer,
                text: this.pickBetterText(answer.text, supplementalAnswer.text),
              }
            : answer;
        }),
      };
    });

    return {
      title: this.pickBetterText(primary.title || fileName, ocr.title || fileName),
      description: this.pickBetterText(primary.description, ocr.description),
      questions: mergedQuestions,
      answerKeyDetected: primary.answerKeyDetected || ocr.answerKeyDetected,
    };
  }

  private createQuestionId(): number {
    return Date.now() + Math.floor(Math.random() * 100000);
  }

  private async parseImportSource(file: File): Promise<ParsedPdfExam> {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.importDebug.set('Reading structured text from PDF...');
      const lines = await this.extractPdfLines(file);
      const parsedFromPdf = this.parseExamFromPdf(lines, file.name);
      this.importDebug.set(
        `Structured parser: ${lines.length} lines, ${parsedFromPdf.questions.length} questions.`,
      );

      this.importDebug.set('Running Vietnamese OCR for text recovery...');
      const ocrLines = await this.extractPdfOcrLines(file);
      const parsedFromOcr = this.parseExamFromPdf(ocrLines, file.name);
      const merged = this.mergeParsedExams(parsedFromPdf, parsedFromOcr, file.name);
      this.importDebug.set(
        `Structured parser: ${parsedFromPdf.questions.length} questions. OCR parser: ${parsedFromOcr.questions.length} questions. Final merged import: ${merged.questions.length} questions.`,
      );
      return merged;
    }

    this.importDebug.set('Running OCR on uploaded image...');
    const ocrLines = await this.extractImageOcrLines(file);
    const parsed = this.parseExamFromPdf(ocrLines, file.name);
    this.importDebug.set(
      `Image OCR: ${ocrLines.length} lines read. Parsed ${parsed.questions.length} questions from image. Sample: ${ocrLines
        .slice(0, 6)
        .join(' | ')
        .slice(0, 320)}`,
    );
    return parsed;
  }

  private extractBlankContexts(lines: string[]): Record<number, string> {
    const contexts: Record<number, string> = {};
    const text = lines.join(' ').replace(/\s+/g, ' ');
    const blankPattern = /\((\d{1,3})\)\s*_+/g;
    let match: RegExpExecArray | null;

    while ((match = blankPattern.exec(text)) !== null) {
      const questionNumber = Number(match[1]);
      const index = match.index;
      const start = Math.max(
        text.lastIndexOf('.', index),
        text.lastIndexOf('!', index),
        text.lastIndexOf('?', index),
      );
      const endCandidates = [
        text.indexOf('.', index),
        text.indexOf('!', index),
        text.indexOf('?', index),
      ].filter((value) => value !== -1);
      const end = endCandidates.length > 0 ? Math.min(...endCandidates) : Math.min(text.length, index + 180);
      const snippet = text
        .slice(start >= 0 ? start + 1 : Math.max(0, index - 110), end >= 0 ? end + 1 : index + 180)
        .replace(/\((\d{1,3})\)\s*_+/g, '_____')
        .replace(/\s+/g, ' ')
        .trim();

      if (snippet && !contexts[questionNumber]) {
        contexts[questionNumber] = snippet;
      }
    }

    return contexts;
  }

  private normalizePdfLine(line: string): string {
    return line
      .replace(/\s+/g, ' ')
      .replace(/\(([A-D])\)/g, '$1.')
      .replace(/([A-D])\s+([.)])/g, '$1$2')
      .replace(/Question\s+(\d+)\s+([.)])/gi, 'Question $1$2')
      .replace(/(\d+)\s+([.)])/g, '$1$2')
      .trim();
  }

  private normalizeOcrLine(line: string): string {
    return line
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, 'I')
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'")
      .replace(/\(([A-D])\)/g, '$1.')
      .replace(/([A-D])\s+([.)])/g, '$1$2')
      .replace(/Question\s+(\d+)\s+([.)])/gi, 'Question $1$2')
      .replace(/(\d+)\s+([.)])/g, '$1$2')
      .trim();
  }

  private pickBetterPrompt(current: string, fallback: string): string {
    if (!current || /^Imported question \d+$/i.test(current)) {
      return fallback || current;
    }

    if (this.scoreTextQuality(fallback) > this.scoreTextQuality(current)) {
      return fallback;
    }

    return current;
  }

  private pickBetterText(current: string, fallback: string): string {
    if (!current) {
      return fallback;
    }

    if (!fallback) {
      return current;
    }

    return this.scoreTextQuality(fallback) > this.scoreTextQuality(current) ? fallback : current;
  }

  private scoreTextQuality(value: string): number {
    const text = value.trim();

    if (!text) {
      return -1;
    }

    const vietnameseCharCount = (text.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi) || []).length;
    const brokenCharPenalty = (text.match(/\b[^\W\d_]\b/g) || []).length;
    const blankBonus = /_{3,}|\(\d{1,3}\)/.test(text) ? 12 : 0;

    return text.length + vietnameseCharCount * 3 + blankBonus - brokenCharPenalty * 2;
  }

  private buildExamItem(id: number, draft: ExamDraft, status: ExamItem['status'], existingExam: ExamItem | null): ExamItem {
    return {
      id,
      code: draft.code || `EX-${String(id).padStart(3, '0')}`,
      title: draft.title || 'Untitled examination',
      description: draft.description || 'New multiple-choice assessment draft.',
      department: existingExam?.department || this.inferDefaultDepartment(),
      createdBy: existingExam?.createdBy ?? 'Current user',
      questionCount: draft.questions.length,
      durationMinutes: Math.max(draft.questions.length * 2, existingExam?.durationMinutes ?? 10),
      status,
    };
  }

  private cloneDraft(draft: ExamDraft): ExamDraft {
    return {
      ...draft,
      questions: draft.questions.map((question) => ({
        ...question,
        answers: question.answers.map((answer) => ({ ...answer })),
      })),
    };
  }

  private openPdfPreview(draft: ExamDraft, item: ExamItem, theme: 'light' | 'dark'): void {
    const previewWindow = window.open('', '_blank');

    if (!previewWindow) {
      this.notice.set('Unable to open preview tab. Please allow pop-ups for this page and try again.');
      return;
    }

    const previewDraft = {
      description: draft.description,
      questions: draft.questions.map((q): ExamPreviewQuestion => ({
        prompt: q.prompt,
        imagePreview: q.imagePreview,
        correctAnswer: q.correctAnswer,
        answers: q.answers.map((a): ExamPreviewAnswer => ({
          key: a.key,
          text: a.text,
          imagePreview: a.imagePreview,
        })),
      })),
    };

    const html = buildExamPreviewHtml(previewDraft, item, theme);
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();
  }

  ngOnInit(): void {
    this.syncEditorFromHash();
    window.addEventListener('hashchange', this.handleHashChange);
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }



  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Unable to read file.'));
      reader.readAsDataURL(file);
    });
  }

  private readonly handleHashChange = (): void => {
    this.syncEditorFromHash();
  };

  private syncEditorFromHash(): void {
    const hash = window.location.hash.replace(/^#\/?/, '');

    if (!hash.startsWith('examinations/')) {
      return;
    }

    const subRoute = hash.slice('examinations/'.length);

    if (subRoute === 'new') {
      this.examDraft.set(this.createEmptyExamDraft());
      this.editingExamId.set(null);
      this.editorMode.set('create');
      return;
    }

    if (subRoute.startsWith('edit/')) {
      const examId = Number(subRoute.split('/')[1]);
      const exam = this.allExams().find((item) => item.id === examId);

      if (exam) {
        this.openEditPage(exam);
      }
      return;
    }

    if (subRoute === '' || subRoute === 'list') {
      this.editorMode.set('list');
      this.editingExamId.set(null);
    }
  }

  private setEditorHash(path: string): void {
    const nextHash = path ? `#/examinations/${path}` : '#/examinations';

    if (window.location.hash !== nextHash) {
      window.history.pushState({}, '', nextHash);
    }
  }

  private inferDefaultDepartment(): string {
    return this.allExams()[0]?.department || 'General';
  }
}
