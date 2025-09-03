import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusyTimeChartComponent } from './busy-time-chart';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BusyTimeChartComponent', () => {
  let component: BusyTimeChartComponent;
  let fixture: ComponentFixture<BusyTimeChartComponent>;

  const mockBusyTimes = [
    {
      day: 1,
      hours: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5, 0, 0, 0, 0]
    },
    {
      day: 2,
      hours: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5, 0, 0, 0]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BusyTimeChartComponent,
        MatCardModule,
        MatTabsModule,
        MatIconModule,
        BaseChartDirective,
        NoopAnimationsModule
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusyTimeChartComponent);
    component = fixture.componentInstance;
    component.data = mockBusyTimes;
    component.placeName = 'Test Place';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize chart data', () => {
    expect(component.lineChartData).toBeDefined();
    expect(component.lineChartData.datasets.length).toBe(1);
    expect(component.lineChartData.labels?.length).toBe(24);
  });

  it('should format hour correctly', () => {
    expect(component.formatHour(0)).toBe('12 AM');
    expect(component.formatHour(12)).toBe('12 PM');
    expect(component.formatHour(5)).toBe('5 AM');
    expect(component.formatHour(15)).toBe('3 PM');
  });

  it('should get correct busyness level', () => {
    expect(component.getBusynessLevel(10)).toEqual({ label: 'Low', color: '#22c55e' });
    expect(component.getBusynessLevel(30)).toEqual({ label: 'Moderate', color: '#eab308' });
    expect(component.getBusynessLevel(60)).toEqual({ label: 'High', color: '#f97316' });
    expect(component.getBusynessLevel(90)).toEqual({ label: 'Very High', color: '#dc2626' });
  });

  it('should calculate average busyness correctly', () => {
    const dayData = { day: 1, hours: [10, 20, 30, 40, 50] };
    const avg = component.getAverageBusyness(dayData);
    expect(avg).toBe(30); // (10+20+30+40+50)/5 = 30
  });

  it('should find peak hour correctly', () => {
    const dayData = { day: 1, hours: [10, 20, 30, 40, 50, 40, 30, 20, 10] };
    const peak = component.getPeakHour(dayData);
    expect(peak).toEqual({ hour: 4, busyness: 50 });
  });

  it('should update chart data on tab change', () => {
    const updateChartSpy = spyOn(component as any, 'updateChartData');
    component.onTabChange(1);
    expect(updateChartSpy).toHaveBeenCalledWith(mockBusyTimes[1]);
  });

  it('should update chart data on input changes', () => {
    const newData = [
      { day: 3, hours: [0, 0, 0, 0, 10, 20, 30, 40, 50, 60, 50, 40, 30, 20, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    ];
    component.data = newData;
    component.ngOnChanges({
      data: {
        currentValue: newData,
        previousValue: mockBusyTimes,
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(component.lineChartData.datasets[0].data).toEqual(newData[0].hours);
  });
});
