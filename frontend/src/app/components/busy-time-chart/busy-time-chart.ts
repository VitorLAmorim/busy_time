import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import {  ChartData, ChartOptions, registerables } from 'chart.js';
import { Chart } from 'chart.js';

Chart.register(...registerables);
import {BusyTime, dayLabels} from '../../models/place.model';

@Component({
  selector: 'app-busy-time-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    BaseChartDirective
  ],
  templateUrl: './busy-time-chart.html',
  styleUrl: './busy-time-chart.scss'
})
export class BusyTimeChartComponent {
  @Input() data!: BusyTime[];
  @Input() placeName!: string;

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Hour'
        },
        ticks: {
          callback: (value) => this.formatHour(Number(value))
        }
      },
      y: {
        title: {
          display: true,
          text: 'Crowdedness %'
        },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const level = this.getCrowdednessLevel(value);
            return `${label}: ${value}% (${level.label})`;
          }
        }
      }
    }
  };

  public lineChartLegend = false;
  public lineChartData: ChartData<'line'> = {
    labels: Array(24).fill(0).map((_, i) => i),
    datasets: [
      {
        data: [],
        label: 'Busy',
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: (context) => {
          const value = context.raw as number;
          const level = this.getCrowdednessLevel(value);
          return level.color;
        },
        pointBorderColor: '#3B82F6',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3B82F6',
        fill: true,
        tension: 0.3
      }
    ]
  };


 formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  }

  getCrowdednessLevel(level: number): { label: string; color: string } {
    if (level < 25) return { label: 'Low', color: '#22c55e' };
    if (level < 50) return { label: 'Moderate', color: '#eab308' };
    if (level < 75) return { label: 'High', color: '#f97316' };
    return { label: 'Very High', color: '#dc2626' };
  }

  getAverageCrowdedness(dayData: BusyTime): number {
    const avg = dayData.hours.reduce((sum, crowdedness) => sum + crowdedness, 0) / dayData.hours.length;
    return Math.round(avg);
  }

  getPeakHour(dayData: BusyTime): { hour: number; crowdedness: number } {
    let maxCrowdedness = 0;
    let peakHour = 0;

    dayData.hours.forEach((crowdedness, index) => {
      if (crowdedness > maxCrowdedness) {
        maxCrowdedness = crowdedness;
        peakHour = index;
      }
    });

    return { hour: peakHour, crowdedness: maxCrowdedness };
  }

  onTabChange(index: number) {
    this.updateChartData(this.data[index]);
  }

  private updateChartData(dayData: BusyTime) {
    this.lineChartData.datasets[0].data = [...dayData.hours];
    this.lineChartData = { ...this.lineChartData }; // Trigger change detection
  }

  protected readonly dayLabels = dayLabels;
}
