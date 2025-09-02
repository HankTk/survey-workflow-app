export interface SurveyQuestion {
  id: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  sections: SurveySection[];
  metadata?: {
    created: string;
    version: string;
    author: string;
  };
}

export interface SurveyResponse {
  surveyId: string;
  responses: {
    questionId: string;
    questionLabel: string;
    value: any;
  }[];
  submittedAt: string;
  userId?: string;
}

export interface WorkflowDocument {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  currentStep: number;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  comments?: string[];
  completedAt?: string;
}

export interface StatisticsData {
  surveyResponses: number;
  workflowDocuments: number;
  averageResponseTime: number;
  completionRate: number;
  monthlyData: {
    month: string;
    responses: number;
    documents: number;
  }[];
}
