import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { WorkflowDocument, WorkflowStep } from '../models/survey.model';

export interface WorkflowDocumentDialogData {
  document?: WorkflowDocument;
  isEdit?: boolean;
}

@Component({
  selector: 'app-workflow-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './workflow-document-dialog.component.html',
  styleUrls: ['./workflow-document-dialog.component.scss']
})
export class WorkflowDocumentDialogComponent {
  documentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkflowDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowDocumentDialogData
  ) {
    this.documentForm = this.createForm();
  }

  private createForm(): FormGroup {
    const document = this.data.document;
    
    return this.fb.group({
      title: [document?.title || '', [Validators.required, Validators.minLength(3)]],
      content: [document?.content || '', [Validators.required, Validators.minLength(10)]],
      status: [document?.status || 'draft', Validators.required],
      steps: this.fb.array(
        document?.steps?.length ? 
          document.steps.map(step => this.createStepForm(step)) : 
          [this.createStepForm()]
      )
    });
  }

  private createStepForm(step?: WorkflowStep): FormGroup {
    return this.fb.group({
      id: [step?.id || `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`],
      name: [step?.name || '', [Validators.required, Validators.minLength(2)]],
      assignee: [step?.assignee || '', [Validators.required, Validators.minLength(2)]],
      status: [step?.status || 'pending', Validators.required]
    });
  }

  get steps(): FormArray {
    return this.documentForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.createStepForm());
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  onSubmit(): void {
    console.log('Form valid:', this.documentForm.valid);
    console.log('Form value:', this.documentForm.value);
    console.log('Form errors:', this.getFormErrors());
    
    // フォームを強制的に検証
    this.markFormGroupTouched(this.documentForm);
    
    if (this.documentForm.valid) {
      try {
        const formValue = this.documentForm.value;
        const document: Partial<WorkflowDocument> = {
          title: formValue.title,
          content: formValue.content,
          status: formValue.status,
          steps: formValue.steps.map((step: WorkflowStep, index: number) => ({
            ...step,
            id: step.id || `step-${Date.now()}-${index}`
          }))
        };

        console.log('Saving document:', document);
        this.dialogRef.close(document);
      } catch (error) {
        console.error('Error creating document:', error);
        alert('文書の作成中にエラーが発生しました: ' + error);
      }
    } else {
      console.log('Form is invalid, cannot save');
      console.log('Detailed form errors:', this.getFormErrors());
      alert('フォームにエラーがあります。すべての必須項目を正しく入力してください。');
    }
  }

  private getFormErrors(): any {
    let formErrors: any = {};
    Object.keys(this.documentForm.controls).forEach(key => {
      const control = this.documentForm.get(key);
      if (control && control.errors) {
        formErrors[key] = control.errors;
      }
      if (control instanceof FormArray) {
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(subKey => {
              const subControl = arrayControl.get(subKey);
              if (subControl && subControl.errors) {
                if (!formErrors[key]) formErrors[key] = {};
                if (!formErrors[key][index]) formErrors[key][index] = {};
                formErrors[key][index][subKey] = subControl.errors;
              }
            });
          }
        });
      }
    });
    return formErrors;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
