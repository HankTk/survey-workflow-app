import { Injectable } from '@angular/core';
import { SurveyResponse } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyStorageService {
  private readonly STORAGE_KEY = 'survey_responses';

  constructor() { }

  // アンケート回答を保存
  saveResponse(response: SurveyResponse): void {
    const responses = this.getAllResponses();
    responses.push(response);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(responses));
  }

  // すべてのアンケート回答を取得
  getAllResponses(): SurveyResponse[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // 特定のアンケートIDの回答を取得
  getResponsesBySurveyId(surveyId: string): SurveyResponse[] {
    return this.getAllResponses().filter(response => response.surveyId === surveyId);
  }

  // 回答を削除
  deleteResponse(index: number): void {
    const responses = this.getAllResponses();
    responses.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(responses));
  }

  // すべての回答をクリア
  clearAllResponses(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 統計情報を取得
  getStatistics(): any {
    const responses = this.getAllResponses();
    const surveyCounts: { [key: string]: number } = {};
    
    responses.forEach(response => {
      surveyCounts[response.surveyId || 'unknown'] = (surveyCounts[response.surveyId || 'unknown'] || 0) + 1;
    });

    return {
      totalResponses: responses.length,
      surveyCounts: surveyCounts,
      lastSubmission: responses.length > 0 ? responses[responses.length - 1].submittedAt : null
    };
  }
}
