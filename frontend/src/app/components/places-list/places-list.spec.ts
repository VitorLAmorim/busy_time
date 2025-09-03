import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlacesListComponent } from './places-list';
import { Place } from '../../models/place.model';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PriceLevelLabelPipe } from '../pipes/priceLevelLabelPipe';

describe('PlacesListComponent', () => {
  let component: PlacesListComponent;
  let fixture: ComponentFixture<PlacesListComponent>;

  const mockPlace: Place = {
    placeId: '1',
    name: 'Test Place',
    address: '123 Test St',
    rating: 4.5,
    reviews: 100,
    priceLevel: 2,
    type: 'BAR',
    location: { lat: 0, lng: 0 },
    busyTimes: [],
    updatedAt: new Date().toISOString(),
    lastSearchDay: 1,
    lastSearchDayOpenTime: 10,
    lastSearchDayCloseTime: 22
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlacesListComponent,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        PriceLevelLabelPipe
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit placeSelect when a place is clicked', () => {
    spyOn(component.placeSelect, 'emit');
    component.onPlaceClick(mockPlace);
    expect(component.placeSelect.emit).toHaveBeenCalledWith(mockPlace);
  });

  it('should check if place is selected', () => {
    component.selectedPlace = mockPlace;
    expect(component.isSelected(mockPlace)).toBeTrue();

    const otherPlace = { ...mockPlace, placeId: '2' };
    expect(component.isSelected(otherPlace)).toBeFalse();
  });

  it('should track items by placeId', () => {
    const trackByResult = component.trackByPlaceId(0, mockPlace);
    expect(trackByResult).toBe('1');
  });

  it('should generate correct star array', () => {
    const stars = component.getStarArray(4.5);
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'half']);

    const stars2 = component.getStarArray(3);
    expect(stars2).toEqual(['full', 'full', 'full', 'empty', 'empty']);

    const stars3 = component.getStarArray(0);
    expect(stars3).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('should emit loadMore when scrolled to bottom', () => {
    spyOn(component.loadMore, 'emit');

    const mockEventTarget = {
      scrollHeight: 1000,
      scrollTop: 900,
      clientHeight: 100
    };

    const mockEvent = {
      target: mockEventTarget,
      preventDefault: jasmine.createSpy('preventDefault')
    };

    component['onScroll'](mockEvent as unknown as Event);

    expect(component.loadMore.emit).toHaveBeenCalled();
  });

  it('should not emit loadMore when loading', () => {
    spyOn(component.loadMore, 'emit');
    component.isLoading = true;

    const mockEventTarget = {
      scrollHeight: 1000,
      scrollTop: 900,
      clientHeight: 100
    };

    const mockEvent = {
      target: mockEventTarget,
      preventDefault: jasmine.createSpy('preventDefault')
    };

    component['onScroll'](mockEvent as unknown as Event);

    expect(component.loadMore.emit).not.toHaveBeenCalled();
  });
});

