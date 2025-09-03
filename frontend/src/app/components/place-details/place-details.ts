import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import {dayLabels, Place, formatPlaceType} from '../../models/place.model';
import { PriceLevelLabelPipe } from '../pipes/priceLevelLabelPipe'

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    PriceLevelLabelPipe
  ],
  templateUrl: './place-details.html',
  styleUrl: './place-details.scss'
})
export class PlaceDetailsComponent {
  @Input() place!: Place;

  getStarArray(rating: number): Array<'full' | 'half' | 'empty'> {
    const stars: Array<'full' | 'half' | 'empty'> = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  formatLocation(lat: number, lng: number): string {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  protected readonly dayLabels = dayLabels;
  protected readonly formatPlaceType = formatPlaceType;
}
