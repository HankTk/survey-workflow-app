import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { DynamicSurveyComponent } from '../../components/dynamic-survey.component';
import { XmlParserService } from '../../services/xml-parser.service';
import { SurveyStorageService } from '../../services/survey-storage.service';
import { Survey, SurveyResponse } from '../../models/survey.model';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    DynamicSurveyComponent
  ],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss'
})
export class SurveyComponent implements OnInit {

  private http = inject(HttpClient);
  private xmlParser = inject(XmlParserService);
  private surveyStorage = inject(SurveyStorageService);
  private snackBar = inject(MatSnackBar);

  survey: Survey | null = null;
  isLoading = false;
  error: string | null = null;
  submittedResponses: SurveyResponse[] = [];

  ngOnInit()
  {
    // 保存された回答を読み込み
    const rawResponses = this.surveyStorage.getAllResponses();
    this.submittedResponses = this.convertLegacyResponses(rawResponses);
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

}
