import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Busy Places in Warsaw');
  });

  it('should call loadPlaces on ngOnInit', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOn(app, 'loadPlaces');
    app.ngOnInit();
    expect(app.loadPlaces).toHaveBeenCalled();
  });

  it('should call updateData and handle invalid API key', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    spyOn((app as any).placesService, 'getApiKeyInfo').and.returnValue({
      subscribe: () => ({ valid: false })
    } as any);
    spyOn(console, 'error');
    await app.updateData();
    expect(console.error).not.toHaveBeenCalled();
  });
});
