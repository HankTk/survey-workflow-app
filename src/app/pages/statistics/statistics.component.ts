import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';

import { StatisticsData } from '../../models/survey.model';
import { Chart, registerables } from 'chart.js';

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
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('monthlyChart', { static: true }) monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  
  statistics: StatisticsData = {
    surveyResponses: 0,
    workflowDocuments: 0,
    averageResponseTime: 0,
    completionRate: 0,
    monthlyData: []
  };

  private chart: Chart | null = null;

  ngOnInit()
  {
    this.loadSampleStatistics();
  }

  ngAfterViewInit()
  {
    this.initializeChart();
  }

  ngOnDestroy()
  {
    if (this.chart) {
      this.chart.destroy();
    }
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
        { month: '2023年7月', responses: 32, documents: 5 },
        { month: '2023年8月', responses: 28, documents: 7 },
        { month: '2023年9月', responses: 41, documents: 9 },
        { month: '2023年10月', responses: 35, documents: 6 },
        { month: '2023年11月', responses: 48, documents: 11 },
        { month: '2023年12月', responses: 52, documents: 13 },
        { month: '2024年1月', responses: 45, documents: 8 },
        { month: '2024年2月', responses: 52, documents: 12 },
        { month: '2024年3月', responses: 38, documents: 15 },
        { month: '2024年4月', responses: 61, documents: 18 },
        { month: '2024年5月', responses: 48, documents: 22 },
        { month: '2024年6月', responses: 67, documents: 25 },
        { month: '2024年7月', responses: 73, documents: 28 },
        { month: '2024年8月', responses: 58, documents: 31 },
        { month: '2024年9月', responses: 82, documents: 35 },
        { month: '2024年10月', responses: 69, documents: 29 },
        { month: '2024年11月', responses: 91, documents: 42 },
        { month: '2024年12月', responses: 88, documents: 38 }
      ]
    };
  }

  private initializeChart()
  {
    // Chart.jsの全機能を登録
    Chart.register(...registerables);
    
    const canvas = this.monthlyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (ctx)
    {
      // 既存のチャートを破棄
      if (this.chart) {
        this.chart.destroy();
      }

      // 月次データを準備
      const labels = this.statistics.monthlyData.map(data => data.month);
      const responseData = this.statistics.monthlyData.map(data => data.responses);
      const documentData = this.statistics.monthlyData.map(data => data.documents);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'アンケート回答数',
              data: responseData,
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#1976d2',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            },
            {
              label: 'ワークフロー文書数',
              data: documentData,
              borderColor: '#ff9800',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#ff9800',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '月次トレンド分析',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#333'
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#1976d2',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: '月',
                font: {
                  size: 14,
                  weight: 'bold'
                },
                color: '#666'
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#666',
                font: {
                  size: 10
                },
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: '件数',
                font: {
                  size: 14,
                  weight: 'bold'
                },
                color: '#666'
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#666',
                font: {
                  size: 11
                }
              },
              beginAtZero: true
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          }
        }
      });
    }
  }

}
