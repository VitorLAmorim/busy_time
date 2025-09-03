import { Component, Input, Output, EventEmitter, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {dayLabels, formatPlaceType, Place} from '../../models/place.model';
import { PriceLevelLabelPipe } from '../pipes/priceLevelLabelPipe';
import {getStarArray} from '../util/utils';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PriceLevelLabelPipe
  ],
  templateUrl: './places-list.html',
  styleUrl: './places-list.scss'
})
export class PlacesListComponent implements AfterViewInit, OnDestroy {
  @Input() places: Place[] = [];
  @Input() selectedPlace: Place | null = null;
  @Input() isLoading = false;
  @Output() placeSelect = new EventEmitter<Place>();
  @Output() loadMore = new EventEmitter<void>();

  private scrollThreshold = 100;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    const element = this.elementRef.nativeElement.querySelector('.places-container');
    if (element) {
      element.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    const element = this.elementRef.nativeElement.querySelector('.places-container');
    if (element) {
      element.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  private onScroll(event: Event): void {
    if (this.isLoading) return;

    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + this.scrollThreshold;

    if (atBottom) {
      this.loadMore.emit();
    }
  }

  onPlaceClick(place: Place): void {
    this.placeSelect.emit(place);
  }

  isSelected(place: Place): boolean {
    return this.selectedPlace?.placeId === place.placeId;
  }

  trackByPlaceId(index: number, place: Place): string {
    return place.placeId;
  }

  protected readonly dayLabels = dayLabels;
  protected readonly formatPlaceType = formatPlaceType;
  public readonly getStarArray = getStarArray;
}
