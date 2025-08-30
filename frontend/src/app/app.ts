import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import {FilterBarComponent, Filters} from './components/filter-bar/filter-bar';
import { PlacesListComponent } from './components/places-list/places-list';
import { PlaceDetailsComponent } from './components/place-details/place-details';
import {Place} from './models/place.model';
import {PaginatedResponse, PlaceService, ValidateApiKeyReponse} from './services/place.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';

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

  updateData() {
    this.placesService.getApiKeyInfo().subscribe({
      next: async (response: ValidateApiKeyReponse) => {
        if (response.valid) {
          const { value: formValues } = await Swal.fire({
            title: 'Retrieve new data from API',
            html: `
                  <h3>There is ${response.credits_query} credits left.</h3>
                  <div class="form-group swal2-div">
                    <label for="lat">Latitude</label>
                    <input id="lat" class="swal2-input" placeholder="e.g., 52.230013" value="52.2300137946975">
                  </div>
                  <div class="form-group swal2-div">
                    <label for="lng">Longitude</label>
                    <input id="lng" class="swal2-input" placeholder="e.g., 21.011590" value="21.011590957893365">
                  </div>
                  <div class="form-group swal2-div">
                    <label for="types">Place Types (comma separated)</label>
                    <input id="types" class="swal2-input" placeholder="e.g., BAR,CLUBS,CAFE" value="BAR,CLUBS,CAFE">
                  </div>
                  <div class="form-group swal2-div">
                    <label for="limit">Max Results</label>
                    <input id="limit" type="number" class="swal2-input" placeholder="e.g., 10" value="10">
                  </div>
                  <div class="form-group swal2-div" style="text-align: left; margin-top: 10px;">
                    <label class="swal2-checkbox">
                      <input id="mockData" type="checkbox" checked>
                      <span>Use Mock Data</span>
                    </label>
                  </div>
                `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update Data',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            preConfirm: () => {
              return {
                lat: parseFloat((document.getElementById('lat') as HTMLInputElement).value),
                lng: parseFloat((document.getElementById('lng') as HTMLInputElement).value),
                types: (document.getElementById('types') as HTMLInputElement).value,
                limit: parseInt((document.getElementById('limit') as HTMLInputElement).value, 10),
                mockData: (document.getElementById('mockData') as HTMLInputElement).checked
              };
            }
          });

          if (formValues) {
            try {
              Swal.fire({
                title: 'Updating Data',
                text: 'Please wait while we fetch the latest data...',
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading();
                }
              });

              this.placesService.updatePlacesFromApi(
                formValues.lat,
                formValues.lng,
                formValues.types,
                formValues.limit,
                formValues.mockData
              ).subscribe({
                next: () => {
                  this.loadPlaces();
                  Swal.close();
                },
                error: (error) => {
                  Swal.close();
                  console.error('Error updating places:', error);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update places. Please try again later.',
                    confirmButtonText: 'OK'
                  });
                }
              });
            } catch (error) {
              console.error('Error:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An unexpected error occurred.',
                confirmButtonText: 'OK'
              });
            }
          }

        } else {
          Swal.fire({
            title: 'Invalid API Key',
            text: 'Please enter a valid API key',
            icon: 'error'
          })
        }




      },
      error: (error) => {
        console.error(error);
      }
    })
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

  get visiblePages(): (number)[] {
    const pages: (number)[] = [];

    if (this.totalPages <= 3) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage > 2) {
        pages.push(0);
      }

      if (this.currentPage > 1) {
        pages.push(this.currentPage - 1);
      }

      pages.push(this.currentPage);

      if (this.currentPage < this.totalPages) {
        pages.push(this.currentPage + 1);
      }

      if (this.currentPage < this.totalPages - 1) {
        pages.push(0);
      }
    }

    return pages;
  }
}
