import { TestBed } from '@angular/core/testing';
import { PlacesListComponent } from './places-list';
import { Place } from '../../models/place.model';
import {provideZonelessChangeDetection} from '@angular/core';

describe('PlacesListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlacesListComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlacesListComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should emit selectPlace', () => {
    const fixture = TestBed.createComponent(PlacesListComponent);
    const component = fixture.componentInstance;
    spyOn(component.selectPlace, 'emit');
    const place = { placeId: '1', name: 'Test', address: '', rating: 0, priceLevel: 0, type: 'BAR', reviews: 0 } as Place;
    component.onSelectPlace(place);
    expect(component.selectPlace.emit).toHaveBeenCalledWith(place);
  });

  it('should check if place is selected', () => {
    const fixture = TestBed.createComponent(PlacesListComponent);
    const component = fixture.componentInstance;
    const place = { placeId: '1', name: 'Test', address: '', rating: 0, priceLevel: 0, type: 'BAR', reviews: 0 } as Place;
    component.selectedPlace = place;
    expect(component.isSelected(place)).toBeTrue();
  });

  it('should have places input', () => {
    const fixture = TestBed.createComponent(PlacesListComponent);
    const component = fixture.componentInstance;
    const places = [
      { placeId: '1', name: 'Test', address: '', rating: 0, priceLevel: 0, type: 'BAR', reviews: 0 } as Place
    ];
    component.places = places;
    expect(component.places).toEqual(places);
  });
});

