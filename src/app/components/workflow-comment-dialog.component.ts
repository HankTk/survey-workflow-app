import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface WorkflowCommentDialogData {
  stepName: string;
  assignee: string;
  existingComments?: string[];
}

@Component({
  selector: 'app-workflow-comment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="comment-dialog">
      <h2 mat-dialog-title>コメント追加</h2>
      
      <div mat-dialog-content class="dialog-content">
        <div class="step-info">
          <h3>{{ data.stepName }}</h3>
          <p>担当者: {{ data.assignee }}</p>
        </div>

        <form [formGroup]="commentForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>コメント</mat-label>
            <textarea 
              matInput 
              formControlName="comment" 
              rows="4"
              placeholder="コメントを入力してください">
            </textarea>
            <mat-error *ngIf="commentForm.get('comment')?.hasError('required')">
              コメントは必須です
            </mat-error>
            <mat-error *ngIf="commentForm.get('comment')?.hasError('minlength')">
              コメントは3文字以上で入力してください
            </mat-error>
          </mat-form-field>
        </form>

        <div *ngIf="data.existingComments && data.existingComments.length > 0" class="existing-comments">
          <h4>既存のコメント</h4>
          <div class="comments-list">
            <mat-chip-set>
              <mat-chip *ngFor="let comment of data.existingComments" class="comment-chip">
                {{ comment }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button type="button" mat-button (click)="onCancel()">
          キャンセル
        </button>
        <button 
          type="button" 
          mat-raised-button 
          color="primary"
          (click)="onSubmit()"
          [disabled]="commentForm.invalid">
          追加
        </button>
      </div>
    </div>
  `,
  styles: [`
    .comment-dialog {
      max-width: 500px;
      width: 100%;
    }
    
    .dialog-content {
      padding: 0;
    }
    
    .step-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .step-info h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .step-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .existing-comments {
      margin-top: 20px;
    }
    
    .existing-comments h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .comments-list {
      max-height: 150px;
      overflow-y: auto;
    }
    
    .comment-chip {
      margin: 4px;
      background: #e3f2fd;
      color: #1976d2;
      font-size: 0.9rem;
    }
    
    .dialog-actions {
      justify-content: flex-end;
      padding: 20px 0 0 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }
    
    .dialog-actions button {
      margin-left: 12px;
    }
  `]
})
export class WorkflowCommentDialogComponent {
  commentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkflowCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowCommentDialogData
  ) {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      const comment = this.commentForm.get('comment')?.value;
      this.dialogRef.close(comment);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
