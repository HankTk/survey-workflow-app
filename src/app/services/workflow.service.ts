import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkflowDocument, WorkflowStep } from '../models/survey.model';
import { JsonDbService } from './json-db.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private documentsSubject = new BehaviorSubject<WorkflowDocument[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  constructor(private jsonDbService: JsonDbService) {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    this.jsonDbService.getAllWorkflowDocuments().subscribe({
      next: (documents) => {
        this.documentsSubject.next(documents);
      },
      error: (error) => {
        console.error('Failed to load workflow documents:', error);
        // フォールバック: ローカルストレージから読み込み
        this.loadFromLocalStorage();
      }
    });
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('workflow_documents');
    let documents = stored ? JSON.parse(stored) : [];
    
    if (documents.length === 0) {
      documents = this.getSampleDocuments();
      this.saveToLocalStorage(documents);
    }
    
    this.documentsSubject.next(documents);
  }

  private saveToLocalStorage(documents: WorkflowDocument[]): void {
    localStorage.setItem('workflow_documents', JSON.stringify(documents));
    this.documentsSubject.next(documents);
  }

  getAllDocuments(): Observable<WorkflowDocument[]> {
    return this.documents$;
  }

  getDocumentById(id: string): Observable<WorkflowDocument | undefined> {
    return this.jsonDbService.getWorkflowDocumentById(id).pipe(
      map(document => document || undefined)
    );
  }

  createDocument(document: Omit<WorkflowDocument, 'id' | 'createdAt' | 'updatedAt' | 'currentStep'>): Observable<WorkflowDocument> {
    const newDocument: WorkflowDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep: 1
    };

    return this.jsonDbService.createWorkflowDocument(newDocument).pipe(
      map((savedDocument) => {
        // ローカルキャッシュを更新
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocuments, savedDocument]);
        return savedDocument;
      })
    );
  }

  updateDocument(id: string, updates: Partial<WorkflowDocument>): Observable<WorkflowDocument | null> {
    const currentDocuments = this.documentsSubject.value;
    const existingDocument = currentDocuments.find(doc => doc.id === id);
    
    if (!existingDocument) {
      return of(null);
    }

    const updatedDocument = {
      ...existingDocument,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.jsonDbService.updateWorkflowDocument(id, updatedDocument).pipe(
      map((savedDocument) => {
        // ローカルキャッシュを更新
        const updatedDocuments = currentDocuments.map(doc => 
          doc.id === id ? savedDocument : doc
        );
        this.documentsSubject.next(updatedDocuments);
        return savedDocument;
      })
    );
  }

  deleteDocument(id: string): Observable<boolean> {
    return this.jsonDbService.deleteWorkflowDocument(id).pipe(
      map(() => {
        // ローカルキャッシュを更新
        const currentDocuments = this.documentsSubject.value;
        const updatedDocuments = currentDocuments.filter(doc => doc.id !== id);
        this.documentsSubject.next(updatedDocuments);
        return true;
      })
    );
  }

  approveStep(documentId: string, stepIndex: number): Observable<WorkflowDocument | null> {
    const currentDocuments = this.documentsSubject.value;
    const document = currentDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      return of(null);
    }

    const step = document.steps[stepIndex];
    
    if (!step) {
      return of(null);
    }

    // ステップを完了にマーク
    step.status = 'completed';
    step.completedAt = new Date().toISOString();
    
    // 次のステップがある場合は進行中にマーク
    if (stepIndex + 1 < document.steps.length) {
      document.currentStep = stepIndex + 2;
      document.steps[stepIndex + 1].status = 'in-progress';
    } else {
      // 最後のステップの場合は文書を承認済みに
      document.status = 'approved';
    }

    document.updatedAt = new Date().toISOString();
    
    return this.updateDocument(documentId, document);
  }

  rejectStep(documentId: string, stepIndex: number): Observable<WorkflowDocument | null> {
    const currentDocuments = this.documentsSubject.value;
    const document = currentDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      return of(null);
    }

    const step = document.steps[stepIndex];
    
    if (!step) {
      return of(null);
    }

    // ステップを却下にマーク
    step.status = 'rejected';
    document.status = 'rejected';
    document.updatedAt = new Date().toISOString();
    
    return this.updateDocument(documentId, document);
  }

  addComment(documentId: string, stepIndex: number, comment: string): Observable<WorkflowDocument | null> {
    const currentDocuments = this.documentsSubject.value;
    const document = currentDocuments.find(doc => doc.id === documentId);
    
    if (!document) {
      return of(null);
    }

    const step = document.steps[stepIndex];
    
    if (!step) {
      return of(null);
    }

    if (!step.comments) {
      step.comments = [];
    }
    
    step.comments.push(comment);
    document.updatedAt = new Date().toISOString();
    
    return this.updateDocument(documentId, document);
  }

  private getSampleDocuments(): WorkflowDocument[] {
    return [
      {
        id: 'doc-001',
        title: '新製品開発計画書',
        content: '次期新製品の開発計画について、市場調査結果と技術的実現可能性を踏まえて策定した計画書です。\n\n## 概要\n- 製品名: スマートウォッチ Pro\n- ターゲット市場: 健康志向の消費者\n- 予算: 5,000万円\n- 開発期間: 12ヶ月\n\n## 市場分析\n競合他社の製品分析を行い、差別化ポイントを明確にしました。\n\n## 技術仕様\n- バッテリー持続時間: 7日間\n- 防水性能: IP68\n- 対応OS: iOS, Android',
        status: 'review',
        currentStep: 2,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        steps: [
          {
            id: 'step-1',
            name: '企画部レビュー',
            assignee: '田中太郎',
            status: 'completed',
            completedAt: '2024-01-18T16:00:00Z',
            comments: ['市場性の観点から良い提案だと思います。', '予算の詳細化が必要です。']
          },
          {
            id: 'step-2',
            name: '技術部検証',
            assignee: '佐藤花子',
            status: 'in-progress'
          },
          {
            id: 'step-3',
            name: '経営陣承認',
            assignee: '山田次郎',
            status: 'pending'
          }
        ]
      },
      {
        id: 'doc-002',
        title: '人事制度改定案',
        content: '従業員の働きやすさ向上を目的とした人事制度の改定案です。\n\n## 改定内容\n- フレックスタイム制度の拡充\n- リモートワーク制度の新設\n- 有給休暇取得の促進\n- 育児・介護休暇の拡充\n\n## 期待効果\n- 従業員満足度の向上\n- 離職率の低下\n- 生産性の向上',
        status: 'draft',
        currentStep: 1,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-10T09:00:00Z',
        steps: [
          {
            id: 'step-1',
            name: '人事部作成',
            assignee: '鈴木一郎',
            status: 'completed',
            completedAt: '2024-01-10T09:00:00Z'
          },
          {
            id: 'step-2',
            name: '法務部確認',
            assignee: '高橋美咲',
            status: 'pending'
          },
          {
            id: 'step-3',
            name: '社長承認',
            assignee: '伊藤社長',
            status: 'pending'
          }
        ]
      },
      {
        id: 'doc-003',
        title: 'システム更新計画',
        content: '既存システムの更新と新機能追加に関する計画書です。\n\n## 更新内容\n- セキュリティパッチの適用\n- 新機能の追加\n- パフォーマンスの改善\n\n## スケジュール\n- 計画期間: 2週間\n- 実装期間: 4週間\n- テスト期間: 1週間',
        status: 'approved',
        currentStep: 3,
        createdAt: '2024-01-05T14:00:00Z',
        updatedAt: '2024-01-25T10:00:00Z',
        steps: [
          {
            id: 'step-1',
            name: 'IT部門検討',
            assignee: '田村健一',
            status: 'completed',
            completedAt: '2024-01-12T15:00:00Z',
            comments: ['技術的に実現可能です。']
          },
          {
            id: 'step-2',
            name: '予算承認',
            assignee: '財務部長',
            status: 'completed',
            completedAt: '2024-01-20T11:00:00Z',
            comments: ['予算内で実施可能です。']
          },
          {
            id: 'step-3',
            name: '最終承認',
            assignee: 'CTO',
            status: 'completed',
            completedAt: '2024-01-25T10:00:00Z',
            comments: ['承認しました。実施を進めてください。']
          }
        ]
      }
    ];
  }
}
