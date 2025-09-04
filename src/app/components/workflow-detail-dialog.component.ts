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
  template: `
    <div class="detail-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <div mat-dialog-content class="dialog-content">
        <!-- 文書情報 -->
        <mat-card class="document-info">
          <mat-card-header>
            <mat-card-title>文書情報</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>ステータス:</label>
                <mat-chip [color]="getStatusColor(data.status)" selected>
                  {{ getStatusText(data.status) }}
                </mat-chip>
              </div>
              <div class="info-item">
                <label>現在のステップ:</label>
                <span>{{ data.currentStep }}/{{ data.steps.length }}</span>
              </div>
              <div class="info-item">
                <label>作成日:</label>
                <span>{{ data.createdAt | date:'short' }}</span>
              </div>
              <div class="info-item">
                <label>最終更新:</label>
                <span>{{ data.updatedAt | date:'short' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- 文書内容 -->
        <mat-card class="document-content">
          <mat-card-header>
            <mat-card-title>文書内容</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="content-text" [innerHTML]="formatContent(data.content)"></div>
          </mat-card-content>
        </mat-card>

        <!-- 承認フロー -->
        <mat-card class="workflow-steps">
          <mat-card-header>
            <mat-card-title>承認フロー</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-stepper [linear]="false" orientation="vertical">
              <mat-step 
                *ngFor="let step of data.steps; let i = index" 
                [completed]="step.status === 'completed'"
                [state]="getStepState(step, i, data.currentStep)">
                
                <ng-template matStepLabel>
                  <div class="step-label">
                    <span class="step-name">{{ step.name }}</span>
                    <span class="step-assignee">担当: {{ step.assignee }}</span>
                    <mat-chip [color]="getStepStatusColor(step.status)" selected>
                      {{ getStepStatusText(step.status) }}
                    </mat-chip>
                  </div>
                </ng-template>
                
                <div class="step-content">
                  <div *ngIf="step.completedAt" class="completion-info">
                    <mat-icon>check_circle</mat-icon>
                    <span>完了日時: {{ step.completedAt | date:'short' }}</span>
                  </div>
                  
                  <div *ngIf="step.comments && step.comments.length > 0" class="comments-section">
                    <h4>コメント</h4>
                    <div class="comments-list">
                      <div *ngFor="let comment of step.comments" class="comment-item">
                        <mat-icon>comment</mat-icon>
                        <span>{{ comment }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </mat-card-content>
        </mat-card>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">
          閉じる
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detail-dialog {
      max-width: 1000px;
      width: 100%;
      max-height: 95vh;
      margin: 0 auto;
    }
    
    .dialog-content {
      max-height: 75vh;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }
    
    .document-info,
    .document-content,
    .workflow-steps {
      margin-bottom: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .document-info mat-card-header,
    .document-content mat-card-header,
    .workflow-steps mat-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
    }
    
    .document-info mat-card-title,
    .document-content mat-card-title,
    .workflow-steps mat-card-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
    }
    
    .document-info mat-card-content,
    .document-content mat-card-content,
    .workflow-steps mat-card-content {
      padding: 24px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }
    
    .info-item label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-item span {
      color: #2c3e50;
      font-size: 1rem;
      font-weight: 500;
    }
    
    .content-text {
      white-space: pre-wrap;
      line-height: 1.8;
      color: #2c3e50;
      font-size: 1rem;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .step-label {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      padding: 12px 0;
    }
    
    .step-name {
      font-weight: 700;
      color: #2c3e50;
      font-size: 1.1rem;
    }
    
    .step-assignee {
      color: #6c757d;
      font-size: 0.95rem;
      background: #e9ecef;
      padding: 4px 12px;
      border-radius: 20px;
    }
    
    .step-content {
      padding: 20px 0;
      margin-top: 16px;
    }
    
    .completion-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #28a745;
      font-size: 0.95rem;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #d4edda;
      border-radius: 8px;
      border-left: 4px solid #28a745;
    }
    
    .completion-info mat-icon {
      font-size: 20px;
    }
    
    .comments-section {
      margin-top: 20px;
    }
    
    .comments-section h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .comments-section h4::before {
      content: "💬";
      font-size: 1.2rem;
    }
    
    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .comment-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      border-left: 4px solid #007bff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
    }
    
    .comment-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .comment-item mat-icon {
      color: #007bff;
      font-size: 20px;
      margin-top: 2px;
    }
    
    .comment-item span {
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #495057;
    }
    
    .dialog-actions {
      justify-content: flex-end;
      padding: 24px;
      background: white;
      border-top: 1px solid #e0e0e0;
      margin-top: 0;
    }
    
    .dialog-actions button {
      min-width: 120px;
      height: 44px;
      font-weight: 600;
      border-radius: 8px;
      text-transform: none;
    }
    
    /* スクロールバーのスタイリング */
    .dialog-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .dialog-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .dialog-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    @media (max-width: 768px) {
      .detail-dialog {
        max-width: 95vw;
        margin: 0;
      }
      
      .dialog-content {
        padding: 16px;
        max-height: 80vh;
      }
      
      .step-label {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .document-info mat-card-content,
      .document-content mat-card-content,
      .workflow-steps mat-card-content {
        padding: 16px;
      }
      
      .dialog-actions {
        padding: 16px;
        flex-direction: column;
        gap: 12px;
      }
      
      .dialog-actions button {
        width: 100%;
      }
    }
  `]
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
