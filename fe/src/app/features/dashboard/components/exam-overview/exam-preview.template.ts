import { ExamItem } from '../../../../core/models/dashboard.model';

// ─── Types local to this template ────────────────────────────────────────────

type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface ExamPreviewAnswer {
  key: ChoiceKey;
  text: string;
  imagePreview: string | null;
}

export interface ExamPreviewQuestion {
  prompt: string;
  imagePreview: string | null;
  correctAnswer: ChoiceKey;
  answers: ExamPreviewAnswer[];
}

export interface ExamPreviewDraft {
  description: string;
  employeeName?: string;
  employeeEid?: string;
  employeeKnoxId?: string;
  employeeDepartment?: string;
  employeeTeam?: string;
  examDate?: string;
  questions: ExamPreviewQuestion[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Builder ─────────────────────────────────────────────────────────────────

/**
 * Generates a standalone, self-contained HTML preview page for an exam.
 * Open the result in a new browser tab via `document.write()`.
 * Users can print or save as PDF directly from the toolbar in the page.
 */
export function buildExamPreviewHtml(draft: ExamPreviewDraft, item: ExamItem, theme: 'light' | 'dark' = 'dark'): string {
  const statusColor: Record<string, string> = {
    Published: '#22c55e',
    Draft: '#f59e0b',
    Archived: '#6b7280',
  };
  const statusBg: Record<string, string> = {
    Published: 'rgba(34,197,94,0.12)',
    Draft: 'rgba(245,158,11,0.12)',
    Archived: 'rgba(107,114,128,0.12)',
  };

  const color = statusColor[item.status] ?? '#6b7280';
  const bg = statusBg[item.status] ?? 'rgba(107,114,128,0.12)';
  const description = escapeHtml(draft.description || item.description || 'No description provided.');
  const employeeMetaRows = [
    draft.employeeName ? `<div class="meta-row"><strong>Inspector:</strong> ${escapeHtml(draft.employeeName)}</div>` : '',
    draft.employeeEid ? `<div class="meta-row"><strong>EID:</strong> ${escapeHtml(draft.employeeEid)}</div>` : '',
    draft.employeeKnoxId ? `<div class="meta-row"><strong>Knox ID:</strong> ${escapeHtml(draft.employeeKnoxId)}</div>` : '',
    draft.employeeDepartment || draft.employeeTeam
      ? `<div class="meta-row"><strong>Dept/Team:</strong> ${escapeHtml(
          [draft.employeeDepartment, draft.employeeTeam].filter(Boolean).join(' / '),
        )}</div>`
      : '',
    draft.examDate ? `<div class="meta-row"><strong>Exam Date:</strong> ${escapeHtml(draft.examDate)}</div>` : '',
  ]
    .filter(Boolean)
    .join('');

  const questionsHtml = draft.questions
    .map((question, index) => {
      const prompt = escapeHtml(question.prompt || 'Question prompt not entered yet.');
      const questionImageHtml = question.imagePreview
        ? `<div class="q-image"><img src="${question.imagePreview}" alt="Question ${index + 1} image" /></div>`
        : '';

      const answersHtml = question.answers
        .map((answer) => {
          const isCorrect = answer.key === question.correctAnswer;
          const text = escapeHtml(answer.text || 'Answer text not entered yet.');
          const answerImageHtml = answer.imagePreview
            ? `<div class="a-image"><img src="${answer.imagePreview}" alt="Answer ${answer.key} image" /></div>`
            : '';
          return `
            <div class="answer ${isCorrect ? 'answer--correct' : ''}">
              <span class="answer__badge ${isCorrect ? 'answer__badge--correct' : ''}">${answer.key}</span>
              <div class="answer__body">
                <span class="answer__text">${text}</span>
                ${answerImageHtml}
              </div>
              ${isCorrect ? '<span class="answer__tick">&#10003; Correct</span>' : ''}
            </div>`;
        })
        .join('');

      return `
        <div class="question">
          <div class="question__header">
            <span class="question__number">Q${index + 1}</span>
            <p class="question__prompt">${prompt}</p>
          </div>
          ${questionImageHtml}
          <div class="answers">${answersHtml}</div>
        </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(item.title || 'Exam Preview')} — SEHC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem 1rem 4rem;
    }

    .page { max-width: 860px; margin: 0 auto; }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 2rem 2.5rem;
      background: linear-gradient(135deg, #1e2436 0%, #151929 100%);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .header__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .header__logo {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700; color: #fff; letter-spacing: 0.05em;
    }
    .header__org { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
    .header__title {
      font-size: 1.6rem; font-weight: 700;
      background: linear-gradient(135deg, #e2e8f0, #94a3b8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.25;
      margin-bottom: 0.75rem;
    }
    .header__info { flex: 1; min-width: 0; }
    .header__desc { font-size: 0.875rem; color: #64748b; line-height: 1.6; max-width: 500px; }
    .header__meta { display: flex; flex-direction: column; gap: 0.5rem; flex-shrink: 0; align-items: flex-end; min-width: 180px; white-space: nowrap; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.85rem;
      border-radius: 999px;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em;
      color: ${color};
      background: ${bg};
      border: 1px solid ${color}40;
    }
    .status-pill::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${color};
    }
    .meta-row { font-size: 0.78rem; color: #64748b; text-align: right; }
    .meta-row strong { color: #94a3b8; }

    /* ── Section title ── */
    .section-title {
      font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.1em; color: #6366f1; margin-bottom: 1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: rgba(99,102,241,0.2); }

    /* ── Question cards ── */
    .question {
      background: #1a1f2e;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 1.5rem 1.75rem;
      margin-bottom: 1rem;
      transition: border-color 0.2s;
    }
    .question:hover { border-color: rgba(99,102,241,0.3); }
    .question__header { display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
    .question__number {
      flex-shrink: 0;
      width: 34px; height: 34px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700; color: #fff;
    }
    .question__prompt {
      font-size: 0.95rem; font-weight: 500; color: #cbd5e1;
      line-height: 1.65; padding-top: 0.3rem;
    }
    .q-image { margin-bottom: 1rem; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
    .q-image img { width: 100%; display: block; max-height: 300px; object-fit: contain; background: #0f1117; }

    /* ── Answers ── */
    .answers { display: flex; flex-direction: column; gap: 0.6rem; }
    .answer {
      display: flex; align-items: flex-start; gap: 0.85rem;
      padding: 0.7rem 1rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      position: relative;
    }
    .answer--correct {
      background: rgba(34,197,94,0.07);
      border-color: rgba(34,197,94,0.25);
    }
    .answer__badge {
      flex-shrink: 0;
      width: 26px; height: 26px;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.72rem; font-weight: 700;
      background: rgba(255,255,255,0.06);
      color: #64748b;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .answer__badge--correct {
      background: rgba(34,197,94,0.15);
      color: #22c55e;
      border-color: rgba(34,197,94,0.3);
    }
    .answer__body { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .answer__text { font-size: 0.875rem; color: #94a3b8; line-height: 1.55; }
    .answer--correct .answer__text { color: #cbd5e1; }
    .answer__tick {
      position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%);
      font-size: 0.7rem; font-weight: 600; color: #22c55e;
      background: rgba(34,197,94,0.1); padding: 0.15rem 0.5rem; border-radius: 999px;
    }
    .a-image { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
    .a-image img { width: 100%; display: block; max-height: 160px; object-fit: contain; background: #0f1117; }

    /* ── Toolbar ── */
    .toolbar {
      position: fixed;
      top: 1rem; right: 1rem;
      display: flex; gap: 0.5rem;
      z-index: 100;
    }
    .toolbar button {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: inherit; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; border: none; transition: opacity 0.2s;
    }
    .toolbar button:hover { opacity: 0.85; }
    .btn-print { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .btn-close { background: rgba(255,255,255,0.08); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1) !important; }

    ${theme === 'light' ? `
    /* ── Light Theme Overrides ── */
    body { background: #f1f5f9; color: #0f172a; }
    .header {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header::before { background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%); }
    .header__title { -webkit-text-fill-color: #0f172a; color: #0f172a; background: none; }
    .header__desc { color: #475569; }
    .meta-row { color: #475569; }
    .meta-row strong { color: #0f172a; }
    .question {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05);
    }
    .question:hover { border-color: #94a3b8; }
    .question__prompt { color: #1e293b; }
    .q-image { border-color: #e2e8f0; }
    .q-image img { background: #f8fafc; }
    .answer { background: #f8fafc; border: 1px solid #e2e8f0; }
    .answer__text { color: #334155; }
    .answer__badge {
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .answer--correct { background: #f0fdf4; border-color: #bbf7d0; }
    .answer--correct .answer__text { color: #15803d; font-weight: 500; }
    .a-image { border-color: #e2e8f0; }
    .a-image img { background: #f8fafc; }
    .btn-close {
      background: #ffffff;
      color: #475569;
      border: 1px solid #cbd5e1 !important;
    }
    .btn-close:hover { background: #f1f5f9; }
    ` : ''}

    /* ── Print styles ── */
    @media print {
      body { background: #fff; color: #111; padding: 0; }
      .toolbar { display: none; }
      .header {
        background: #f8fafc; border-color: #e2e8f0; break-inside: avoid;
        flex-direction: column; gap: 1rem;
      }
      .header__meta {
        flex-direction: row; flex-wrap: wrap; gap: 0.75rem 1.5rem;
        align-items: center; min-width: unset; width: 100%;
        border-top: 1px solid #e2e8f0; padding-top: 0.75rem;
      }
      .header__title { -webkit-text-fill-color: #1e293b; color: #1e293b; }
      .header__desc, .meta-row { color: #64748b; }
      .meta-row { text-align: left; }
      .question { background: #fff; border-color: #e2e8f0; break-inside: avoid; }
      .answer { background: #f8fafc; border-color: #e2e8f0; }
      .answer--correct { background: #f0fdf4; border-color: #bbf7d0; }
      .answer__text { color: #374151; }
      .answer--correct .answer__text { color: #111; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn-print" onclick="window.print()">&#128438; Print / Save PDF</button>
    <button class="btn-close" onclick="window.close()">&#10005; Close</button>
  </div>

  <div class="page">
    <div class="header">
      <div class="header__info">
        <div class="header__brand">
          <div class="header__logo">SEHC</div>
          <span class="header__org">Staff Examination &amp; Certification Hub</span>
        </div>
        <h1 class="header__title">${escapeHtml(item.title || 'Untitled Examination')}</h1>
        <p class="header__desc">${description}</p>
      </div>
      <div class="header__meta">
        <span class="status-pill">${escapeHtml(item.status)}</span>
        <div class="meta-row"><strong>Code:</strong> ${escapeHtml(item.code)}</div>
        <div class="meta-row"><strong>Dept:</strong> ${escapeHtml(item.department)}</div>
        <div class="meta-row"><strong>By:</strong> ${escapeHtml(item.createdBy)}</div>
        ${employeeMetaRows}
      </div>
    </div>

    <p class="section-title">Questions &amp; Answers</p>
    ${questionsHtml}
  </div>
</body>
</html>`;
}
