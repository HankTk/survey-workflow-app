import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { SurveyFileService } from '../../services/survey-file.service';
import { SurveyEditorService } from '../../services/survey-editor.service';
import { Survey } from '../../models/survey.model';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../dialogs/confirm-dialog.component';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent implements OnInit {

  private surveyFileService = inject(SurveyFileService);
  private surveyEditorService = inject(SurveyEditorService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  surveys: Survey[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadSurveys();
  }

  /**
   * 保存されたアンケート一覧を読み込み
   */
  loadSurveys(): void {
    this.isLoading = true;
    
    // SurveyEditorServiceからアンケートを取得
    this.surveyEditorService.getAllSurveys().subscribe({
      next: (surveys) => {
        // サンプルアンケートを先頭に追加
        const sampleSurvey = this.surveyEditorService.getSampleSurvey();
        this.surveys = [sampleSurvey, ...surveys];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('アンケート読み込みエラー:', error);
        this.snackBar.open('アンケートの読み込みに失敗しました', '閉じる', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * 新規アンケート作成
   */
  createNewSurvey(): void {
    this.router.navigate(['/survey-editor']);
  }

  /**
   * アンケートを編集
   */
  editSurvey(surveyId: string): void {
    this.router.navigate(['/survey-editor'], { queryParams: { id: surveyId } });
  }

  /**
   * アンケートを複製
   */
  duplicateSurvey(surveyId: string, event: Event): void {
    event.stopPropagation();
    
    // サンプルアンケートの場合は特別な処理
    if (this.isSampleSurvey(surveyId)) {
      const sampleSurvey = this.surveyEditorService.getSampleSurvey();
      const newId = `sample-copy-${Date.now()}`;
      const duplicatedSurvey = {
        ...sampleSurvey,
        id: newId,
        title: `${sampleSurvey.title} (コピー)`,
        metadata: {
          created: new Date().toISOString().split('T')[0],
          version: '1.0',
          author: sampleSurvey.metadata?.author || 'Unknown'
        }
      };
      
      this.surveyEditorService.createSurvey(duplicatedSurvey).subscribe({
        next: () => {
          this.loadSurveys();
          this.snackBar.open('サンプルアンケートを複製しました', '閉じる', { duration: 3000 });
        },
        error: (error) => {
          console.error('サンプルアンケートの複製に失敗しました:', error);
          this.snackBar.open('サンプルアンケートの複製に失敗しました', '閉じる', { duration: 3000 });
        }
      });
      return;
    }
    
    const newId = `${surveyId}-copy-${Date.now()}`;
    this.surveyEditorService.duplicateSurvey(surveyId, newId).subscribe({
      next: (duplicatedSurvey) => {
        this.loadSurveys();
        this.snackBar.open('アンケートを複製しました', '閉じる', { duration: 3000 });
      },
      error: (error) => {
        console.error('アンケートの複製に失敗しました:', error);
        this.snackBar.open('アンケートの複製に失敗しました', '閉じる', { duration: 3000 });
      }
    });
  }

  /**
   * アンケートを削除
   */
  deleteSurvey(surveyId: string, event: Event): void {
    event.stopPropagation();
    
    // サンプルアンケートは削除不可
    if (this.isSampleSurvey(surveyId)) {
      this.snackBar.open('サンプルアンケートは削除できません', '閉じる', { duration: 3000 });
      return;
    }
    
    const survey = this.surveys.find(s => s.id === surveyId);
    const surveyTitle = survey?.title || surveyId;
    
    const dialogData: ConfirmDialogData = {
      title: 'アンケートの削除',
      message: `アンケート「${surveyTitle}」を削除しますか？\n\nこの操作は取り消せません。`,
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
        this.surveyEditorService.deleteSurvey(surveyId).subscribe({
          next: () => {
            this.loadSurveys();
            this.snackBar.open('アンケートを削除しました', '閉じる', { duration: 3000 });
          },
          error: (error) => {
            console.error('アンケートの削除に失敗しました:', error);
            this.snackBar.open('アンケートの削除に失敗しました', '閉じる', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * アンケートの総質問数を取得
   */
  getTotalQuestions(survey: Survey): number {
    return survey.sections.reduce((total, section) => total + section.questions.length, 0);
  }

  /**
   * サンプルアンケートかどうかを判定
   */
  isSampleSurvey(surveyId: string): boolean {
    return surveyId === 'employee-satisfaction-2024';
  }

}
