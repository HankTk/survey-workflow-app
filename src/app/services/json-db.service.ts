import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonDbService {
  private readonly API_URL = 'http://localhost:3001';

  constructor(private http: HttpClient) { }

  // アンケート回答の操作
  saveSurveyResponse(response: any): Observable<any> {
    return this.http.post(`${this.API_URL}/surveyResponses`, response)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllSurveyResponses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/surveyResponses`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSurveyResponsesBySurveyId(surveyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/surveyResponses?surveyId=${surveyId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteSurveyResponse(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/surveyResponses/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ワークフロー文書の操作
  getAllWorkflowDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/workflowDocuments`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getWorkflowDocumentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/workflowDocuments/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createWorkflowDocument(document: any): Observable<any> {
    return this.http.post(`${this.API_URL}/workflowDocuments`, document)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateWorkflowDocument(id: string, document: any): Observable<any> {
    return this.http.put(`${this.API_URL}/workflowDocuments/${id}`, document)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteWorkflowDocument(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/workflowDocuments/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // アンケートテンプレートの操作
  getAllSurveys(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/surveys`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSurveyById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/surveys/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createSurvey(survey: any): Observable<any> {
    return this.http.post(`${this.API_URL}/surveys`, survey)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateSurvey(id: string, survey: any): Observable<any> {
    return this.http.put(`${this.API_URL}/surveys/${id}`, survey)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteSurvey(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/surveys/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 統計情報の取得
  getStatistics(): Observable<any> {
    return this.http.get<any[]>(`${this.API_URL}/surveyResponses`)
      .pipe(
        map(responses => {
          const surveyCounts: { [key: string]: number } = {};
          
          responses.forEach(response => {
            surveyCounts[response.surveyId || 'unknown'] = (surveyCounts[response.surveyId || 'unknown'] || 0) + 1;
          });

          return {
            totalResponses: responses.length,
            surveyCounts: surveyCounts,
            lastSubmission: responses.length > 0 ? responses[responses.length - 1].submittedAt : null
          };
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('JSON-DB Service Error:', error);
    return throwError(() => error);
  }
}

