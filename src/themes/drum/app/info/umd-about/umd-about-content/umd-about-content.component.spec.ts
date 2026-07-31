import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRouteStub } from 'src/app/shared/testing/active-router.stub';

import { UmdAboutContentComponent } from './umd-about-content.component';

describe('UmdAboutContentComponent', () => {
  let component: UmdAboutContentComponent;
  let fixture: ComponentFixture<UmdAboutContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), UmdAboutContentComponent],
      providers: [{ provide: ActivatedRoute, useValue: new ActivatedRouteStub() }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UmdAboutContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
