import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Survey } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyFileService {
  private readonly ASSETS_PATH = 'assets/data/';

  constructor(private http: HttpClient) { }

  /**
   * SurveyオブジェクトをXML文字列に変換
   */
  convertSurveyToXml(survey: Survey): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<survey id="${survey.id}">\n`;
    xml += `  <title>${this.escapeXml(survey.title)}</title>\n`;
    xml += `  <description>${this.escapeXml(survey.description || '')}</description>\n`;
    
    // メタデータ
    if (survey.metadata) {
      xml += '  <metadata>\n';
      if (survey.metadata.created) {
        xml += `    <created>${survey.metadata.created}</created>\n`;
      }
      if (survey.metadata.version) {
        xml += `    <version>${survey.metadata.version}</version>\n`;
      }
      if (survey.metadata.author) {
        xml += `    <author>${survey.metadata.author}</author>\n`;
      }
      xml += '  </metadata>\n';
    }
    
    // セクション
    survey.sections.forEach(section => {
      xml += `  \n  <section id="${section.id}">\n`;
      xml += `    <title>${this.escapeXml(section.title)}</title>\n`;
      if (section.description) {
        xml += `    <description>${this.escapeXml(section.description || '')}</description>\n`;
      }
      
      // 質問
      section.questions.forEach(question => {
        xml += `    <question id="${question.id}" type="${question.type}" required="${question.required}">\n`;
        xml += `      <label>${this.escapeXml(question.label)}</label>\n`;
        
        if (question.placeholder) {
          xml += `      <placeholder>${this.escapeXml(question.placeholder || '')}</placeholder>\n`;
        }
        
        // 選択肢
        if (question.options && question.options.length > 0) {
          xml += '      <options>\n';
          question.options.forEach(option => {
            xml += `        <option>${this.escapeXml(option || '')}</option>\n`;
          });
          xml += '      </options>\n';
        }
        
        // バリデーション
        if (question.validation && (question.validation.min !== undefined || question.validation.max !== undefined)) {
          xml += '      <validation>\n';
          if (question.validation.min !== undefined) {
            xml += `        <min>${question.validation.min}</min>\n`;
          }
          if (question.validation.max !== undefined) {
            xml += `        <max>${question.validation.max}</max>\n`;
          }
          xml += '      </validation>\n';
        }
        
        xml += '    </question>\n';
      });
      
      xml += '  </section>\n';
    });
    
    xml += '</survey>';
    return xml;
  }

  /**
   * XML文字列をSurveyオブジェクトに変換
   */
  convertXmlToSurvey(xmlString: string): Survey | null {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('XML parsing error');
        return null;
      }

      const surveyElement = xmlDoc.querySelector('survey');
      if (!surveyElement) {
        console.error('Survey element not found');
        return null;
      }

      const survey: Survey = {
        id: surveyElement.getAttribute('id') || '',
        title: this.getTextContent(surveyElement, 'title') || '',
        description: this.getTextContent(surveyElement, 'description') || '',
        sections: this.parseSections(xmlDoc),
        metadata: this.parseMetadata(xmlDoc)
      };

      return survey;
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }

  /**
   * サーベイをXMLファイルとしてダウンロード
   */
  downloadSurveyAsXml(survey: Survey): void {
    const xmlContent = this.convertSurveyToXml(survey);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${survey.id}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * サーベイをローカルストレージにXMLとして保存
   */
  saveSurveyToLocalStorage(survey: Survey): void {
    const xmlContent = this.convertSurveyToXml(survey);
    const key = `survey_xml_${survey.id}`;
    localStorage.setItem(key, xmlContent);
  }

  /**
   * ローカルストレージからXMLサーベイを読み込み
   */
  loadSurveyFromLocalStorage(surveyId: string): Survey | null {
    const key = `survey_xml_${surveyId}`;
    const xmlContent = localStorage.getItem(key);
    if (xmlContent) {
      return this.convertXmlToSurvey(xmlContent);
    }
    return null;
  }

  /**
   * ローカルストレージに保存されたXMLサーベイの一覧を取得
   */
  getLocalStorageSurveyList(): string[] {
    const surveys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('survey_xml_')) {
        const surveyId = key.replace('survey_xml_', '');
        surveys.push(surveyId);
      }
    }
    return surveys;
  }

  /**
   * ローカルストレージからXMLサーベイを削除
   */
  deleteSurveyFromLocalStorage(surveyId: string): boolean {
    const key = `survey_xml_${surveyId}`;
    const exists = localStorage.getItem(key) !== null;
    if (exists) {
      localStorage.removeItem(key);
      return true;
    }
    return false;
  }

  /**
   * 複数のサーベイを一括削除
   */
  deleteMultipleSurveysFromLocalStorage(surveyIds: string[]): number {
    let deletedCount = 0;
    surveyIds.forEach(surveyId => {
      if (this.deleteSurveyFromLocalStorage(surveyId)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  /**
   * すべてのXMLサーベイを削除
   */
  clearAllSurveysFromLocalStorage(): number {
    const surveys = this.getLocalStorageSurveyList();
    return this.deleteMultipleSurveysFromLocalStorage(surveys);
  }

  /**
   * assets/dataフォルダ内のXMLファイル一覧を取得（開発環境用）
   */
  getAssetsSurveyList(): Observable<string[]> {
    // 開発環境では、既知のファイル一覧を返す
    // 本番環境では、サーバーAPIから取得する必要がある
    return of(['sample-survey.xml']);
  }

  /**
   * assets/dataフォルダからXMLファイルを読み込み
   */
  loadSurveyFromAssets(filename: string): Observable<Survey> {
    return new Observable(observer => {
      this.http.get(`${this.ASSETS_PATH}${filename}`, { responseType: 'text' }).subscribe({
        next: (xmlData) => {
          const survey = this.convertXmlToSurvey(xmlData);
          if (survey) {
            observer.next(survey);
            observer.complete();
          } else {
            observer.error('XMLの解析に失敗しました');
          }
        },
        error: (err) => {
          observer.error(`ファイルの読み込みに失敗しました: ${err.message}`);
        }
      });
    });
  }

  /**
   * XML文字列の特殊文字をエスケープ
   */
  private escapeXml(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * XML要素からテキストコンテンツを取得
   */
  private getTextContent(element: Element, tagName: string): string {
    const child = element.querySelector(tagName);
    return child ? child.textContent || '' : '';
  }

  /**
   * XMLからセクションを解析
   */
  private parseSections(xmlDoc: Document): any[] {
    const sections: any[] = [];
    const sectionElements = xmlDoc.querySelectorAll('section');
    
    sectionElements.forEach(sectionElement => {
      const section = {
        id: sectionElement.getAttribute('id') || '',
        title: this.getTextContent(sectionElement, 'title') || '',
        description: this.getTextContent(sectionElement, 'description') || '',
        questions: this.parseQuestions(sectionElement)
      };
      sections.push(section);
    });
    
    return sections;
  }

  /**
   * XMLから質問を解析
   */
  private parseQuestions(sectionElement: Element): any[] {
    const questions: any[] = [];
    const questionElements = sectionElement.querySelectorAll('question');
    
    questionElements.forEach(questionElement => {
      const question = {
        id: questionElement.getAttribute('id') || '',
        type: questionElement.getAttribute('type') || 'text',
        required: questionElement.getAttribute('required') === 'true',
        label: this.getTextContent(questionElement, 'label') || '',
        placeholder: this.getTextContent(questionElement, 'placeholder') || '',
        options: this.parseOptions(questionElement),
        validation: this.parseValidation(questionElement)
      };
      questions.push(question);
    });
    
    return questions;
  }

  /**
   * XMLから選択肢を解析
   */
  private parseOptions(questionElement: Element): string[] {
    const options: string[] = [];
    const optionElements = questionElement.querySelectorAll('option');
    
    optionElements.forEach(optionElement => {
      const optionText = optionElement.textContent || '';
      if (optionText.trim()) {
        options.push(optionText.trim());
      }
    });
    
    return options;
  }

  /**
   * XMLからバリデーションを解析
   */
  private parseValidation(questionElement: Element): any {
    const validation: any = {};
    const validationElement = questionElement.querySelector('validation');
    
    if (validationElement) {
      const minElement = validationElement.querySelector('min');
      const maxElement = validationElement.querySelector('max');
      
      if (minElement) {
        const minValue = parseInt(minElement.textContent || '0', 10);
        if (!isNaN(minValue)) {
          validation.min = minValue;
        }
      }
      
      if (maxElement) {
        const maxValue = parseInt(maxElement.textContent || '0', 10);
        if (!isNaN(maxValue)) {
          validation.max = maxValue;
        }
      }
    }
    
    return validation;
  }

  /**
   * XMLからメタデータを解析
   */
  private parseMetadata(xmlDoc: Document): any {
    const metadata: any = {};
    const metadataElement = xmlDoc.querySelector('metadata');
    
    if (metadataElement) {
      metadata.created = this.getTextContent(metadataElement, 'created');
      metadata.version = this.getTextContent(metadataElement, 'version');
      metadata.author = this.getTextContent(metadataElement, 'author');
    }
    
    return metadata;
  }
}
