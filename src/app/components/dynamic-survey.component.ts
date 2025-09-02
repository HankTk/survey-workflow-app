import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { Survey, SurveySection, SurveyQuestion } from '../models/survey.model';

@Component({
  selector: 'app-dynamic-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './dynamic-survey.component.html',
  styleUrl: './dynamic-survey.component.scss'
})
export class DynamicSurveyComponent implements OnInit, OnChanges {

  private fb = inject(FormBuilder);

  @Input() survey: Survey | null = null;
  @Output() surveySubmitted = new EventEmitter<any>();

  surveyForm!: FormGroup;

  ngOnInit()
  {
    this.surveyForm = this.fb.group({});
    if (this.survey)
    {
      this.buildForm();
    }
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['survey'] && this.survey)
    {
      this.buildForm();
    }
  }

  private buildForm()
  {
    if (!this.survey) return;

    const formGroup: any = {};

    this.survey.sections.forEach(section =>
    {
      section.questions.forEach(question =>
      {
        const validators = [];
        
        if (question.required)
        {
          validators.push(Validators.required);
        }

        if (question.validation)
        {
          if (question.validation.min !== undefined)
          {
            validators.push(Validators.min(question.validation.min));
          }
          if (question.validation.max !== undefined)
          {
            validators.push(Validators.max(question.validation.max));
          }
          if (question.validation.pattern)
          {
            validators.push(Validators.pattern(question.validation.pattern));
          }
        }

        if (question.type === 'checkbox')
        {
          // Checkboxの場合は配列として管理
          formGroup[question.id] = this.fb.array([]);
        }
        else
        {
          formGroup[question.id] = ['', validators];
        }
      });
    });

    this.surveyForm = this.fb.group(formGroup);
  }

  onSubmit()
  {
    if (this.surveyForm.valid)
    {
      const formValue = this.surveyForm.value;
      const responses: any[] = [];

      // フォームの値をレスポンス形式に変換
      Object.keys(formValue).forEach(key =>
      {
        if (formValue[key] !== null && formValue[key] !== '')
        {
          // 質問のラベルを取得
          const questionLabel = this.getQuestionLabel(key);
          responses.push({
            questionId: key,
            questionLabel: questionLabel,
            value: formValue[key]
          });
        }
      });

      const surveyResponse = {
        surveyId: this.survey?.id,
        responses: responses,
        submittedAt: new Date().toISOString()
      };

      this.surveySubmitted.emit(surveyResponse);
    }
  }

  private getQuestionLabel(questionId: string): string
  {
    if (!this.survey) return questionId;
    
    for (const section of this.survey.sections)
    {
      for (const question of section.questions)
      {
        if (question.id === questionId)
        {
          return question.label;
        }
      }
    }
    return questionId;
  }

}
