import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { WorkflowDocument, WorkflowStep } from '../models/survey.model';

export interface WorkflowDocumentDialogData {
  document?: WorkflowDocument;
  isEdit?: boolean;
}

@Component({
  selector: 'app-workflow-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="document-dialog">
      <h2 mat-dialog-title>
        {{ data.isEdit ? '文書編集' : '新規文書作成' }}
      </h2>
      
      <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
        <div mat-dialog-content class="dialog-content">
          <!-- 基本情報 -->
          <div class="form-section">
            <h3>基本情報</h3>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>文書タイトル</mat-label>
              <input matInput formControlName="title" placeholder="例: 新製品開発計画書">
              <mat-error *ngIf="documentForm.get('title')?.hasError('required')">
                タイトルは必須です
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>文書内容</mat-label>
              <textarea 
                matInput 
                formControlName="content" 
                rows="8"
                placeholder="文書の内容を入力してください（Markdown形式で記述可能）">
              </textarea>
              <mat-error *ngIf="documentForm.get('content')?.hasError('required')">
                内容は必須です
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>ステータス</mat-label>
              <mat-select formControlName="status">
                <mat-option value="draft">下書き</mat-option>
                <mat-option value="review">レビュー中</mat-option>
                <mat-option value="approved">承認済み</mat-option>
                <mat-option value="rejected">却下</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- 承認フロー -->
          <div class="form-section">
            <div class="section-header">
              <h3>承認フロー</h3>
              <button 
                type="button" 
                mat-icon-button 
                color="primary"
                (click)="addStep()"
                matTooltip="ステップを追加">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <div formArrayName="steps" class="steps-container">
              <div 
                *ngFor="let step of steps.controls; let i = index" 
                [formGroupName]="i"
                class="step-item">
                
                <div class="step-header">
                  <h4>ステップ {{ i + 1 }}</h4>
                  <button 
                    type="button" 
                    mat-icon-button 
                    color="warn"
                    (click)="removeStep(i)"
                    [disabled]="steps.length <= 1"
                    matTooltip="ステップを削除">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div class="step-fields">
                  <mat-form-field appearance="outline" class="step-name">
                    <mat-label>ステップ名</mat-label>
                    <input matInput formControlName="name" placeholder="例: 企画部レビュー">
                    <mat-error *ngIf="step.get('name')?.hasError('required')">
                      ステップ名は必須です
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="step-assignee">
                    <mat-label>担当者</mat-label>
                    <input matInput formControlName="assignee" placeholder="例: 田中太郎">
                    <mat-error *ngIf="step.get('assignee')?.hasError('required')">
                      担当者は必須です
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="step-status">
                    <mat-label>ステータス</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="pending">待機中</mat-option>
                      <mat-option value="in-progress">処理中</mat-option>
                      <mat-option value="completed">完了</mat-option>
                      <mat-option value="rejected">却下</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div mat-dialog-actions class="dialog-actions">
          <button type="button" mat-button (click)="onCancel()">
            キャンセル
          </button>
          <button 
            type="submit" 
            mat-raised-button 
            color="primary"
            [disabled]="documentForm.invalid">
            {{ data.isEdit ? '更新' : '作成' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .document-dialog {
      max-width: 900px;
      width: 100%;
      max-height: 95vh;
    }
    
    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }
    
    .form-section {
      margin-bottom: 24px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e8e8e8;
    }
    
    .form-section h3 {
      margin: 0 0 24px 0;
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 700;
      padding-bottom: 12px;
      border-bottom: 3px solid #007bff;
      position: relative;
    }
    
    .form-section h3::before {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #007bff, #0056b3);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .section-header h3 {
      margin: 0;
      border: none;
      padding: 0;
    }
    
    .section-header h3::before {
      display: none;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .half-width {
      width: 48%;
      margin-bottom: 20px;
    }
    
    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .step-item {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .step-item:hover {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
      transform: translateY(-2px);
    }
    
    .step-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 12px 12px 0 0;
    }
    
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    
    .step-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .step-header h4::before {
      content: '📋';
      font-size: 1.2rem;
    }
    
    .step-fields {
      display: grid;
      grid-template-columns: 2fr 1.5fr 1fr;
      gap: 20px;
      align-items: start;
    }
    
    .step-name {
      grid-column: 1;
    }
    
    .step-assignee {
      grid-column: 2;
    }
    
    .step-status {
      grid-column: 3;
    }
    
    .dialog-actions {
      justify-content: flex-end;
      padding: 20px 24px 20px 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .dialog-actions button {
      min-width: 100px;
      height: 40px;
      font-weight: 500;
      border-radius: 6px;
      text-transform: none;
      font-size: 0.9rem;
      margin-left: 12px;
      margin-bottom: 0;
    }
    
    .dialog-actions button[mat-button] {
      color: #6c757d;
      border: 1px solid #dee2e6;
    }
    
    .dialog-actions button[mat-button]:hover {
      background: #f8f9fa;
      color: #495057;
    }
    
    .dialog-actions button[mat-raised-button] {
      background: #007bff;
      color: white;
    }
    
    .dialog-actions button[mat-raised-button]:hover {
      background: #0056b3;
    }
    
    /* フォームフィールドのスタイリング */
    mat-form-field {
      width: 100%;
    }
    
    mat-form-field.mat-form-field-appearance-outline .mat-form-field-outline {
      color: #ced4da;
    }
    
    mat-form-field.mat-focused .mat-form-field-outline-thick {
      color: #007bff;
    }
    
    mat-form-field .mat-form-field-label {
      color: #6c757d;
    }
    
    mat-form-field.mat-focused .mat-form-field-label {
      color: #007bff;
    }
    
    /* ボタンのスタイリング */
    button[mat-icon-button] {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    button[mat-icon-button]:hover {
      background: #e3f2fd;
      color: #007bff;
      transform: scale(1.1);
    }
    
    button[mat-icon-button][color="warn"]:hover {
      background: #ffebee;
      color: #dc3545;
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
      .document-dialog {
        max-width: 95vw;
        margin: 16px;
      }
      
      .form-section {
        padding: 16px;
        margin-bottom: 16px;
      }
      
      .step-item {
        padding: 16px;
      }
      
      .step-fields {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .step-name,
      .step-assignee,
      .step-status {
        grid-column: 1;
      }
      
      .dialog-actions {
        flex-direction: column;
        gap: 12px;
        padding: 16px 16px 16px 16px;
      }
      
      .dialog-actions button {
        width: 100%;
        margin-left: 0;
        margin-bottom: 0;
      }
    }
  `]
})
export class WorkflowDocumentDialogComponent {
  documentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkflowDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowDocumentDialogData
  ) {
    this.documentForm = this.createForm();
  }

  private createForm(): FormGroup {
    const document = this.data.document;
    
    return this.fb.group({
      title: [document?.title || '', [Validators.required, Validators.minLength(3)]],
      content: [document?.content || '', [Validators.required, Validators.minLength(10)]],
      status: [document?.status || 'draft', Validators.required],
      steps: this.fb.array(
        document?.steps?.length ? 
          document.steps.map(step => this.createStepForm(step)) : 
          [this.createStepForm()]
      )
    });
  }

  private createStepForm(step?: WorkflowStep): FormGroup {
    return this.fb.group({
      id: [step?.id || `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`],
      name: [step?.name || '', [Validators.required, Validators.minLength(2)]],
      assignee: [step?.assignee || '', [Validators.required, Validators.minLength(2)]],
      status: [step?.status || 'pending', Validators.required]
    });
  }

  get steps(): FormArray {
    return this.documentForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.createStepForm());
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  onSubmit(): void {
    console.log('Form valid:', this.documentForm.valid);
    console.log('Form value:', this.documentForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    // フォームを強制的に検証
    this.markFormGroupTouched(this.documentForm);
    
    if (this.documentForm.valid) {
      try {
        const formValue = this.documentForm.value;
        const document: Partial<WorkflowDocument> = {
          title: formValue.title,
          content: formValue.content,
          status: formValue.status,
          steps: formValue.steps.map((step: WorkflowStep, index: number) => ({
            ...step,
            id: step.id || `step-${Date.now()}-${index}`
          }))
        };

        console.log('Saving document:', document);
        this.dialogRef.close(document);
      } catch (error) {
        console.error('Error creating document:', error);
        alert('文書の作成中にエラーが発生しました: ' + error);
      }
    } else {
      console.log('Form is invalid, cannot save');
      console.log('Detailed form errors:', this.getFormErrors());
      alert('フォームにエラーがあります。すべての必須項目を正しく入力してください。');
    }
  }

  private getFormErrors(): any {
    let formErrors: any = {};
    Object.keys(this.documentForm.controls).forEach(key => {
      const control = this.documentForm.get(key);
      if (control && control.errors) {
        formErrors[key] = control.errors;
      }
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(subKey => {
              const subControl = arrayControl.get(subKey);
              if (subControl && subControl.errors) {
                if (!formErrors[key]) formErrors[key] = {};
                if (!formErrors[key][index]) formErrors[key][index] = {};
                formErrors[key][index][subKey] = subControl.errors;
              }
            });
          }
        });
      }
    });
    return formErrors;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
