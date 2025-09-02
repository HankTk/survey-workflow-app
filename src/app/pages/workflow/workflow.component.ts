import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WorkflowDocument, WorkflowStep } from '../../models/survey.model';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  documents: WorkflowDocument[] = [];

  ngOnInit()
  {
    this.loadSampleDocuments();
  }

  private loadSampleDocuments()
  {
    // サンプルデータを生成
    this.documents = [
      {
        id: 'doc-001',
        title: '新製品開発計画書',
        content: '次期新製品の開発計画について、市場調査結果と技術的実現可能性を踏まえて策定した計画書です。',
        status: 'review',
        currentStep: 2,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        steps: [
          {
            id: 'step-1',
            name: '企画部レビュー',
            assignee: '田中太郎',
            status: 'completed',
            completedAt: '2024-01-18T16:00:00Z'
          },
          {
            id: 'step-2',
            name: '技術部検証',
            assignee: '佐藤花子',
            status: 'in-progress'
          },
          {
            id: 'step-3',
            name: '経営陣承認',
            assignee: '山田次郎',
            status: 'pending'
          }
        ]
      },
      {
        id: 'doc-002',
        title: '人事制度改定案',
        content: '従業員の働きやすさ向上を目的とした人事制度の改定案です。',
        status: 'draft',
        currentStep: 1,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z',
        steps: [
          {
            id: 'step-1',
            name: '人事部作成',
            assignee: '鈴木一郎',
            status: 'completed',
            completedAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'step-2',
            name: '法務部確認',
            assignee: '高橋美咲',
            status: 'pending'
          },
          {
            id: 'step-3',
            name: '社長承認',
            assignee: '伊藤社長',
            status: 'pending'
          }
        ]
      }
    ];
  }

  getStatusColor(status: string): string
  {
    switch (status)
    {
      case 'draft': return 'basic';
      case 'review': return 'accent';
      case 'approved': return 'primary';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string
  {
    switch (status)
    {
      case 'draft': return '下書き';
      case 'review': return 'レビュー中';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      default: return '不明';
    }
  }

  getStepState(step: WorkflowStep, index: number, currentStep: number): string
  {
    if (step.status === 'completed') return 'done';
    if (index + 1 === currentStep) return 'current';
    return 'pending';
  }

  getStepStatusColor(status: string): string
  {
    switch (status)
    {
      case 'pending': return 'basic';
      case 'in-progress': return 'accent';
      case 'completed': return 'primary';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getStepStatusText(status: string): string
  {
    switch (status)
    {
      case 'pending': return '待機中';
      case 'in-progress': return '処理中';
      case 'completed': return '完了';
      case 'rejected': return '却下';
      default: return '不明';
    }
  }

  canProcessStep(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number): boolean
  {
    return stepIndex + 1 === doc.currentStep && step.status === 'pending';
  }

  approveStep(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number)
  {
    step.status = 'completed';
    step.completedAt = new Date().toISOString();
    
    if (stepIndex + 1 < doc.steps.length)
    {
      doc.currentStep++;
      doc.steps[stepIndex + 1].status = 'in-progress';
    }
    else
    {
      doc.status = 'approved';
    }
    
    doc.updatedAt = new Date().toISOString();
    this.snackBar.open('ステップが承認されました', '閉じる', { duration: 3000 });
  }

  rejectStep(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number)
  {
    step.status = 'rejected';
    doc.status = 'rejected';
    doc.updatedAt = new Date().toISOString();
    this.snackBar.open('ステップが却下されました', '閉じる', { duration: 3000 });
  }

  addComment(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number)
  {
    const comment = prompt('コメントを入力してください:');
    if (comment)
    {
      if (!step.comments) step.comments = [];
      step.comments.push(comment);
      this.snackBar.open('コメントが追加されました', '閉じる', { duration: 2000 });
    }
  }

  createNewDocument()
  {
    this.snackBar.open('新規文書作成機能は実装予定です', '閉じる', { duration: 3000 });
  }

  viewDocument(doc: WorkflowDocument)
  {
    this.snackBar.open(`文書「${doc.title}」の詳細表示`, '閉じる', { duration: 2000 });
  }

  editDocument(doc: WorkflowDocument)
  {
    this.snackBar.open(`文書「${doc.title}」の編集`, '閉じる', { duration: 2000 });
  }

}
