import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SurveyResponse } from '../models/survey.model';
import { JsonDbService } from './json-db.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyStorageService {
  private responsesSubject = new BehaviorSubject<SurveyResponse[]>([]);
  public responses$ = this.responsesSubject.asObservable();

  constructor(private jsonDbService: JsonDbService) {
    this.loadResponses();
  }

  private loadResponses(): void {
    this.jsonDbService.getAllSurveyResponses().subscribe({
      next: (responses) => {
        this.responsesSubject.next(responses);
      },
      error: (error) => {
        console.error('Failed to load survey responses:', error);
        // フォールバック: ローカルストレージから読み込み
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('survey_responses');
    const responses = stored ? JSON.parse(stored) : [];
    this.responsesSubject.next(responses);
  }

  // アンケート回答を保存
  saveResponse(response: SurveyResponse): Observable<SurveyResponse> {
    return this.jsonDbService.saveSurveyResponse(response).pipe(
      map((savedResponse) => {
        // ローカルキャッシュを更新
        const currentResponses = this.responsesSubject.value;
        this.responsesSubject.next([...currentResponses, savedResponse]);
        return savedResponse;
      })
    );
  }

  // すべてのアンケート回答を取得
  getAllResponses(): SurveyResponse[] {
    return this.responsesSubject.value;
  }

  // 特定のアンケートIDの回答を取得
  getResponsesBySurveyId(surveyId: string): Observable<SurveyResponse[]> {
    return this.jsonDbService.getSurveyResponsesBySurveyId(surveyId);
  }

  // 回答を削除
  deleteResponse(id: number): Observable<any> {
    return this.jsonDbService.deleteSurveyResponse(id).pipe(
      map(() => {
        // ローカルキャッシュを更新
        const currentResponses = this.responsesSubject.value;
        const updatedResponses = currentResponses.filter((_, index) => index !== id);
        this.responsesSubject.next(updatedResponses);
        return true;
      })
    );
  }

  // すべての回答をクリア
  clearAllResponses(): Observable<any> {
    // JSON-DBサーバーでは個別削除が必要
    const currentResponses = this.responsesSubject.value;
    const deletePromises = currentResponses.map((_, index) => 
      this.jsonDbService.deleteSurveyResponse(index).toPromise()
    );
    
    return new Observable(observer => {
      Promise.all(deletePromises).then(() => {
        this.responsesSubject.next([]);
        observer.next(true);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // 統計情報を取得
  getStatistics(): Observable<any> {
    return this.jsonDbService.getStatistics();
  }
}
