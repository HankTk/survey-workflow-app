import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="about-page">
      <div class="page-header">
        <mat-card>
          <mat-card-header>
            <mat-card-title>アプリケーションについて</mat-card-title>
            <mat-card-subtitle>アンケート & ワークフローアプリケーション の詳細情報</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>XMLデータから動的にアンケートUIを生成し、ワークフロー管理とデータ分析を行う統合アプリケーションの詳細をご紹介します。</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 主要機能 -->
      <div class="features-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>主要機能</mat-card-title>
            <mat-card-subtitle>アプリケーションの核となる機能</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon">📋</div>
                <h3>動的アンケート生成</h3>
                <p>XMLファイルから自動的にアンケートUIを生成し、柔軟な質問形式をサポートします。</p>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">🔄</div>
                <h3>ワークフロー管理</h3>
                <p>文書回覧・承認フローを効率的に管理し、業務プロセスを自動化します。</p>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">📊</div>
                <h3>データ分析</h3>
                <p>収集されたデータを可視化し、インサイトを提供します。</p>
              </div>
              
              <div class="feature-item">
                <div class="feature-icon">💾</div>
                <h3>データ管理</h3>
                <p>ローカルストレージを使用した安全なデータ保存と管理機能を提供します。</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- 技術スタック -->
      <div class="technology-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>技術スタック</mat-card-title>
            <mat-card-subtitle>使用している技術とフレームワーク</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="tech-grid">
              <div class="tech-category">
                <h3>フロントエンド</h3>
                <div class="tech-items">
                  <span class="tech-item">Angular 20</span>
                  <span class="tech-item">TypeScript</span>
                  <span class="tech-item">Angular Material</span>
                  <span class="tech-item">SCSS</span>
                  <span class="tech-item">RxJS</span>
                </div>
              </div>
              
              <div class="tech-category">
                <h3>データ処理</h3>
                <div class="tech-items">
                  <span class="tech-item">XML Parser</span>
                  <span class="tech-item">Local Storage</span>
                  <span class="tech-item">Reactive Forms</span>
                  <span class="tech-item">HTTP Client</span>
                </div>
              </div>
              
              <div class="tech-category">
                <h3>開発ツール</h3>
                <div class="tech-items">
                  <span class="tech-item">Angular CLI</span>
                  <span class="tech-item">Standalone Components</span>
                  <span class="tech-item">Zone.js</span>
                  <span class="tech-item">ESLint</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- はじめに -->
      <div class="getting-started-section">
        <mat-card>
          <mat-card-header>
            <mat-card-title>はじめに</mat-card-title>
            <mat-card-subtitle>アプリケーションの使い方</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>アンケートの作成</h4>
                  <p>XMLファイルでアンケートの構造を定義します。質問、選択肢、バリデーションルールを設定できます。</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>動的UI生成</h4>
                  <p>XMLデータを読み込むと、定義された内容に基づいて自動的にアンケートUIが生成されます。</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>回答の収集</h4>
                  <p>生成されたUIでユーザーが回答を入力し、バリデーションが適用されます。</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>データ分析</h4>
                  <p>収集された回答データを分析し、統計情報やグラフで可視化します。</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

    </div>
  `,
  styles: [`
    .about-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header mat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-header mat-card-title {
      color: white;
      font-size: 2rem;
      font-weight: 600;
    }

    .page-header mat-card-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.1rem;
    }

    .page-header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
      line-height: 1.6;
    }

    .features-section,
    .technology-section,
    .getting-started-section {
      margin-bottom: 30px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .feature-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background-color: #f8f9fa;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .feature-item h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .feature-item p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 20px;
    }

    .tech-category h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.3rem;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }

    .tech-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .tech-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 20px;
      border-radius: 8px;
      background-color: #f8f9fa;
      transition: transform 0.3s ease;
    }

    .step:hover {
      transform: translateY(-3px);
    }

    .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .step-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }


    @media (max-width: 768px) {
      .about-page {
        padding: 16px;
      }

      .features-grid,
      .tech-grid,
      .steps {
        grid-template-columns: 1fr;
      }

    }
  `]
})
export class AboutComponent {
  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
