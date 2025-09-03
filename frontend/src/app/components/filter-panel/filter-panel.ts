import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {placeTypeLabels} from '../../models/place.model';
import {debounceTime, distinctUntilChanged} from 'rxjs';


export interface FilterState {
  search: string;
  type: string[];
  minRating: number;
  minReviews: number;
  priceLevel: number;
}


@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss'
})
export class FilterPanelComponent implements OnInit {
  @Input() filters!: FilterState;
  @Output() filtersChange = new EventEmitter<FilterState>();
  searchFromControl = new FormControl('');

  placeTypeOptions = placeTypeLabels;

  ngOnInit() {
    this.searchFromControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe({
      next: (value) => this.updateFilter('search', value)
      }
    )
  }

  updateFilter(key: keyof FilterState, value: any): void {
    const updatedFilters = { ...this.filters, [key]: value };
    this.filtersChange.emit(updatedFilters);
  }


  onPriceLevelChange(value: any): void {
    if(this.filters.priceLevel === value) {
      this.filters.priceLevel = 0;
      value = 0;
    }
    this.updateFilter('priceLevel', value);
  }

  onMinRatingChange(value: number): void {
    if(this.filters.minRating === value) {
      this.filters.minRating = 0;
      value = 0;
    }
    this.updateFilter('minRating', value);
  }

  onMinReviewsChange(value: number): void {
    if(this.filters.minReviews === value) {
      this.filters.minReviews = 0;
      value = 0;
    }
    this.updateFilter('minReviews', value);
  }
}
