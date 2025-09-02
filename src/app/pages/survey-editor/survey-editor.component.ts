import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Survey, SurveySection, SurveyQuestion } from '../../models/survey.model';
import { SurveyEditorService } from '../../services/survey-editor.service';
import { SurveyFileService } from '../../services/survey-file.service';

@Component({
  selector: 'app-survey-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './survey-editor.component.html',
  styleUrls: ['./survey-editor.component.scss']
})
export class SurveyEditorComponent implements OnInit {
  surveyForm: FormGroup;
  currentSurvey: Survey | null = null;
  isEditing = false;
  isLoading = false;
  saveMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private surveyEditorService: SurveyEditorService,
    private surveyFileService: SurveyFileService
  ) {
    this.surveyForm = this.createSurveyForm();
  }

  ngOnInit(): void {
    // URLパラメータから編集するサーベイIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');
    
    if (surveyId) {
      this.loadSurveyForEdit(surveyId);
    }
  }

  private createSurveyForm(): FormGroup {
    return this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      metadata: this.fb.group({
        created: [new Date().toISOString().split('T')[0]],
        version: ['1.0'],
        author: ['']
      }),
      sections: this.fb.array([])
    });
  }

  get sections(): FormArray {
    return this.surveyForm.get('sections') as FormArray;
  }

  private createSectionForm(section?: SurveySection): FormGroup {
    return this.fb.group({
      id: [section?.id || '', Validators.required],
      title: [section?.title || '', Validators.required],
      description: [section?.description || ''],
      questions: this.fb.array(section?.questions?.map(q => this.createQuestionForm(q)) || [])
    });
  }

  private createQuestionForm(question?: SurveyQuestion): FormGroup {
    return this.fb.group({
      id: [question?.id || '', Validators.required],
      type: [question?.type || 'text', Validators.required],
      label: [question?.label || '', Validators.required],
      required: [question?.required || false],
      options: [question?.options || []],
      placeholder: [question?.placeholder || ''],
      validation: this.fb.group({
        min: [question?.validation?.min || ''],
        max: [question?.validation?.max || ''],
        pattern: [question?.validation?.pattern || '']
      })
    });
  }

  addSection(): void {
    const newSection = this.createSectionForm();
    this.sections.push(newSection);
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  getQuestions(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('questions') as FormArray;
  }

  addQuestion(sectionIndex: number): void {
    const questions = this.getQuestions(sectionIndex);
    const newQuestion = this.createQuestionForm();
    questions.push(newQuestion);
  }

  removeQuestion(sectionIndex: number, questionIndex: number): void {
    const questions = this.getQuestions(sectionIndex);
    questions.removeAt(questionIndex);
  }

  addOption(sectionIndex: number, questionIndex: number): void {
    const question = this.getQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;
    options.push(this.fb.control(''));
  }

  removeOption(sectionIndex: number, questionIndex: number, optionIndex: number): void {
    const question = this.getQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;
    options.removeAt(optionIndex);
  }

  getOptions(sectionIndex: number, questionIndex: number): FormArray {
    const question = this.getQuestions(sectionIndex).at(questionIndex);
    return question.get('options') as FormArray;
  }

  onQuestionTypeChange(sectionIndex: number, questionIndex: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const type = target.value;
    const question = this.getQuestions(sectionIndex).at(questionIndex);
    question.patchValue({ type });
    
    // 選択肢が必要なタイプの場合、デフォルトの選択肢を追加
    if (['select', 'radio', 'checkbox'].includes(type)) {
      const options = question.get('options') as FormArray;
      if (options.length === 0) {
        options.push(this.fb.control(''));
        options.push(this.fb.control(''));
      }
    }
  }

  loadSurveyForEdit(surveyId: string): void {
    this.isLoading = true;
    this.surveyEditorService.getSurvey(surveyId).subscribe({
      next: (survey) => {
        this.currentSurvey = survey;
        this.isEditing = true;
        this.populateForm(survey);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('サーベイの読み込みに失敗しました:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(survey: Survey): void {
    this.surveyForm.patchValue({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      metadata: survey.metadata
    });

    // セクションをクリアして再設定
    this.sections.clear();
    survey.sections.forEach(section => {
      const sectionForm = this.createSectionForm(section);
      this.sections.push(sectionForm);
    });
  }

  saveSurvey(): void {
    if (this.surveyForm.valid) {
      // 重複チェック
      if (this.checkNameDuplicate()) {
        const confirmMessage = this.isEditing 
          ? `サーベイ「${this.surveyForm.get('title')?.value}」は既に存在します。上書き保存しますか？`
          : `サーベイ「${this.surveyForm.get('title')?.value}」は既に存在します。別の名前で保存しますか？`;
        
        if (!confirm(confirmMessage)) {
          return;
        }
      }

      this.isLoading = true;
      const surveyData = this.surveyForm.value;
      
      // タイトルから自動的にIDを生成（新規作成時）
      if (!this.isEditing && (!surveyData.id || surveyData.id.trim() === '')) {
        const generatedId = this.generateIdFromTitle(surveyData.title);
        this.surveyForm.patchValue({ id: generatedId });
        surveyData.id = generatedId;
      }
      
      // フォームデータをSurveyオブジェクトに変換
      const survey: Survey = {
        id: surveyData.id,
        title: surveyData.title,
        description: surveyData.description,
        metadata: surveyData.metadata,
        sections: surveyData.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          questions: section.questions.map((question: any) => ({
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options?.filter((opt: string) => opt.trim() !== '') || [],
            placeholder: question.placeholder,
            validation: {
              min: question.validation.min || undefined,
              max: question.validation.max || undefined,
              pattern: question.validation.pattern || undefined
            }
          }))
        }))
      };

      if (this.isEditing) {
        this.surveyEditorService.updateSurvey(survey).subscribe({
          next: () => {
            this.saveMessage = `サーベイ「${survey.title}」が正常に更新されました`;
            this.isLoading = false;
            setTimeout(() => this.saveMessage = '', 3000);
          },
          error: (error) => {
            console.error('サーベイの更新に失敗しました:', error);
            this.saveMessage = 'サーベイの更新に失敗しました';
            this.isLoading = false;
            setTimeout(() => this.saveMessage = '', 3000);
          }
        });
      } else {
        this.surveyEditorService.createSurvey(survey).subscribe({
          next: () => {
            this.saveMessage = `サーベイ「${survey.title}」が正常に作成されました`;
            this.isLoading = false;
            setTimeout(() => this.saveMessage = '', 3000);
          },
          error: (error) => {
            console.error('サーベイの作成に失敗しました:', error);
            this.saveMessage = 'サーベイの作成に失敗しました';
            this.isLoading = false;
            setTimeout(() => this.saveMessage = '', 3000);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.surveyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  previewSurvey(): void {
    if (this.surveyForm.valid) {
      // プレビューページに遷移（実装は後で追加）
      console.log('プレビュー機能は今後実装予定です');
    }
  }

  /**
   * サーベイをXMLファイルとしてダウンロード
   */
  downloadAsXml(): void {
    if (this.surveyForm.valid) {
      const surveyData = this.surveyForm.value;
      const survey: Survey = {
        id: surveyData.id,
        title: surveyData.title,
        description: surveyData.description,
        metadata: surveyData.metadata,
        sections: surveyData.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          questions: section.questions.map((question: any) => ({
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options?.filter((opt: string) => opt.trim() !== '') || [],
            placeholder: question.placeholder,
            validation: {
              min: question.validation.min || undefined,
              max: question.validation.max || undefined,
              pattern: question.validation.pattern || undefined
            }
          }))
        }))
      };

      this.surveyFileService.downloadSurveyAsXml(survey);
      this.saveMessage = 'XMLファイルがダウンロードされました';
      setTimeout(() => this.saveMessage = '', 3000);
    } else {
      this.markFormGroupTouched(this.surveyForm);
      this.saveMessage = 'フォームにエラーがあります。修正してからダウンロードしてください。';
      setTimeout(() => this.saveMessage = '', 5000);
    }
  }

  /**
   * サーベイをローカルストレージにXMLとして保存
   */
  saveAsXmlToLocalStorage(): void {
    if (this.surveyForm.valid) {
      const surveyData = this.surveyForm.value;
      const survey: Survey = {
        id: surveyData.id,
        title: surveyData.title,
        description: surveyData.description,
        metadata: surveyData.metadata,
        sections: surveyData.sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          questions: section.questions.map((question: any) => ({
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options?.filter((opt: string) => opt.trim() !== '') || [],
            placeholder: question.placeholder,
            validation: {
              min: question.validation.min || undefined,
              max: question.validation.max || undefined,
              pattern: question.validation.pattern || undefined
            }
          }))
        }))
      };

      this.surveyFileService.saveSurveyToLocalStorage(survey);
      this.saveMessage = 'XMLファイルがローカルストレージに保存されました';
      setTimeout(() => this.saveMessage = '', 3000);
    } else {
      this.markFormGroupTouched(this.surveyForm);
      this.saveMessage = 'フォームにエラーがあります。修正してから保存してください。';
      setTimeout(() => this.saveMessage = '', 5000);
    }
  }

  /**
   * 現在のサーベイを削除
   */
  deleteCurrentSurvey(): void {
    if (!this.currentSurvey) {
      this.saveMessage = '削除するサーベイがありません';
      setTimeout(() => this.saveMessage = '', 3000);
      return;
    }

    const confirmMessage = `サーベイ「${this.currentSurvey.title}」を削除しますか？\nこの操作は取り消せません。`;
    if (confirm(confirmMessage)) {
      const deleted = this.surveyFileService.deleteSurveyFromLocalStorage(this.currentSurvey.id);
      if (deleted) {
        this.saveMessage = 'サーベイが削除されました';
        this.currentSurvey = null;
        this.surveyForm.reset();
        this.isEditing = false;
        setTimeout(() => this.saveMessage = '', 3000);
      } else {
        this.saveMessage = 'サーベイの削除に失敗しました';
        setTimeout(() => this.saveMessage = '', 3000);
      }
    }
  }

  /**
   * すべてのXMLサーベイを削除
   */
  deleteAllSurveys(): void {
    const confirmMessage = 'すべてのXMLサーベイを削除しますか？\nこの操作は取り消せません。';
    if (confirm(confirmMessage)) {
      const deletedCount = this.surveyFileService.clearAllSurveysFromLocalStorage();
      this.saveMessage = `${deletedCount}個のサーベイが削除されました`;
      this.currentSurvey = null;
      this.surveyForm.reset();
      this.isEditing = false;
      setTimeout(() => this.saveMessage = '', 3000);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  getQuestionTypes(): string[] {
    return ['text', 'number', 'select', 'radio', 'checkbox', 'textarea', 'date'];
  }

  // タイトルからIDを自動生成
  private generateIdFromTitle(title: string): string {
    if (!title || title.trim() === '') {
      return `survey-${Date.now()}`;
    }
    
    // 日本語をローマ字に変換（簡易版）
    let id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '-') // スペースをハイフンに
      .replace(/-+/g, '-') // 連続するハイフンを1つに
      .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
    
    // 日本語の簡易変換
    const japaneseMap: { [key: string]: string } = {
      '従業員': 'employee',
      '満足度': 'satisfaction',
      '調査': 'survey',
      '職場': 'workplace',
      '環境': 'environment',
      '業務': 'work',
      '基本': 'basic',
      '情報': 'info',
      '年数': 'years',
      '部署': 'department'
    };
    
    Object.keys(japaneseMap).forEach(jp => {
      id = id.replace(new RegExp(jp, 'g'), japaneseMap[jp]);
    });
    
    // 空の場合はタイムスタンプを使用
    if (id === '') {
      id = `survey-${Date.now()}`;
    }
    
    // 重複チェック
    return this.ensureUniqueId(id);
  }

  // IDの重複をチェックして一意性を保証
  private ensureUniqueId(baseId: string): string {
    let id = baseId;
    let counter = 1;
    
    // 既存のサーベイIDをチェック
    this.surveyEditorService.getAllSurveys().subscribe(surveys => {
      while (surveys.some(survey => survey.id === id)) {
        id = `${baseId}-${counter}`;
        counter++;
      }
    });
    
    return id;
  }

  // タイトル変更時にIDを自動更新（新規作成時のみ）
  onTitleChange(): void {
    if (!this.isEditing) {
      const title = this.surveyForm.get('title')?.value;
      const currentId = this.surveyForm.get('id')?.value;
      
      // IDが空または自動生成されたIDの場合のみ更新
      if (!currentId || currentId.trim() === '' || currentId.startsWith('survey-')) {
        const generatedId = this.generateIdFromTitle(title);
        this.surveyForm.patchValue({ id: generatedId });
      }
    }
  }

  // 名前重複チェック
  checkNameDuplicate(): boolean {
    const title = this.surveyForm.get('title')?.value;
    if (!title || title.trim() === '') return false;
    
    let isDuplicate = false;
    this.surveyEditorService.getAllSurveys().subscribe(surveys => {
      isDuplicate = surveys.some(survey => 
        survey.title === title && 
        (!this.isEditing || survey.id !== this.currentSurvey?.id)
      );
    });
    
    return isDuplicate;
  }

  // 重複チェックの結果を取得
  getDuplicateMessage(): string {
    if (this.checkNameDuplicate()) {
      return '⚠️ この名前のサーベイが既に存在します';
    }
    return '';
  }
}
