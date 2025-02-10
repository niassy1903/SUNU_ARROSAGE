import { TestBed } from '@angular/core/testing';

import { SensorServiceTsService } from './sensor.service.ts.service';

describe('SensorServiceTsService', () => {
  let service: SensorServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensorServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
