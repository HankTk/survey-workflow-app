import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Survey } from '../../models/survey.model';
import { SurveyEditorService } from '../../services/survey-editor.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  surveys: Survey[] = [];
  isLoading = false;

  private router = inject(Router);
  private surveyEditorService = inject(SurveyEditorService);

  ngOnInit() {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.isLoading = true;
    this.surveyEditorService.getAllSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('サーベイの読み込みに失敗しました:', error);
        this.isLoading = false;
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  editSurvey(surveyId: string): void {
    this.router.navigate(['/survey-editor'], { queryParams: { id: surveyId } });
  }

  deleteSurvey(surveyId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('このサーベイを削除しますか？この操作は取り消せません。')) {
      this.surveyEditorService.deleteSurvey(surveyId).subscribe({
        next: () => {
          this.loadSurveys(); // 一覧を再読み込み
        },
        error: (error) => {
          console.error('サーベイの削除に失敗しました:', error);
          alert('サーベイの削除に失敗しました');
        }
      });
    }
  }

  duplicateSurvey(surveyId: string, event: Event): void {
    event.stopPropagation();
    const survey = this.surveys.find(s => s.id === surveyId);
    if (survey) {
      const newId = `${surveyId}-copy-${Date.now()}`;
      this.surveyEditorService.duplicateSurvey(surveyId, newId).subscribe({
        next: () => {
          this.loadSurveys(); // 一覧を再読み込み
        },
        error: (error) => {
          console.error('サーベイの複製に失敗しました:', error);
          alert('サーベイの複製に失敗しました');
        }
      });
    }
  }

  // サーベイの総質問数を取得
  getTotalQuestions(survey: Survey): number {
    return survey.sections.reduce((total, section) => total + section.questions.length, 0);
  }
}
