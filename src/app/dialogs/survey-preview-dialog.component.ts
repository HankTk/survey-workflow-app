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
  templateUrl: './survey-preview-dialog.component.html',
  styleUrls: ['./survey-preview-dialog.component.scss']
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
