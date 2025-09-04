import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Survey } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyEditorService {
  private readonly STORAGE_KEY = 'survey_templates';
  private surveysSubject = new BehaviorSubject<Survey[]>([]);
  public surveys$ = this.surveysSubject.asObservable();

  constructor() {
    this.loadSurveys();
  }

  // ローカルストレージからサーベイを読み込み
  private loadSurveys(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    let surveys = stored ? JSON.parse(stored) : [];
    
    // データが存在しない場合はサンプルアンケートを作成
    if (surveys.length === 0) {
      surveys = [this.getSampleSurvey()];
      this.saveSurveys(surveys);
    }
    
    this.surveysSubject.next(surveys);
  }

  // ローカルストレージにサーベイを保存
  private saveSurveys(surveys: Survey[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(surveys));
    this.surveysSubject.next(surveys);
  }

  // すべてのサーベイを取得
  getAllSurveys(): Observable<Survey[]> {
    return this.surveys$;
  }

  // 特定のサーベイを取得
  getSurvey(id: string): Observable<Survey> {
    const surveys = this.surveysSubject.value;
    const survey = surveys.find(s => s.id === id);
    
    if (survey) {
      return of(survey);
    } else {
      // サンプルサーベイを返す（デモ用）
      return of(this.getSampleSurvey());
    }
  }

  // 新しいサーベイを作成
  createSurvey(survey: Survey): Observable<Survey> {
    const surveys = this.surveysSubject.value;
    
    // IDの重複チェック
    if (surveys.some(s => s.id === survey.id)) {
      throw new Error(`サーベイID "${survey.id}" は既に存在します`);
    }

    // メタデータを設定
    survey.metadata = {
      created: new Date().toISOString().split('T')[0],
      version: survey.metadata?.version || '1.0',
      author: survey.metadata?.author || 'Unknown'
    };

    surveys.push(survey);
    this.saveSurveys(surveys);
    
    return of(survey);
  }

  // サーベイを更新
  updateSurvey(survey: Survey): Observable<Survey> {
    const surveys = this.surveysSubject.value;
    const index = surveys.findIndex(s => s.id === survey.id);
    
    if (index === -1) {
      throw new Error(`サーベイID "${survey.id}" が見つかりません`);
    }

    // メタデータを更新
    survey.metadata = {
      created: surveys[index].metadata?.created || new Date().toISOString().split('T')[0],
      version: this.incrementVersion(surveys[index].metadata?.version || '1.0'),
      author: survey.metadata?.author || surveys[index].metadata?.author || 'Unknown'
    };

    surveys[index] = survey;
    this.saveSurveys(surveys);
    
    return of(survey);
  }

  // サーベイを削除
  deleteSurvey(id: string): Observable<boolean> {
    const surveys = this.surveysSubject.value;
    const filteredSurveys = surveys.filter(s => s.id !== id);
    
    if (filteredSurveys.length === surveys.length) {
      throw new Error(`サーベイID "${id}" が見つかりません`);
    }

    this.saveSurveys(filteredSurveys);
    return of(true);
  }

  // サーベイを複製
  duplicateSurvey(id: string, newId: string): Observable<Survey> {
    const surveys = this.surveysSubject.value;
    const originalSurvey = surveys.find(s => s.id === id);
    
    if (!originalSurvey) {
      throw new Error(`サーベイID "${id}" が見つかりません`);
    }

    if (surveys.some(s => s.id === newId)) {
      throw new Error(`サーベイID "${newId}" は既に存在します`);
    }

    const duplicatedSurvey: Survey = {
      ...originalSurvey,
      id: newId,
      title: `${originalSurvey.title} (コピー)`,
      metadata: {
        created: new Date().toISOString().split('T')[0],
        version: '1.0',
        author: originalSurvey.metadata?.author || 'Unknown'
      }
    };

    surveys.push(duplicatedSurvey);
    this.saveSurveys(surveys);
    
    return of(duplicatedSurvey);
  }

  // バージョン番号をインクリメント
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1]) || 0;
    return `${major}.${minor + 1}`;
  }

  // サンプルサーベイを取得（デモ用）
  getSampleSurvey(): Survey {
    return {
      id: 'employee-satisfaction-2024',
      title: '従業員満足度調査 2024',
      description: '職場環境と業務満足度に関する調査です。率直なご意見をお聞かせください。',
      metadata: {
        created: '2024-01-15',
        version: '1.0',
        author: '人事部'
      },
      sections: [
        {
          id: 'basic-info',
          title: '基本情報',
          description: 'まずは基本的な情報をお聞かせください。',
          questions: [
            {
              id: 'department',
              type: 'select',
              label: '所属部署',
              required: true,
              options: ['営業部', '開発部', '人事部', '経理部', 'その他']
            },
            {
              id: 'years',
              type: 'number',
              label: '勤続年数',
              required: true,
              placeholder: '年数を入力してください',
              validation: {
                min: 0,
                max: 50
              }
            }
          ]
        },
        {
          id: 'work-environment',
          title: '職場環境',
          description: '職場環境について評価してください。',
          questions: [
            {
              id: 'workplace-satisfaction',
              type: 'radio',
              label: '職場環境の満足度',
              required: true,
              options: ['非常に満足', '満足', '普通', '不満', '非常に不満']
            },
            {
              id: 'work-life-balance',
              type: 'radio',
              label: 'ワークライフバランスの満足度',
              required: true,
              options: ['非常に満足', '満足', '普通', '不満', '非常に不満']
            },
            {
              id: 'improvements',
              type: 'textarea',
              label: '職場環境の改善点',
              required: false,
              placeholder: '具体的な改善提案があればお聞かせください'
            }
          ]
        },
        {
          id: 'job-satisfaction',
          title: '業務満足度',
          description: '現在の業務について評価してください。',
          questions: [
            {
              id: 'job-interest',
              type: 'radio',
              label: '業務への興味・関心',
              required: true,
              options: ['非常に高い', '高い', '普通', '低い', '非常に低い']
            },
            {
              id: 'growth-opportunity',
              type: 'radio',
              label: '成長機会の充足度',
              required: true,
              options: ['非常に充足', '充足', '普通', '不充足', '非常に不充足']
            },
            {
              id: 'future-plans',
              type: 'select',
              label: '今後のキャリアプラン',
              required: false,
              options: ['現在の業務を継続', '異動を希望', '転職を検討', '独立・起業', '未定']
            }
          ]
        }
      ]
    };
  }

  // サーベイの検証
  validateSurvey(survey: Survey): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!survey.id || survey.id.trim() === '') {
      errors.push('サーベイIDは必須です');
    }

    if (!survey.title || survey.title.trim() === '') {
      errors.push('タイトルは必須です');
    }

    if (!survey.sections || survey.sections.length === 0) {
      errors.push('少なくとも1つのセクションが必要です');
    }

    survey.sections?.forEach((section, sectionIndex) => {
      if (!section.id || section.id.trim() === '') {
        errors.push(`セクション${sectionIndex + 1}: IDは必須です`);
      }

      if (!section.title || section.title.trim() === '') {
        errors.push(`セクション${sectionIndex + 1}: タイトルは必須です`);
      }

      if (!section.questions || section.questions.length === 0) {
        errors.push(`セクション${sectionIndex + 1}: 少なくとも1つの質問が必要です`);
      }

      section.questions?.forEach((question, questionIndex) => {
        if (!question.id || question.id.trim() === '') {
          errors.push(`セクション${sectionIndex + 1} 質問${questionIndex + 1}: IDは必須です`);
        }

        if (!question.label || question.label.trim() === '') {
          errors.push(`セクション${sectionIndex + 1} 質問${questionIndex + 1}: ラベルは必須です`);
        }

        if (['select', 'radio', 'checkbox'].includes(question.type)) {
          if (!question.options || question.options.length === 0) {
            errors.push(`セクション${sectionIndex + 1} 質問${questionIndex + 1}: 選択肢が必要です`);
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // サーベイをエクスポート（JSON形式）
  exportSurvey(id: string): Observable<string> {
    return new Observable(observer => {
      this.getSurvey(id).subscribe({
        next: (survey) => {
          const jsonString = JSON.stringify(survey, null, 2);
          observer.next(jsonString);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // サーベイをインポート（JSON形式）
  importSurvey(jsonString: string): Observable<Survey> {
    try {
      const survey = JSON.parse(jsonString);
      const validation = this.validateSurvey(survey);
      
      if (!validation.isValid) {
        throw new Error(`インポートエラー: ${validation.errors.join(', ')}`);
      }

      return this.createSurvey(survey);
    } catch (error) {
      throw new Error(`JSONの解析に失敗しました: ${error}`);
    }
  }
}
