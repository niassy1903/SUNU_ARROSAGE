import { TestBed } from '@angular/core/testing';

import { ScheduleMonitorService } from './schedule-monitor.service';

describe('ScheduleMonitorService', () => {
  let service: ScheduleMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
