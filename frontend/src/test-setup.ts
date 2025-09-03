// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// Import zone.js for testing
import 'zone.js';
import 'zone.js/testing';

// Import the necessary testing modules
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
const testBed = getTestBed();

testBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: false }
  }
);

// Configure test module with necessary providers
testBed.configureTestingModule({
  providers: []
});

// Add support for fakeAsync in tests
const { 
  flush, 
  flushMicrotasks, 
  tick, 
  fakeAsync, 
  discardPeriodicTasks 
} = (window as any).__zone_symbol__fakeAsyncTestMethods || {};

if (fakeAsync) {
  (window as any).__zone_symbol__fakeAsyncTestMethods = {
    flush,
    flushMicrotasks,
    tick,
    fakeAsync,
    discardPeriodicTasks
  };
}
