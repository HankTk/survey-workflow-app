import { Injectable } from '@angular/core';
import { Survey, SurveySection, SurveyQuestion } from '../models/survey.model';

@Injectable({
  providedIn: 'root'
})
export class XmlParserService {

  constructor() { }

  parseSurveyXml(xmlString: string): Survey | null {
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

  private parseSections(xmlDoc: Document): SurveySection[] {
    const sections: SurveySection[] = [];
    const sectionElements = xmlDoc.querySelectorAll('section');

    sectionElements.forEach(sectionElement => {
      const section: SurveySection = {
        id: sectionElement.getAttribute('id') || '',
        title: this.getTextContent(sectionElement, 'title') || '',
        description: this.getTextContent(sectionElement, 'description') || '',
        questions: this.parseQuestions(sectionElement)
      };
      sections.push(section);
    });

    return sections;
  }

  private parseQuestions(sectionElement: Element): SurveyQuestion[] {
    const questions: SurveyQuestion[] = [];
    const questionElements = sectionElement.querySelectorAll('question');

    questionElements.forEach(questionElement => {
      const question: SurveyQuestion = {
        id: questionElement.getAttribute('id') || '',
        type: (questionElement.getAttribute('type') as any) || 'text',
        label: this.getTextContent(questionElement, 'label') || '',
        required: questionElement.getAttribute('required') === 'true',
        placeholder: this.getTextContent(questionElement, 'placeholder') || '',
        options: this.parseOptions(questionElement),
        validation: this.parseValidation(questionElement)
      };
      questions.push(question);
    });

    return questions;
  }

  private parseOptions(questionElement: Element): string[] {
    const options: string[] = [];
    const optionElements = questionElement.querySelectorAll('options option');
    
    optionElements.forEach(optionElement => {
      const optionText = optionElement.textContent?.trim();
      if (optionText) {
        options.push(optionText);
      }
    });

    return options;
  }

  private parseValidation(questionElement: Element): any {
    const validation: any = {};
    const validationElement = questionElement.querySelector('validation');
    
    if (validationElement) {
      const min = validationElement.querySelector('min')?.textContent;
      const max = validationElement.querySelector('max')?.textContent;
      const pattern = validationElement.querySelector('pattern')?.textContent;
      
      if (min) validation.min = parseInt(min);
      if (max) validation.max = parseInt(max);
      if (pattern) validation.pattern = pattern;
    }

    return validation;
  }

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

  private getTextContent(element: Element, tagName: string): string {
    const tag = element.querySelector(tagName);
    return tag?.textContent?.trim() || '';
  }
}
