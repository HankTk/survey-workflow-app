import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { WorkflowDocument } from '../models/survey.model';

@Component({
  selector: 'app-workflow-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatStepperModule,
    MatCardModule
  ],
  templateUrl: './workflow-detail-dialog.component.html',
  styleUrls: ['./workflow-detail-dialog.component.scss']
})
export class WorkflowDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WorkflowDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowDocument
  ) {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'draft': return 'basic';
      case 'review': return 'accent';
      case 'approved': return 'primary';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'draft': return '下書き';
      case 'review': return 'レビュー中';
      case 'approved': return '承認済み';
      case 'rejected': return '却下';
      default: return '不明';
    }
  }

  getStepState(step: any, index: number, currentStep: number): string {
    if (step.status === 'completed') return 'done';
    if (index + 1 === currentStep) return 'current';
    return 'pending';
  }

  getStepStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'basic';
      case 'in-progress': return 'accent';
      case 'completed': return 'primary';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getStepStatusText(status: string): string {
    switch (status) {
      case 'pending': return '待機中';
      case 'in-progress': return '処理中';
      case 'completed': return '完了';
      case 'rejected': return '却下';
      default: return '不明';
    }
  }

  formatContent(content: string): string {
    // 簡単なMarkdown風の変換
    return content
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
