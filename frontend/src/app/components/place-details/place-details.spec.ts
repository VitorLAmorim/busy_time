import {ComponentFixture, TestBed} from '@angular/core/testing';
import { PlaceDetailsComponent } from './place-details';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { provideZonelessChangeDetection } from '@angular/core';
import { PriceLevelLabelPipe } from '../pipes/priceLevelLabelPipe';

describe('PlaceDetailsComponent', () => {
  let component: PlaceDetailsComponent;
  let fixture: ComponentFixture<PlaceDetailsComponent>;

  const mockPlace = {
    placeId: '1',
    name: 'Test Place',
    address: '123 Test St',
    rating: 4.5,
    reviews: 100,
    priceLevel: 2,
    type: 'BAR',
    location: { lat: 40.7128, lng: -74.0060 },
    busyTimes: [],
    updatedAt: new Date().toISOString(),
    lastSearchDay: 1,
    lastSearchDayOpenTime: 10,
    lastSearchDayCloseTime: 22
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlaceDetailsComponent,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatDividerModule,
        PriceLevelLabelPipe
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceDetailsComponent);
    component = fixture.componentInstance;
    component.place = mockPlace;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display place details when place is provided', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card-title').textContent).toContain('Test Place');
    expect(compiled.querySelector('mat-chip').textContent).toContain('Bar');
    expect(compiled.querySelector('.text-yellow-400')).toBeTruthy();
  });

  it('should generate correct star array for rating', () => {
    const stars = component.getStarArray(4.5);
    expect(stars).toEqual(['full', 'full', 'full', 'full', 'half']);

    const stars2 = component.getStarArray(3);
    expect(stars2).toEqual(['full', 'full', 'full', 'empty', 'empty']);

    const stars3 = component.getStarArray(0);
    expect(stars3).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('should format location coordinates correctly', () => {
    const formattedLocation = component.formatLocation(40.7128, -74.0060);
    expect(formattedLocation).toBe('40.7128, -74.0060');
  });

  it('should display business hours when available', () => {
    const compiled = fixture.nativeElement;
    const searchDay = compiled.querySelector('#search-day');
    const openingHours = compiled.querySelector('#opening-hours');
    expect(compiled.textContent).toContain(searchDay.textContent);
    expect(compiled.textContent).toContain(openingHours.textContent);
  });

  it('should not break with missing optional fields', (() => {
    const minimalPlace = {
      placeId: '2',
      name: 'Minimal Place',
      address: '123 Test St',
      rating: 0,
      reviews: 0,
      type: 'CAFE',
      location: { lat: 0, lng: 0 },
      busyTimes: [],
      updatedAt: new Date().toISOString(),
    };

    fixture.componentRef.setInput('place', minimalPlace);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card-title').textContent).toContain('Minimal Place');
    const stars = compiled.querySelectorAll('.text-yellow-400, .text-gray-300');
    expect(stars.length).toBeGreaterThan(0);
  }));
});
