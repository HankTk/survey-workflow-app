import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="icon-container" [class.destructive]="data.isDestructive">
          <span class="icon">{{ data.isDestructive ? '⚠️' : '❓' }}</span>
        </div>
        <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="message">{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-stroked-button 
          (click)="onCancel()"
          class="cancel-button">
          {{ data.cancelText || 'キャンセル' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.isDestructive ? 'warn' : 'primary'"
          [mat-dialog-close]="true"
          cdkFocusInitial
          class="confirm-button">
          {{ data.confirmText || '確認' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      min-width: 320px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }
    
    .icon-container.destructive {
      background-color: #ffebee;
    }
    
    .icon {
      font-size: 24px;
    }
    
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
      flex: 1;
    }
    
    .dialog-content {
      padding: 24px;
      margin: 0;
    }
    
    .message {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #666;
      white-space: pre-line;
    }
    
    .dialog-actions {
      padding: 16px 24px 24px 24px;
      margin: 0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f0f0f0;
    }
    
    .cancel-button {
      min-width: 80px;
    }
    
    .confirm-button {
      min-width: 80px;
    }
    
    /* ダークテーマ対応 */
    @media (prefers-color-scheme: dark) {
      .dialog-header {
        border-bottom-color: #424242;
      }
      
      .icon-container {
        background-color: #424242;
      }
      
      .icon-container.destructive {
        background-color: #4a1a1a;
      }
      
      .dialog-title {
        color: #fff;
      }
      
      .message {
        color: #ccc;
      }
      
      .dialog-actions {
        border-top-color: #424242;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
