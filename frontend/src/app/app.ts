import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import {FilterBarComponent, Filters} from './components/filter-bar/filter-bar';
import { PlacesListComponent } from './components/places-list/places-list';
import { PlaceDetailsComponent } from './components/place-details/place-details';
import {Place} from './models/place.model';
import {PaginatedResponse, PlaceService} from './services/place.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule,
    FilterBarComponent,
    PlacesListComponent,
    PlaceDetailsComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('Busy Places in Warsaw');
  private placesService = inject(PlaceService);

  places: Place[] = [];
  filteredPlaces =  signal<Place[]>([]);
  selectedPlace = signal<Place | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  currentFilters: Filters = {
    type: [],
    name: '',
    address: '',
    minRating: 0,
    minReviews: 0,
    priceLevel: 0
  };

  constructor() {}

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.isLoading.set(true);
    const queryFields = ['placeId, name, address, rating, priceLevel, type, reviews'];

    this.placesService.getPlaces({
        page: this.currentPage,
        limit: this.itemsPerPage,
        filters: this.currentFilters,
        queryFields,
        sortBy: 'name',
        sortOrder: 'asc'
      }
    ).subscribe({
      next: (response: PaginatedResponse<Place>) => {
        this.places = response.places;
        this.filteredPlaces.set(response.places);
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.pages;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar locais. Tente novamente.';
        this.isLoading.set(false);
        console.error(error);
      }
    });
  }

  onFiltersChange(filters: Filters): void {
    this.currentFilters = filters;
    this.currentPage = 1;
    this.loadPlaces();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPlaces();
  }

  onItemsPerPageChange(limit: number): void {
    this.itemsPerPage = limit;
    this.currentPage = 1;
    this.loadPlaces();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  onSelectPlace(place: Place): void {
    this.placesService.getPlace(place.placeId).subscribe({
      next: place => {
        this.selectedPlace.set(place);
      },
      error: (error) => {
        console.error(error);
      }

    })
  }
}
