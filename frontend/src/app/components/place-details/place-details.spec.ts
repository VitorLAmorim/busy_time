import { TestBed } from '@angular/core/testing';
import { PlaceDetailsComponent } from './place-details';
import {provideZonelessChangeDetection} from '@angular/core';

describe('PlaceDetailsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceDetailsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PlaceDetailsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should get place type label', () => {
    const fixture = TestBed.createComponent(PlaceDetailsComponent);
    const component = fixture.componentInstance;
    expect(component.getPlaceTypeLabel('bar')).toBe('Bar');
  });

  it('should return correct range', () => {
    const fixture = TestBed.createComponent(PlaceDetailsComponent);
    const component = fixture.componentInstance;
    expect(component.range(3)).toEqual([0, 1, 2]);
  });
});

