import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivatedRouteStub } from 'src/app/shared/testing/active-router.stub';

import { UmdAboutComponent } from './umd-about.component';

describe('UmdAboutComponent', () => {
  let component: UmdAboutComponent;
  let fixture: ComponentFixture<UmdAboutComponent>;

  beforeEach(waitForAsync(() => {
    const activatedRouteStub = new ActivatedRouteStub();
    (activatedRouteStub as any).fragment = of(null);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), UmdAboutComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UmdAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
