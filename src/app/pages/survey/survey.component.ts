import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DynamicSurveyComponent } from '../../components/dynamic-survey.component';
import { XmlParserService } from '../../services/xml-parser.service';
import { SurveyStorageService } from '../../services/survey-storage.service';
import { SurveyFileService } from '../../services/survey-file.service';
import { Survey, SurveyResponse } from '../../models/survey.model';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    DynamicSurveyComponent
  ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent implements OnInit {

  private http = inject(HttpClient);
  private xmlParser = inject(XmlParserService);
  private surveyStorage = inject(SurveyStorageService);
  private surveyFileService = inject(SurveyFileService);
  private snackBar = inject(MatSnackBar);

  survey: Survey | null = null;
  isLoading = false;
  error: string | null = null;
  submittedResponses: SurveyResponse[] = [];
  availableSurveys: string[] = [];
  selectedSurveyId: string = '';

  ngOnInit()
  {
    // 保存された回答を読み込み
    const rawResponses = this.surveyStorage.getAllResponses();
    this.submittedResponses = this.convertLegacyResponses(rawResponses);
    
    // 利用可能なサーベイ一覧を読み込み
    this.loadAvailableSurveys();
  }

  loadSampleSurvey()
  {
    this.isLoading = true;
    this.error = null;

    this.http.get('assets/data/sample-survey.xml', { responseType: 'text' }).subscribe({
      next: (xmlData) =>
      {
        if (xmlData)
        {
          this.survey = this.xmlParser.parseSurveyXml(xmlData);
          
          if (this.survey)
          {
            this.snackBar.open('アンケートが正常に読み込まれました', '閉じる', { duration: 3000 });
            console.log('Loaded survey:', this.survey);
          }
          else
          {
            this.error = 'XMLデータの解析に失敗しました';
          }
        }
        else
        {
          this.error = 'XMLファイルの読み込みに失敗しました';
        }
        this.isLoading = false;
      },
      error: (err) =>
      {
        this.error = 'エラーが発生しました: ' + err.message;
        this.isLoading = false;
        console.error('Error loading survey:', err);
      }
    });
  }

  clearSurvey()
  {
    this.survey = null;
    this.error = null;
    this.snackBar.open('アンケートがクリアされました', '閉じる', { duration: 2000 });
  }

  onSurveySubmitted(response: SurveyResponse)
  {
    // ローカルストレージに保存
    this.surveyStorage.saveResponse(response);
    
    // 表示用の配列を更新
    this.submittedResponses = this.surveyStorage.getAllResponses();
    
    this.snackBar.open('アンケートが送信されました', '閉じる', { duration: 3000 });
    console.log('Survey submitted and saved:', response);
  }

  deleteResponse(index: number)
  {
    this.surveyStorage.deleteResponse(index);
    this.submittedResponses = this.surveyStorage.getAllResponses();
    this.snackBar.open('回答を削除しました', '閉じる', { duration: 2000 });
  }

  clearAllResponses()
  {
    if (confirm('すべての回答を削除しますか？この操作は元に戻せません。'))
    {
      this.surveyStorage.clearAllResponses();
      this.submittedResponses = [];
      this.snackBar.open('すべての回答を削除しました', '閉じる', { duration: 2000 });
    }
  }

  // 既存の回答データを新しい形式に変換（後方互換性のため）
  private convertLegacyResponses(responses: any[]): any[]
  {
    return responses.map(response => ({
      ...response,
      responses: response.responses.map((item: any) => ({
        ...item,
        questionLabel: item.questionLabel || this.getQuestionLabelFromId(item.questionId)
      }))
    }));
  }

  private getQuestionLabelFromId(questionId: string): string
  {
    // 質問IDから日本語ラベルへのマッピング
    const labelMap: { [key: string]: string } = {
      'department': '所属部署',
      'years': '勤続年数',
      'workplace-satisfaction': '職場環境の満足度',
      'work-life-balance': 'ワークライフバランスの満足度',
      'improvements': '職場環境の改善点',
      'job-interest': '業務への興味・関心',
      'growth-opportunity': '成長機会の充足度',
      'future-plans': '今後のキャリアプラン'
    };
    return labelMap[questionId] || questionId;
  }

  /**
   * 利用可能なサーベイ一覧を読み込み
   */
  loadAvailableSurveys(): void {
    // ローカルストレージに保存されたXMLサーベイを取得
    const localSurveys = this.surveyFileService.getLocalStorageSurveyList();
    
    // サンプルサーベイも追加
    this.availableSurveys = ['sample-survey.xml', ...localSurveys];
  }

  /**
   * 選択されたサーベイを読み込み
   */
  loadSelectedSurvey(): void {
    if (!this.selectedSurveyId) {
      this.error = 'サーベイを選択してください';
      return;
    }

    this.isLoading = true;
    this.error = null;

    if (this.selectedSurveyId === 'sample-survey.xml') {
      // サンプルサーベイを読み込み
      this.loadSampleSurvey();
    } else {
      // ローカルストレージからXMLサーベイを読み込み
      const survey = this.surveyFileService.loadSurveyFromLocalStorage(this.selectedSurveyId);
      if (survey) {
        this.survey = survey;
        this.snackBar.open('サーベイが正常に読み込まれました', '閉じる', { duration: 3000 });
        console.log('Loaded survey from localStorage:', survey);
      } else {
        this.error = 'サーベイの読み込みに失敗しました';
      }
      this.isLoading = false;
    }
  }

  /**
   * サーベイ選択が変更されたとき
   */
  onSurveySelectionChange(): void {
    this.survey = null;
    this.error = null;
  }

  /**
   * 選択されたサーベイを削除
   */
  deleteSelectedSurvey(): void {
    if (!this.selectedSurveyId || this.selectedSurveyId === 'sample-survey.xml') {
      this.snackBar.open('サンプルサーベイは削除できません', '閉じる', { duration: 3000 });
      return;
    }

    const confirmMessage = `サーベイ「${this.selectedSurveyId}」を削除しますか？\nこの操作は取り消せません。`;
    if (confirm(confirmMessage)) {
      const deleted = this.surveyFileService.deleteSurveyFromLocalStorage(this.selectedSurveyId);
      if (deleted) {
        this.snackBar.open('サーベイが削除されました', '閉じる', { duration: 3000 });
        this.loadAvailableSurveys();
        this.selectedSurveyId = '';
        this.survey = null;
        this.error = null;
      } else {
        this.snackBar.open('サーベイの削除に失敗しました', '閉じる', { duration: 3000 });
      }
    }
  }

  /**
   * すべてのXMLサーベイを削除
   */
  deleteAllSurveys(): void {
    const localSurveys = this.surveyFileService.getLocalStorageSurveyList();
    if (localSurveys.length === 0) {
      this.snackBar.open('削除するサーベイがありません', '閉じる', { duration: 3000 });
      return;
    }

    const confirmMessage = `すべてのXMLサーベイ（${localSurveys.length}個）を削除しますか？\nこの操作は取り消せません。`;
    if (confirm(confirmMessage)) {
      const deletedCount = this.surveyFileService.clearAllSurveysFromLocalStorage();
      this.snackBar.open(`${deletedCount}個のサーベイが削除されました`, '閉じる', { duration: 3000 });
      this.loadAvailableSurveys();
      this.selectedSurveyId = '';
      this.survey = null;
      this.error = null;
    }
  }

}
