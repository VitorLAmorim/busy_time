import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { PlaceService } from './services/place.service';
import { of, throwError } from 'rxjs';
import { Place } from './models/place.model';
import { FilterState } from './components/filter-panel/filter-panel';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let placeServiceSpy: jasmine.SpyObj<PlaceService>;

  const createMockPlace = (id: string, name: string, type: string = 'CAFE'): Place => ({
    placeId: id,
    name: name,
    address: '123 Test St',
    rating: 4.5,
    reviews: 100,
    type: type,
    location: { lat: 0, lng: 0 },
    busyTimes: [{
      day: 1,
      hours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0]
    }],
    lastSearchDay: 1,
    lastSearchDayOpenTime: 9,
    lastSearchDayCloseTime: 21,
    priceLevel: 2,
    updatedAt: new Date().toISOString()
  });

  const mockPlace = createMockPlace('123', 'Test Place');

  const mockPaginatedResponse = {
    places: [mockPlace],
    pagination: {
      total: 1,
      pages: 1,
      page: 1,
      limit: 10
    }
  };

  beforeEach(async () => {
    placeServiceSpy = jasmine.createSpyObj('PlaceService', [
      'getPlaces',
      'getPlace',
      'getApiKeyInfo',
      'updatePlacesFromApi'
    ]);

    placeServiceSpy.getPlaces.and.returnValue(of(mockPaginatedResponse));
    placeServiceSpy.getPlace.and.returnValue(of(mockPlace));
    placeServiceSpy.getApiKeyInfo.and.returnValue(of({
      active: true,
      api_key_private: 'asdhfahsdfjahlsdf',
      api_key_public: 'asdhfahsdfjahlsdf',
      credits_forecast: 1000,
      credits_query: 1000,
      status: 'ok',
      valid: true
    }));
    placeServiceSpy.updatePlacesFromApi.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [App, MatCardModule, MatIconModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PlaceService, useValue: placeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
    spyOn(Swal, 'close');

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedPlace()).toBeNull();
    expect(component.isLoading()).toBeFalse();
    expect(component.errorMessage()).toBeNull();
    expect(component.places()).toEqual([mockPlace]);
    expect(component.totalItems()).toBe(1);
  });

  it('should load places on init', () => {
    fixture.detectChanges();
    expect(placeServiceSpy.getPlaces).toHaveBeenCalled();
    expect(component.places().length).toBe(1);
    expect(component.totalItems()).toBe(1);
  });

  it('should handle error when loading places', (() => {
    const error = new Error('Failed to load places');
    placeServiceSpy.getPlaces.and.returnValue(throwError(() => error));

    spyOn(console, 'error');

    component.loadPlaces({
      page: 1,
      limit: 1,
      filters: {},
      queryFields: '',
      sortBy: '',
      sortOrder: ''
    });

    expect(component.errorMessage()).toBe('Erro ao carregar locais. Tente novamente.');
    expect(console.error).toHaveBeenCalledWith(error);
  }));

  it('should update filters and reload places', fakeAsync(() => {
    fixture.detectChanges();
    const newFilters: FilterState = {
      search: 'cafe',
      type: ['CAFE'],
      minRating: 4,
      minReviews: 50,
      priceLevel: 2
    };

    component.onFiltersChange(newFilters);
    tick(100);

    expect(component.filters()).toEqual(newFilters);
    expect(component.currentPage).toBe(1);
    expect(placeServiceSpy.getPlaces).toHaveBeenCalledTimes(2);
  }));

  it('should load more places when scrolling', () => {
    placeServiceSpy.getPlaces.calls.reset();

    const nextPagePlace = createMockPlace('124', 'Another Test Place');
    const nextPageResponse = {
      places: [nextPagePlace],
      pagination: {
        total: 2,
        pages: 2,
        page: 2,
        limit: 10
      }
    };

    placeServiceSpy.getPlaces.and.returnValue(of(nextPageResponse));

    component.currentPage = 1;
    component.totalPages = 2;

    component.loadMorePlaces();

    expect(placeServiceSpy.getPlaces).toHaveBeenCalledWith(jasmine.objectContaining({
      page: 2,
      limit: 10
    }));

    expect(component.places().length).toBe(2);
    expect(component.places()[1].placeId).toBe('124');
  });

  it('should not load more places when already loading', () => {
    fixture.detectChanges();
    component.isLoading.set(true);

    component.loadMorePlaces();

    expect(placeServiceSpy.getPlaces).toHaveBeenCalledTimes(1);
  });

  it('should select a place and load its details', () => {
    fixture.detectChanges();

    component.onPlaceSelect(mockPlace);

    expect(placeServiceSpy.getPlace).toHaveBeenCalledWith('123');
    expect(component.selectedPlace()).toEqual(mockPlace);
  });
});
