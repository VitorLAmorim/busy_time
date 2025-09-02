import {Component, effect, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Place } from './models/place.model';
import {FilterPanelComponent, FilterState} from './components/filter-panel/filter-panel';
import { PlacesListComponent } from './components/places-list/places-list';
import { PlaceDetailsComponent } from './components/place-details/place-details';
import { BusyTimeChartComponent } from './components/busy-time-chart/busy-time-chart';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {PaginatedResponse, PlaceService, ValidateApiKeyReponse} from './services/place.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FilterPanelComponent,
    PlacesListComponent,
    PlaceDetailsComponent,
    BusyTimeChartComponent,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  private placeService = inject(PlaceService);
  selectedPlace = signal<Place | null>(null);
  filters = signal<FilterState>({
    search: '',
    type: [''],
    minRating: 0,
    minReviews: 0,
    priceLevel: 0
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  currentPage = signal(1);
  itemsPerPage = 10;

  totalItems = signal(0);
  totalPages = 0;

  places = signal<Place[]>([]);


  private queryFields = ['placeId, name, address, rating, priceLevel, type, reviews, lastSearchDay, lastSearchDayCloseTime, lastSearchDayOpenTime'];
  private sortBy = 'name';
  private sortOrder = 'asc';

  private buildQuery(resetPage = false) {
    return {
      page: resetPage ? 1 : this.currentPage(),
      limit: this.itemsPerPage,
      filters: this.filters(),
      queryFields: this.queryFields,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
  }

  constructor() {
    this.loadPlaces(this.buildQuery());

    effect(() => {
      const currentPage = this.currentPage();

      const timer = setTimeout(() => {
        this.loadPlaces(this.buildQuery(), currentPage > 1);
      }, 100);

      return () => clearTimeout(timer);
    });

    effect(() => {
      const filters = this.filters();

      const timer = setTimeout(() => {
        this.loadPlaces(this.buildQuery(true));
      }, 100);

      return () => clearTimeout(timer);

    })
  }

  loadPlaces(query: any, append: boolean = false): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.placeService.getPlaces(query).subscribe({
      next: (response: PaginatedResponse<Place>) => {
        if (append) {
          this.places.update(places => [...places, ...response.places]);
        } else {
          this.places.set(response.places);
        }
        this.totalItems.set(response.pagination.total);
        this.totalPages = response.pagination.pages;
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erro ao carregar locais. Tente novamente.');
        this.isLoading.set(false);
        console.error(error);
      }
    });
  }

  loadMorePlaces(): void {
    if (this.isLoading() || this.currentPage() >= this.totalPages) return;

   this.currentPage.update(page => page + 1);
  }

  updateData() {
    this.placeService.getApiKeyInfo().subscribe({
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

              this.placeService.updatePlacesFromApi(
                formValues.lat,
                formValues.lng,
                formValues.types,
                formValues.limit,
                formValues.mockData
              ).subscribe({
                next: () => {
                  this.loadPlaces(this.buildQuery());
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

  onFiltersChange(newFilters: FilterState): void {
    this.filters.set(newFilters);
  }

  onPlaceSelect(place: Place): void {
      this.placeService.getPlace(place.placeId).subscribe({
        next: place => {
          this.selectedPlace.set(place);
        },
        error: (error) => {
          console.error(error);
        }

      })
  }
}
