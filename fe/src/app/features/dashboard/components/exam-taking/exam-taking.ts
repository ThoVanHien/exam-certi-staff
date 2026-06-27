import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { AuthSession } from '../../../../core/models/auth.model';
import { interval, Subscription } from 'rxjs';

interface Question {
  id: number;
  question: string;
  options: string[];
  orderNo: number;
}

interface ExamDetails {
  id: number;
  title: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
}

interface SubmitResult {
  resultId: number;
  examId: number;
  userId: number;
  totalQuestions: number;
  correctAnswers: number;
  answeredQuestions: number;
  score: number;
  status: 'passed' | 'failed';
  completedAt: string;
}

@Component({
  selector: 'app-exam-taking',
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, TagModule],
  templateUrl: './exam-taking.html',
  styleUrl: './exam-taking.scss',
})
export class ExamTakingComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);

  readonly examId = input.required<number>();
  readonly authSession = input.required<AuthSession>();
  readonly apiBaseUrl = input.required<string>();
  readonly finished = output<void>();

  // States
  protected readonly exam = signal<ExamDetails | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly submitResult = signal<SubmitResult | null>(null);

  // Exam phase
  protected readonly phase = signal<'confirm' | 'running' | 'result'>('confirm');

  // Running states
  protected readonly currentQuestionIndex = signal(0);
  protected readonly selectedAnswers = signal<Record<number, string>>({});
  protected readonly timeLeftSeconds = signal(0);
  protected readonly lowTimeWarning = computed(() => this.timeLeftSeconds() > 0 && this.timeLeftSeconds() < 120);

  private timerSubscription: Subscription | null = null;

  protected get currentQuestion(): Question | null {
    const details = this.exam();
    if (!details || !details.questions.length) return null;
    return details.questions[this.currentQuestionIndex()];
  }

  protected get formattedTimeLeft(): string {
    const totalSecs = this.timeLeftSeconds();
    if (totalSecs <= 0) return '00:00';
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  protected get answeredCount(): number {
    return Object.keys(this.selectedAnswers()).length;
  }

  ngOnInit(): void {
    console.log('ExamTakingComponent: ngOnInit called with examId', this.examId());
    this.fetchExamDetails();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private fetchExamDetails(): void {
    console.log('ExamTakingComponent: fetchExamDetails called for examId', this.examId());
    this.loading.set(true);
    this.errorMessage.set('');

    const token = this.authSession().accessToken;
    this.http
      .get<{ success: boolean; data: ExamDetails }>(`${this.apiBaseUrl()}/exams/${this.examId()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          console.log('ExamTakingComponent: fetchExamDetails succeeded', res);
          this.exam.set(res.data);
          this.timeLeftSeconds.set(res.data.duration * 60);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('ExamTakingComponent: fetchExamDetails failed', err);
          this.errorMessage.set(err.error?.message || 'Không thể tải đề thi. Vui lòng thử lại.');
          this.loading.set(false);
        },
      });
  }

  protected startExam(): void {
    this.phase.set('running');
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeLeftSeconds.update((time) => {
        if (time <= 1) {
          this.stopTimer();
          this.autoSubmit();
          return 0;
        }
        return time - 1;
      });
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  protected selectAnswer(questionId: number, answerKey: string): void {
    if (this.phase() !== 'running') return;
    this.selectedAnswers.update((answers) => ({
      ...answers,
      [questionId]: answerKey,
    }));
  }

  protected nextQuestion(): void {
    const details = this.exam();
    if (!details) return;
    if (this.currentQuestionIndex() < details.questions.length - 1) {
      this.currentQuestionIndex.update((idx) => idx + 1);
    }
  }

  protected prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update((idx) => idx - 1);
    }
  }

  protected selectQuestion(index: number): void {
    const details = this.exam();
    if (!details) return;
    if (index >= 0 && index < details.questions.length) {
      this.currentQuestionIndex.set(index);
    }
  }

  protected confirmCancel(): void {
    if (confirm('Bạn có chắc muốn hủy làm bài thi? Toàn bộ kết quả hiện tại sẽ không được lưu.')) {
      this.stopTimer();
      this.finished.emit();
    }
  }

  protected confirmSubmit(): void {
    const details = this.exam();
    if (!details) return;

    const unanswered = details.questions.length - this.answeredCount;
    let msg = 'Bạn có chắc chắn muốn nộp bài thi?';
    if (unanswered > 0) {
      msg = `Bạn còn ${unanswered} câu hỏi chưa trả lời. ${msg}`;
    }

    if (confirm(msg)) {
      this.submitExam();
    }
  }

  private autoSubmit(): void {
    alert('Hết giờ làm bài! Hệ thống sẽ tự động nộp bài thi của bạn.');
    this.submitExam();
  }

  private submitExam(): void {
    this.stopTimer();
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const details = this.exam();
    if (!details) {
      this.isSubmitting.set(false);
      return;
    }

    const token = this.authSession().accessToken;
    // Map selectedAnswers Record to Zod schema array format
    const answersPayload = details.questions.map((q) => ({
      questionId: q.id,
      answer: this.selectedAnswers()[q.id] || '',
    })).filter(ans => ans.answer !== '');

    // Note: Zod schema requires answers to have min(1) item
    if (answersPayload.length === 0) {
      // If nothing is selected, send a dummy placeholder so it validates but scores 0
      answersPayload.push({
        questionId: details.questions[0].id,
        answer: 'X', // Wrong answer placeholder
      });
    }

    this.http
      .post<{ success: boolean; data: SubmitResult }>(
        `${this.apiBaseUrl()}/exams/${this.examId()}/submit`,
        { answers: answersPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .subscribe({
        next: (res) => {
          this.submitResult.set(res.data);
          this.phase.set('result');
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Lỗi khi nộp bài. Vui lòng liên hệ giám thị hoặc thử lại.');
          this.isSubmitting.set(false);
          // Restart timer to let them try submitting again
          this.startTimer();
        },
      });
  }

  protected backToDashboard(): void {
    this.finished.emit();
  }
}
