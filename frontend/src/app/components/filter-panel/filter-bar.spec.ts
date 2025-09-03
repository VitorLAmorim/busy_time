import { TestBed } from '@angular/core/testing';
import { FilterBarComponent } from './filter-panel';
import { PlaceType } from '../../models/place.model';
import {provideZonelessChangeDetection} from '@angular/core';

describe('FilterBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBarComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should toggle type selection', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    component.toggleType(PlaceType.BAR);
    expect(component.filters.type).toContain(PlaceType.BAR);
    component.toggleType(PlaceType.BAR);
    expect(component.filters.type).not.toContain(PlaceType.BAR);
  });

  it('should emit filters on clear', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    spyOn(component.filtersChange, 'emit');
    component.filters.type = [PlaceType.BAR];
    component.clearFilters();
    expect(component.filtersChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      type: [],
      name: '',
      address: '',
      minRating: 0,
      minReviews: 0,
      priceLevel: 0
    }));
  });

  it('should return correct price label', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    expect(component.getPriceLabel('2')).toBe('$$');
    expect(component.getPriceLabel('0')).toBe('Free');
  });

  it('should detect active filters', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    expect(component.hasActiveFilters()).toBeFalse();
    component.filters.name = 'Test';
    expect(component.hasActiveFilters()).toBeTrue();
  });

  it('should emit filters on emitFilters()', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    spyOn(component.filtersChange, 'emit');
    component.emitFilters();
    expect(component.filtersChange.emit).toHaveBeenCalled();
  });

  it('should get type label', () => {
    const fixture = TestBed.createComponent(FilterBarComponent);
    const component = fixture.componentInstance;
    expect(component.getTypeLabel('bar')).toBe('Bar');
  });
});

