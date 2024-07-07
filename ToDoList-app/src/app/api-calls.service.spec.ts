import { TestBed } from '@angular/core/testing';

import { ApiCallsService } from './api-calls.service';

describe('ApiCallsService', () => {
  let service: ApiCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
