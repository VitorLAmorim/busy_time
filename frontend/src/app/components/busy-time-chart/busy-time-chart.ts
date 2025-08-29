import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyTime } from '../../models/place.model';

@Component({
  selector: 'app-busy-time-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './busy-time-chart.html',
  styleUrl: './busy-time-chart.scss'
})
export class BusyTimeChartComponent implements OnChanges {
  @Input() busyTimes: BusyTime[] = [];

  daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  chartData: { day: string, hours: { hour: number, busyLevel: number }[] }[] = [];


  getColorForBusyLevel(level: number): string {
    if (level < 30) return '#4CAF50'; // Green - not busy
    if (level < 60) return '#FFC107'; // Yellow - moderately busy
    if (level < 80) return '#FF9800'; // Orange - busy
    return '#F44336'; // Red - very busy
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['busyTimes']) {
      this.processChartData();
    }
  }

  private processChartData(): void {
    this.chartData = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const busyTimeLevels = this.busyTimes.find(time => time.day === dayIndex)?.hours;
      let hours: { hour: number, busyLevel: number }[] = [];
      if(busyTimeLevels) {
        busyTimeLevels.forEach((busyTimeLevel, index) => {
          hours.push({
            hour: index,
            busyLevel: busyTimeLevel
          })
        })
      }

      const dayData = {
        day: this.daysOfWeek[dayIndex],
        hours
      };

      this.chartData.push(dayData);
    }
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }
}
