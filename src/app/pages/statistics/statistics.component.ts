import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';

import { StatisticsData } from '../../models/survey.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatGridListModule,
    MatChipsModule
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {

  @ViewChild('monthlyChart', { static: true }) monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  
  statistics: StatisticsData = {
    surveyResponses: 0,
    workflowDocuments: 0,
    averageResponseTime: 0,
    completionRate: 0,
    monthlyData: []
  };

  ngOnInit()
  {
    this.loadSampleStatistics();
    this.initializeChart();
  }

  private loadSampleStatistics()
  {
    // サンプル統計データを生成
    this.statistics = {
      surveyResponses: 156,
      workflowDocuments: 23,
      averageResponseTime: 1.8,
      completionRate: 87.5,
      monthlyData: [
        { month: '2024年1月', responses: 45, documents: 8 },
        { month: '2024年2月', responses: 52, documents: 12 },
        { month: '2024年3月', responses: 38, documents: 15 },
        { month: '2024年4月', responses: 61, documents: 18 },
        { month: '2024年5月', responses: 48, documents: 22 },
        { month: '2024年6月', responses: 67, documents: 25 }
      ]
    };
  }

  private initializeChart()
  {
    // Chart.jsの初期化（実際の実装ではChart.jsライブラリを使用）
    const canvas = this.monthlyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (ctx)
    {
      // サンプルのグラフ描画（実際のChart.js実装の代わり）
      this.drawSampleChart(ctx, canvas.width, canvas.height);
    }
  }

  private drawSampleChart(ctx: CanvasRenderingContext2D, width: number, height: number)
  {
    // 背景
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // グラフの説明
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Chart.js による月次トレンドグラフ', width / 2, height / 2 - 20);
    ctx.fillText('（実際の実装ではChart.jsライブラリを使用）', width / 2, height / 2 + 10);
    
    // サンプルデータの表示
    ctx.fillStyle = '#1976d2';
    ctx.font = '14px Arial';
    ctx.fillText('アンケート回答数: ' + this.statistics.surveyResponses, width / 2, height / 2 + 40);
    ctx.fillText('ワークフロー文書数: ' + this.statistics.workflowDocuments, width / 2, height / 2 + 60);
  }

}
