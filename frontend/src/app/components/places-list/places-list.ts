import {Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from '../../models/place.model';
import { PlaceItemComponent } from '../place-item/place-item';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [CommonModule, PlaceItemComponent],
  templateUrl: './places-list.html',
  styleUrl: './places-list.scss'
})
export class PlacesListComponent {
  @Input() places: Place[] = [];
  @Input() selectedPlace: Place | null = null;
  @Input() totalItems = 0;
  @Output() selectPlace = new EventEmitter<Place>();

  onSelectPlace(place: Place): void {
    this.selectPlace.emit(place);
  }

  isSelected(place: Place): boolean {
    return this.selectedPlace?.placeId === place.placeId;
  }
}
