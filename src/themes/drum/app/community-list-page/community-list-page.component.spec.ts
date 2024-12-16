import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { getMockThemeService } from 'src/app/shared/mocks/theme-service.mock';
import { ThemeService } from 'src/app/shared/theme-support/theme.service';

import { TranslateLoaderMock } from '../../../../app/shared/mocks/translate-loader.mock';
import { ThemedCommunityListComponent } from './community-list/themed-community-list.component';
import { CommunityListPageComponent } from './community-list-page.component';
import { CommunityListService } from './community-list-service';

describe('CommunityListPageComponent', () => {
  let component: CommunityListPageComponent;
  let fixture: ComponentFixture<CommunityListPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        CommunityListPageComponent,
      ],
      providers: [
        CommunityListPageComponent,
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: CommunityListService, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(CommunityListPageComponent, {
      remove: {
        imports: [ThemedCommunityListComponent],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([CommunityListPageComponent], (comp: CommunityListPageComponent) => {
    expect(comp).toBeTruthy();
  }));

});
