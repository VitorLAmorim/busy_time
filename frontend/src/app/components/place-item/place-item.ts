import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../models/place.model';

@Component({
  selector: 'app-place-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-item.html',
  styleUrl: './place-item.scss'
})
export class PlaceItemComponent {
  @Input() place!: Place;
  @Input() selected = false;
  @Output() selectPlace = new EventEmitter<Place>();

  onSelect(): void {
    this.selectPlace.emit(this.place);
  }

  getPlaceTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
