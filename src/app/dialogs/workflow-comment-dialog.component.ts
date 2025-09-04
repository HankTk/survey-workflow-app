import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface WorkflowCommentDialogData {
  stepName: string;
  assignee: string;
  existingComments?: string[];
}

@Component({
  selector: 'app-workflow-comment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './workflow-comment-dialog.component.html',
  styleUrls: ['./workflow-comment-dialog.component.scss']
})
export class WorkflowCommentDialogComponent {
  commentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<WorkflowCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkflowCommentDialogData
  ) {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      const comment = this.commentForm.get('comment')?.value;
      this.dialogRef.close(comment);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
