import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { WorkflowDocument, WorkflowStep } from '../../models/survey.model';
import { WorkflowService } from '../../services/workflow.service';
import { WorkflowDocumentDialogComponent, WorkflowDocumentDialogData } from '../../components/workflow-document-dialog.component';
import { WorkflowCommentDialogComponent, WorkflowCommentDialogData } from '../../components/workflow-comment-dialog.component';
import { WorkflowDetailDialogComponent } from '../../components/workflow-detail-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './workflow.component.html',
  styleUrl: './workflow.component.scss'
})
export class WorkflowComponent implements OnInit {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private workflowService = inject(WorkflowService);

  documents: WorkflowDocument[] = [];
  isLoading = false;
  expandedDocumentId: string | null = null;
  stepComments: { [key: string]: string } = {};
  expandedSteps: { [key: string]: boolean } = {};

  ngOnInit() {
    this.loadDocuments();
  }

  private loadDocuments() {
    this.isLoading = true;
    this.workflowService.getAllDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.isLoading = false;
        // 文書リストが更新されたら、展開状態をリセット
        this.expandedDocumentId = null;
        this.expandedSteps = {};
        this.stepComments = {};
      },
      error: (error) => {
        console.error('文書の読み込みエラー:', error);
        this.snackBar.open('文書の読み込みに失敗しました', '閉じる', { duration: 3000 });
        this.isLoading = false;
      }
    });
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

  approveStep(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.workflowService.approveStep(doc.id, stepIndex).subscribe({
      next: (updatedDoc) => {
        if (updatedDoc) {
          this.loadDocuments();
          this.snackBar.open('ステップが承認されました', '閉じる', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('承認エラー:', error);
        this.snackBar.open('承認に失敗しました', '閉じる', { duration: 3000 });
      }
    });
  }

  rejectStep(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    this.workflowService.rejectStep(doc.id, stepIndex).subscribe({
      next: (updatedDoc) => {
        if (updatedDoc) {
          this.loadDocuments();
          this.snackBar.open('ステップが却下されました', '閉じる', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('却下エラー:', error);
        this.snackBar.open('却下に失敗しました', '閉じる', { duration: 3000 });
      }
    });
  }

  addComment(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number) {
    const dialogData: WorkflowCommentDialogData = {
      stepName: step.name,
      assignee: step.assignee,
      existingComments: step.comments
    };

    const dialogRef = this.dialog.open(WorkflowCommentDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(comment => {
      if (comment) {
        this.workflowService.addComment(doc.id, stepIndex, comment).subscribe({
          next: (updatedDoc) => {
            if (updatedDoc) {
              this.loadDocuments();
              this.snackBar.open('コメントが追加されました', '閉じる', { duration: 2000 });
            }
          },
          error: (error) => {
            console.error('コメント追加エラー:', error);
            this.snackBar.open('コメントの追加に失敗しました', '閉じる', { duration: 3000 });
          }
        });
      }
    });
  }

  submitComment(doc: WorkflowDocument, step: WorkflowStep, stepIndex: number, comment: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (!comment?.trim()) {
      this.snackBar.open('コメントを入力してください', '閉じる', { duration: 2000 });
      return;
    }

    this.workflowService.addComment(doc.id, stepIndex, comment.trim()).subscribe({
      next: (updatedDoc) => {
        if (updatedDoc) {
          // コメント入力フィールドをクリア
          const commentKey = doc.id + '-' + stepIndex;
          this.stepComments[commentKey] = '';
          this.loadDocuments();
          this.snackBar.open('コメントが追加されました', '閉じる', { duration: 2000 });
        }
      },
      error: (error) => {
        console.error('コメント追加エラー:', error);
        this.snackBar.open('コメントの追加に失敗しました', '閉じる', { duration: 3000 });
      }
    });
  }

  createNewDocument() {
    const dialogData: WorkflowDocumentDialogData = {
      isEdit: false
    };

    const dialogRef = this.dialog.open(WorkflowDocumentDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        console.log('Creating document with data:', result);
        this.workflowService.createDocument(result).subscribe({
          next: (newDoc) => {
            console.log('Document created successfully:', newDoc);
            this.loadDocuments();
            this.snackBar.open('文書が作成されました', '閉じる', { duration: 3000 });
            // 新規作成した文書のプレビューを自動的に展開
            setTimeout(() => {
              this.expandedDocumentId = newDoc.id;
            }, 100);
          },
          error: (error) => {
            console.error('文書作成エラー:', error);
            this.snackBar.open('文書の作成に失敗しました', '閉じる', { duration: 3000 });
          }
        });
      } else {
        console.log('Dialog was cancelled or closed without result');
      }
    });
  }

  viewDocument(doc: WorkflowDocument, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.open(WorkflowDetailDialogComponent, {
      width: '900px',
      maxWidth: '90vw',
      data: doc
    });
  }

  toggleDocumentPreview(documentId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    // 同じ文書をクリックした場合は閉じる、違う文書の場合は切り替える
    if (this.expandedDocumentId === documentId) {
      this.expandedDocumentId = null;
      // 文書を閉じる時は、その文書のすべてのステップも閉じる
      this.closeAllStepsForDocument(documentId);
    } else {
      this.expandedDocumentId = documentId;
    }
    
  }

  toggleStepExpansion(documentId: string, stepIndex: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    const stepKey = documentId + '-' + stepIndex;
    const currentState = this.expandedSteps[stepKey] || false;
    this.expandedSteps[stepKey] = !currentState;
    
    // 強制的に変更検知をトリガー
    this.expandedSteps = { ...this.expandedSteps };
  }

  private closeAllStepsForDocument(documentId: string) {
    Object.keys(this.expandedSteps).forEach(key => {
      if (key.startsWith(documentId + '-')) {
        this.expandedSteps[key] = false;
      }
    });
  }

  editDocument(doc: WorkflowDocument, event: Event) {
    event.stopPropagation();
    
    const dialogData: WorkflowDocumentDialogData = {
      document: doc,
      isEdit: true
    };

    const dialogRef = this.dialog.open(WorkflowDocumentDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workflowService.updateDocument(doc.id, result).subscribe({
          next: (updatedDoc) => {
            if (updatedDoc) {
              this.loadDocuments();
              this.snackBar.open('文書が更新されました', '閉じる', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('文書更新エラー:', error);
            this.snackBar.open('文書の更新に失敗しました', '閉じる', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteDocument(doc: WorkflowDocument, event: Event) {
    event.stopPropagation();
    
    const dialogData: ConfirmDialogData = {
      title: '文書の削除',
      message: `文書「${doc.title}」を削除しますか？\n\nこの操作は取り消せません。`,
      confirmText: '削除',
      cancelText: 'キャンセル',
      isDestructive: true
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workflowService.deleteDocument(doc.id).subscribe({
          next: () => {
            this.loadDocuments();
            this.snackBar.open('文書を削除しました', '閉じる', { duration: 3000 });
          },
          error: (error) => {
            console.error('文書の削除に失敗しました:', error);
            this.snackBar.open('文書の削除に失敗しました', '閉じる', { duration: 3000 });
          }
        });
      }
    });
  }

}
