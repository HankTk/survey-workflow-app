import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Survey } from '../models/survey.model';

export interface SurveyPreviewData {
  survey: Survey;
}

@Component({
  selector: 'app-survey-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="preview-dialog">
      <h2 mat-dialog-title>{{ data.survey.title }}</h2>
      
      <div mat-dialog-content class="preview-content">
        <p *ngIf="data.survey.description" class="survey-description">
          {{ data.survey.description }}
        </p>
        
        <form [formGroup]="previewForm" class="preview-form">
          <div *ngFor="let section of data.survey.sections" class="section">
            <h3 class="section-title">{{ section.title }}</h3>
            <p *ngIf="section.description" class="section-description">{{ section.description }}</p>
            
            <div *ngFor="let question of section.questions" class="question">
              <div class="question-label">
                {{ question.label }}
                <span *ngIf="question.required" class="required">*</span>
              </div>
              
              <!-- テキスト入力 -->
              <mat-form-field *ngIf="question.type === 'text'" appearance="outline">
                <input 
                  matInput 
                  [formControlName]="question.id"
                  [placeholder]="question.placeholder || ''"
                >
              </mat-form-field>
              
              <!-- 数値入力 -->
              <mat-form-field *ngIf="question.type === 'number'" appearance="outline">
                <input 
                  matInput 
                  type="number"
                  [formControlName]="question.id"
                  [placeholder]="question.placeholder || ''"
                >
              </mat-form-field>
              
              <!-- テキストエリア -->
              <mat-form-field *ngIf="question.type === 'textarea'" appearance="outline">
                <textarea 
                  matInput 
                  [formControlName]="question.id"
                  [placeholder]="question.placeholder || ''"
                  rows="3"
                ></textarea>
              </mat-form-field>
              
              <!-- セレクトボックス -->
              <mat-form-field *ngIf="question.type === 'select'" appearance="outline">
                <mat-select [formControlName]="question.id">
                  <mat-option *ngFor="let option of question.options" [value]="option">
                    {{ option }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              
              <!-- ラジオボタン -->
              <mat-radio-group *ngIf="question.type === 'radio'" [formControlName]="question.id">
                <mat-radio-button *ngFor="let option of question.options" [value]="option">
                  {{ option }}
                </mat-radio-button>
              </mat-radio-group>
              
              <!-- チェックボックス -->
              <div *ngIf="question.type === 'checkbox'" class="checkbox-group">
                <mat-checkbox 
                  *ngFor="let option of question.options" 
                  [formControlName]="question.id + '_' + option"
                >
                  {{ option }}
                </mat-checkbox>
              </div>
              
              <!-- 日付選択 -->
              <mat-form-field *ngIf="question.type === 'date'" appearance="outline">
                <input 
                  matInput 
                  [matDatepicker]="picker"
                  [formControlName]="question.id"
                  [placeholder]="question.placeholder || '日付を選択'"
                >
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>
          </div>
        </form>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">閉じる</button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!previewForm.valid">
          送信（プレビュー）
        </button>
      </div>
    </div>
  `,
  styles: [`
    .preview-dialog {
      max-width: 1000px;
      width: 100%;
      max-height: 90vh;
      margin: 0 auto;
    }
    
    .preview-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }
    
    .survey-description {
      font-size: 1rem;
      color: #666;
      margin: 20px 0 20px 0;
      padding: 16px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #007bff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .preview-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      padding: 0;
    }
    
    .section {
      padding: 30px;
      border-bottom: 1px solid #e9ecef;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }
    
    .section-description {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .question {
      margin: 0 0 24px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
    
    .question-label {
      font-size: 1rem;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 8px;
      display: block;
    }
    
    .required {
      color: #dc3545;
      margin-left: 4px;
      font-weight: bold;
    }
    
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
    
    .checkbox-group mat-checkbox {
      margin: 4px 0;
    }
    
    mat-form-field {
      width: 100%;
      margin-top: 8px;
    }
    
    mat-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }
    
    mat-radio-button {
      margin: 4px 0;
    }
    
    .dialog-actions {
      justify-content: flex-end;
      padding: 20px 30px;
      background: white;
      border-top: 1px solid #e9ecef;
      margin: 0;
    }
    
    .dialog-actions button {
      min-width: 100px;
      height: 40px;
      font-weight: 500;
      border-radius: 6px;
      text-transform: none;
      font-size: 0.9rem;
      margin-left: 12px;
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
    
    /* スクロールバーのスタイリング */
    .preview-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .preview-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    .preview-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .preview-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class SurveyPreviewDialogComponent {
  previewForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SurveyPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SurveyPreviewData
  ) {
    this.previewForm = this.createPreviewForm();
  }

  private createPreviewForm(): FormGroup {
    const formControls: { [key: string]: any } = {};
    
    this.data.survey.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.type === 'checkbox') {
          // チェックボックスの場合は各選択肢を個別のコントロールにする
          question.options?.forEach(option => {
            formControls[question.id + '_' + option] = [false];
          });
        } else {
          const validators = question.required ? [Validators.required] : [];
          formControls[question.id] = ['', validators];
        }
      });
    });
    
    return this.fb.group(formControls);
  }

  onSubmit(): void {
    if (this.previewForm.valid) {
      console.log('プレビュー送信データ:', this.previewForm.value);
      // 実際の送信処理は実装しない（プレビューのため）
      alert('プレビュー送信完了！\n\n実際の送信は実装されていません。');
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
