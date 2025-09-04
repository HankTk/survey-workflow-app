import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'survey', loadComponent: () => import('./pages/survey/survey.component').then(m => m.SurveyComponent) },
  { path: 'survey-editor', loadComponent: () => import('./pages/survey-editor/survey-editor.component').then(m => m.SurveyEditorComponent) },
  { path: 'workflow', loadComponent: () => import('./pages/workflow/workflow.component').then(m => m.WorkflowComponent) },
  { path: 'statistics', loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
