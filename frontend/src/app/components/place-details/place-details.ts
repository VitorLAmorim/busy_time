import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../models/place.model';
import { BusyTimeChartComponent } from '../busy-time-chart/busy-time-chart';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [CommonModule, BusyTimeChartComponent],
  templateUrl: './place-details.html',
  styleUrl: './place-details.scss'
})
export class PlaceDetailsComponent {
  @Input() place: Place | null = null;

  getPlaceTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
