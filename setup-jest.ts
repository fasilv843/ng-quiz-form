import 'jest-preset-angular/setup-env/zone';

import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Initialize Angular's testing environment for Jest
TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);