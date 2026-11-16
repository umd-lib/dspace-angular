import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  provideRouter,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { UmdRegisterInfoContentComponent } from './umd-register-info-content.component';

describe('UmdRegisterInfoContentComponent', () => {
  let component: UmdRegisterInfoContentComponent;
  let fixture: ComponentFixture<UmdRegisterInfoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UmdRegisterInfoContentComponent,
      ],
      providers: [
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UmdRegisterInfoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('includes an Angular password-reset link', () => {
    const linkElement = fixture.debugElement.query(
      By.directive(RouterLink),
    );

    expect(linkElement).not.toBeNull();

    const link = linkElement.injector.get(RouterLink);
    const router = TestBed.inject(Router);

    expect(link.urlTree).not.toBeNull();
    expect(router.serializeUrl(link.urlTree!)).toBe('/forgot');
  });
});

