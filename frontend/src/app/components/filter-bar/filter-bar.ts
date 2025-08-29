import {Component, EventEmitter, Input, Output, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaceType } from '../../models/place.model';
import { MatIconModule } from '@angular/material/icon';

export interface Filters {
  type: string[];
  name: string;
  address: string;
  minRating: number;
  minReviews: number;
  priceLevel: number;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss'
})
export class FilterBarComponent implements OnInit {
  @Input() selectedTypes: string[] = [];
  @Output() filtersChange = new EventEmitter<Filters>();

  showFilters = signal<boolean>(false);
  placeTypes = Object.values(PlaceType);

  filters: Filters = {
    type: [],
    name: '',
    address: '',
    minRating: 0,
    minReviews: 0,
    priceLevel: 0
  };

  ngOnInit(): void {
    this.filters.type = [...this.selectedTypes];
  }
  isSelected(type: PlaceType): boolean {
    return this.filters.type.includes(type);
  }

  toggleType(type: PlaceType): void {
    const currentIndex = this.filters.type.indexOf(type);

    if (currentIndex === -1) {
      this.filters.type.push(type);
    } else {
      this.filters.type.splice(currentIndex, 1);
    }
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  clearFilters(): void {
    this.filters = {
      type: [],
      name: '',
      address: '',
      minRating: 0,
      minReviews: 0,
      priceLevel: 0
    };
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    return this.filters.type.length > 0 ||
      this.filters.name !== '' ||
      this.filters.address !== '' ||
      this.filters.minRating !== 0 ||
      this.filters.minReviews !== 0 ||
      this.filters.priceLevel !== 0;
  }

  updateFilters(updates: Partial<Filters>): void {
    this.filters = { ...this.filters, ...updates };
  }

  onNumberChange(field: keyof Filters, value: string | number): void {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    this.updateFilters({ [field]: numValue });
  }

  getPriceLabel(level: string): string {
    const labels: { [key: string]: string } = {
      '0': 'Free',
      '1': '$',
      '2': '$$',
      '3': '$$$',
      '4': '$$$$'
    };
    return labels[level] || level;
  }

  emitFilters(): void {
    this.filtersChange.emit(this.filters);
  }

  getTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
