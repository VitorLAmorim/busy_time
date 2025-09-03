import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FilterPanelComponent } from './filter-panel';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;

  const initialFilters = {
    search: '',
    type: [],
    minRating: 0,
    minReviews: 0,
    priceLevel: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FilterPanelComponent,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        MatCheckboxModule,
        MatIconModule,
        MatFormFieldModule,
        NoopAnimationsModule
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    component.filters = { ...initialFilters };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default filters', () => {
    expect(component.filters).toEqual(initialFilters);
  });

  it('should emit filters when search input changes', fakeAsync(() => {
    spyOn(component, 'updateFilter');
    const testValue = 'test search';

    component.searchFromControl.setValue(testValue);
    tick(350); // Wait for debounceTime

    expect(component.updateFilter).toHaveBeenCalledWith('search', testValue);
  }));

  it('should toggle price level on/off when same value is selected', () => {
    spyOn(component, 'updateFilter').and.callFake((key, value) => {
      component.filters = { ...component.filters, [key]: value };
    });

    const testValue = 2;

    component.onPriceLevelChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('priceLevel', testValue);
    expect(component.filters.priceLevel).toBe(testValue);

    (component.updateFilter as jasmine.Spy).calls.reset();

    component.onPriceLevelChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('priceLevel', 0);
    expect(component.filters.priceLevel).toBe(0);
  });

  it('should toggle min rating on/off when same value is selected', () => {
    spyOn(component, 'updateFilter').and.callFake((key, value) => {
      component.filters = { ...component.filters, [key]: value };
    });

    const testValue = 4;

    component.onMinRatingChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('minRating', testValue);
    expect(component.filters.minRating).toBe(testValue);

    (component.updateFilter as jasmine.Spy).calls.reset();

    component.onMinRatingChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('minRating', 0);
    expect(component.filters.minRating).toBe(0);
  });

  it('should toggle min reviews on/off when same value is selected', () => {
    spyOn(component, 'updateFilter').and.callFake((key, value) => {
      component.filters = { ...component.filters, [key]: value };
    });

    const testValue = 1000;

    component.onMinReviewsChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('minReviews', testValue);
    expect(component.filters.minReviews).toBe(testValue);

    (component.updateFilter as jasmine.Spy).calls.reset();

    component.onMinReviewsChange(testValue);
    expect(component.updateFilter).toHaveBeenCalledWith('minReviews', 0);
    expect(component.filters.minReviews).toBe(0);
  });

  it('should update filters and emit changes', () => {
    spyOn(component.filtersChange, 'emit');
    const testFilters = {
      search: 'test',
      type: ['BAR'],
      minRating: 4,
      minReviews: 100,
      priceLevel: 2
    };

    component.filters = { ...testFilters };
    component.updateFilter('search', 'new search');

    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      ...testFilters,
      search: 'new search'
    });
  });

  it('should have place type options from the model', () => {
    expect(component.placeTypeOptions.length).toBeGreaterThan(0);
  });
});
