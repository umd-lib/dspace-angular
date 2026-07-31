import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivatedRouteStub } from 'src/app/shared/testing/active-router.stub';

import { UmdAboutContentComponent } from './umd-about-content.component';

describe('UmdAboutContentComponent', () => {
  let component: UmdAboutContentComponent;
  let fixture: ComponentFixture<UmdAboutContentComponent>;

  beforeEach(waitForAsync(() => {
    const activatedRouteStub = new ActivatedRouteStub();
    (activatedRouteStub as any).fragment = of(null);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), UmdAboutContentComponent],
      providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }],
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

  describe('when a fragment is present', () => {
    let mockElement: HTMLElement;

    beforeEach(waitForAsync(() => {
      TestBed.resetTestingModule();
      const activatedRouteStub = new ActivatedRouteStub();
      (activatedRouteStub as any).fragment = of('accessibility');

      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot(), UmdAboutContentComponent],
        providers: [{ provide: ActivatedRoute, useValue: activatedRouteStub }],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(UmdAboutContentComponent);
      mockElement = document.createElement('h4');
      mockElement.id = 'accessibility';
      spyOn(document, 'getElementById').and.returnValue(mockElement);
      spyOn(mockElement, 'scrollIntoView');
    });

    it('should scroll to the anchor', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick(100);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    }));
  });
});

