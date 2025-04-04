// UMD Customization
/* eslint-disable import-newlines/enforce */
/* eslint-disable simple-import-sort/imports */
// End Customization
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

// UMD Customization
import { RESTRICTED_ACCESS_MODULE_PATH } from '../../app-routing-paths';
// End UMD Customization
import { AuthService } from '../../core/auth/auth.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { SignpostingDataService } from '../../core/data/signposting-data.service';
import { HardRedirectService } from '../../core/services/hard-redirect.service';
import { ServerResponseService } from '../../core/services/server-response.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { FileService } from '../../core/shared/file.service';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { BitstreamDownloadPageComponent } from './bitstream-download-page.component';

describe('BitstreamDownloadPageComponent', () => {
  let component: BitstreamDownloadPageComponent;
  let fixture: ComponentFixture<BitstreamDownloadPageComponent>;

  let authService: AuthService;
  let fileService: FileService;
  let authorizationService: AuthorizationDataService;
  let hardRedirectService: HardRedirectService;
  let activatedRoute;
  let router;

  let bitstream: Bitstream;
  let serverResponseService: jasmine.SpyObj<ServerResponseService>;
  let signpostingDataService: jasmine.SpyObj<SignpostingDataService>;

  const mocklink = {
    href: 'http://test.org',
    rel: 'test',
    type: 'test',
  };

  const mocklink2 = {
    href: 'http://test2.org',
    rel: 'test',
    type: 'test',
  };

  function init() {
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true),
      setRedirectUrl: {},
    });
    authorizationService = jasmine.createSpyObj('authorizationSerivice', {
      isAuthorized: observableOf(true),
    });

    fileService = jasmine.createSpyObj('fileService', {
      retrieveFileDownloadLink: observableOf('content-url-with-headers'),
    });

    hardRedirectService = jasmine.createSpyObj('fileService', {
      redirect: {},
    });
    bitstream = Object.assign(new Bitstream(), {
      uuid: 'bitstreamUuid',
      _links: {
        content: { href: 'bitstream-content-link' },
        self: { href: 'bitstream-self-link' },
      },
    });

    activatedRoute = {
      data: observableOf({
        bitstream: createSuccessfulRemoteDataObject(
          bitstream,
        ),
      }),
      params: observableOf({
        id: 'testid',
      }),
    };

    router = jasmine.createSpyObj('router', ['navigateByUrl']);

    serverResponseService = jasmine.createSpyObj('ServerResponseService', {
      setHeader: jasmine.createSpy('setHeader'),
    });

    signpostingDataService = jasmine.createSpyObj('SignpostingDataService', {
      getLinks: observableOf([mocklink, mocklink2]),
    });
  }

  function initTestbed() {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule.forRoot(), BitstreamDownloadPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: AuthService, useValue: authService },
        { provide: FileService, useValue: fileService },
        { provide: HardRedirectService, useValue: hardRedirectService },
        { provide: ServerResponseService, useValue: serverResponseService },
        { provide: SignpostingDataService, useValue: signpostingDataService },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    })
      .compileComponents();
  }

  describe('init', () => {
    beforeEach(waitForAsync(() => {
      init();
      initTestbed();
    }));
    beforeEach(() => {
      fixture = TestBed.createComponent(BitstreamDownloadPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
    it('should init the comp', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('bitstream retrieval', () => {
    describe('when the user is authorized and not logged in', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));

        initTestbed();
      }));
      beforeEach(() => {
        fixture = TestBed.createComponent(BitstreamDownloadPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
      it('should redirect to the content link', () => {
        expect(hardRedirectService.redirect).toHaveBeenCalledWith('bitstream-content-link');
      });
      it('should add the signposting links', () => {
        expect(serverResponseService.setHeader).toHaveBeenCalled();
      });
    });
    describe('when the user is authorized and logged in', () => {
      beforeEach(waitForAsync(() => {
        init();
        initTestbed();
      }));
      beforeEach(() => {
        fixture = TestBed.createComponent(BitstreamDownloadPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
      it('should redirect to an updated content link', () => {
        expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-headers');
      });
    });
    describe('when the user is not authorized and logged in', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
      }));
      beforeEach(() => {
        fixture = TestBed.createComponent(BitstreamDownloadPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
      // UMD Customization
      it('should navigate to the restricted access route', () => {
        expect(router.navigateByUrl).toHaveBeenCalledWith(
          `${RESTRICTED_ACCESS_MODULE_PATH}/bitstreamUuid`, { replaceUrl: true },
        );
      });
      // End UMD Customization
    });
    describe('when the user is not authorized and not logged in', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestbed();
      }));
      beforeEach(() => {
        fixture = TestBed.createComponent(BitstreamDownloadPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
      // UMD Customization
      it('should navigate to the restricted access route', () => {
        expect(router.navigateByUrl).toHaveBeenCalledWith(
          `${RESTRICTED_ACCESS_MODULE_PATH}/bitstreamUuid`, { replaceUrl: true },
        );
      });
      // End UMD Customization
    });
  });
});
