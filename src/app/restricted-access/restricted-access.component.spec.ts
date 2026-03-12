import {
  DatePipe,
  Location,
} from '@angular/common';
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

import { AuthService } from '../core/auth/auth.service';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { HardRedirectService } from '../core/services/hard-redirect.service';
import { ServerResponseService } from '../core/services/server-response.service';
import { Bitstream } from '../core/shared/bitstream.model';
import { FileService } from '../core/shared/file.service';
import { createSuccessfulRemoteDataObject } from '../shared/remote-data.utils';
import { RestrictedAccessComponent } from './restricted-access.component';

describe('RestrictedAccessComponent', () => {
  let component: RestrictedAccessComponent;
  let fixture: ComponentFixture<RestrictedAccessComponent>;

  let authService: jasmine.SpyObj<AuthService>;
  let authorizationService: jasmine.SpyObj<AuthorizationDataService>;
  let fileService: jasmine.SpyObj<FileService>;
  let hardRedirectService: jasmine.SpyObj<HardRedirectService>;
  let serverResponseService: jasmine.SpyObj<ServerResponseService>;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;
  let activatedRoute;

  let bitstream: Bitstream;

  function initBitstream(overrides: Partial<Bitstream> = {}): Bitstream {
    return Object.assign(new Bitstream(), {
      uuid: 'test-bitstream-uuid',
      metadata: {
        'dc.title': [{ value: 'test-file.pdf', language: null, authority: null, confidence: -1, place: 0 }],
      },
      _links: {
        content: { href: 'bitstream-content-link' },
        self: { href: 'bitstream-self-link' },
      },
      // Default in tests to "FOREVER" embargo
      embargoRestriction: 'FOREVER',
      ...overrides,
    });
  }

  function init(bitstreamOverrides: Partial<Bitstream> = {}) {
    bitstream = initBitstream(bitstreamOverrides);

    authService = jasmine.createSpyObj('AuthService', {
      isAuthenticated: observableOf(false),
      setRedirectUrl: {},
    });

    authorizationService = jasmine.createSpyObj('AuthorizationDataService', {
      isAuthorized: observableOf(false),
    });

    fileService = jasmine.createSpyObj('FileService', {
      retrieveFileDownloadLink: observableOf('content-url-with-headers'),
    });

    hardRedirectService = jasmine.createSpyObj('HardRedirectService', {
      redirect: {},
    });

    serverResponseService = jasmine.createSpyObj('ServerResponseService', {
      setUnauthorized: {},
      setForbidden: {},
      setNotFound: {},
      setStatus: {},
    });

    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    // Provide a url property for redirectOn4xx
    (router as any).url = '/restricted-access/test-bitstream-uuid';

    location = jasmine.createSpyObj('Location', ['back']);

    activatedRoute = {
      data: observableOf({
        bitstream: createSuccessfulRemoteDataObject(bitstream),
      }),
    };
  }

  function initTestBed() {
    void TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RestrictedAccessComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: AuthService, useValue: authService },
        { provide: FileService, useValue: fileService },
        { provide: HardRedirectService, useValue: hardRedirectService },
        { provide: ServerResponseService, useValue: serverResponseService },
        { provide: Location, useValue: location },
        DatePipe,
      ],
    }).compileComponents();
  }

  // Helper function for setting up anonymous tests with a specific embargo
  // restriction
  function setupAnonymous(bitstreamOverrides: Partial<Bitstream>) {
    beforeEach(waitForAsync(() => {
      init(bitstreamOverrides);
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
      (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
      initTestBed();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(RestrictedAccessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }

  // Helper function verifying that a HTTP 401 Unauthorized status code is
  // set, and that a redirect to the bitstream is not performed.
  function verify401StatusCodeAndNoRedirectToDownload() {
    it('should set 401 Unauthorized and not redirect to the file', () => {
      expect(serverResponseService.setUnauthorized).toHaveBeenCalled();
      expect(serverResponseService.setForbidden).not.toHaveBeenCalled();
      expect(hardRedirectService.redirect).not.toHaveBeenCalled();
    });
  }

  describe('when the user is anonymous (not logged in)', () => {
    describe('when embargoRestriction is FOREVER', () => {
      setupAnonymous({ embargoRestriction: 'FOREVER' });

      verify401StatusCodeAndNoRedirectToDownload();

      it('should set the restrictedAccessMessage indicating the file is embargoed forever', waitForAsync(() => {
        expect(component.restrictedAccessMessage.value).toBe('bitstream.restricted-access.embargo.forever.message');
      }));
    });

    describe('when there is an embargo end date', () => {
      setupAnonymous({ embargoRestriction: '2199-04-08' });

      verify401StatusCodeAndNoRedirectToDownload();

      it('should set the restrictedAccessMessage indicating an end date', () => {
        expect(component.restrictedAccessMessage.value).toBe(
          'bitstream.restricted-access.embargo.restricted-until.message');
      });
    });

    describe('when embargoRestriction is NONE (embargo over, but file is restricted for another reason)', () => {
      setupAnonymous({ embargoRestriction: 'NONE' });

      verify401StatusCodeAndNoRedirectToDownload();

      it('should set the restrictedAccessMessage to a simple "forbidden" message', () => {
        expect(component.restrictedAccessMessage.value).toBe('bitstream.restricted-access.anonymous.forbidden.message');
      });
    });

    describe('when file is restricted for non-embargo reasons (such as Campus IP restriction)', () => {
      setupAnonymous({ embargoRestriction:null });

      verify401StatusCodeAndNoRedirectToDownload();

      it('should set the restrictedAccessMessage to a simple "forbidden" message', () => {
        expect(component.restrictedAccessMessage.value).toBe('bitstream.restricted-access.anonymous.forbidden.message');
      });
    });

    describe('but the user is authorized (even if there is an embargo)', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(false));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(true));
        initTestBed();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(RestrictedAccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should redirect to the content link', () => {
        expect(hardRedirectService.redirect).toHaveBeenCalled();
      });

      it('should NOT call setUnauthorized', () => {
        expect(serverResponseService.setUnauthorized).not.toHaveBeenCalled();
      });

      it('should NOT call setForbidden', () => {
        expect(serverResponseService.setForbidden).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the user is logged in', () => {
    describe('returns 403 Forbidden when the user is not authorized to access the file', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(true));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestBed();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(RestrictedAccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should call setForbidden on ServerResponseService', () => {
        expect(serverResponseService.setForbidden).toHaveBeenCalled();
      });

      it('should NOT call setUnauthorized on ServerResponseService', () => {
        expect(serverResponseService.setUnauthorized).not.toHaveBeenCalled();
      });

      it('should NOT redirect to a download', () => {
        expect(hardRedirectService.redirect).not.toHaveBeenCalled();
      });

      it('should set the restrictedAccessHeader', () => {
        expect(component.restrictedAccessHeader.value).toBe('bitstream.restricted-access.user.forbidden.header');
      });

      it('should set the restrictedAccessMessage', () => {
        expect(component.restrictedAccessMessage.value).toBe(
          'bitstream.restricted-access.user.forbidden.with_file.message');
      });
    });

    describe('returns 403 Forbidden with a generic message when no filename is not provided', () => {
      beforeEach(waitForAsync(() => {
        init({ metadata: {} });
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(true));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
        initTestBed();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(RestrictedAccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should set the generic forbidden message', waitForAsync(() => {
        expect(component.restrictedAccessMessage.value).toBe(
          'bitstream.restricted-access.user.forbidden.generic.message');
      }));
    });

    describe('allows access to the file when the user is authorized', () => {
      beforeEach(waitForAsync(() => {
        init();
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(observableOf(true));
        (authorizationService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(true));
        initTestBed();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(RestrictedAccessComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('should NOT call setUnauthorized', () => {
        expect(serverResponseService.setUnauthorized).not.toHaveBeenCalled();
      });

      it('should NOT call setForbidden', () => {
        expect(serverResponseService.setForbidden).not.toHaveBeenCalled();
      });

      it('should redirect to the file download link', () => {
        expect(hardRedirectService.redirect).toHaveBeenCalledWith('content-url-with-headers');
      });
    });
  });

  describe('back()', () => {
    beforeEach(waitForAsync(() => {
      init();
      initTestBed();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(RestrictedAccessComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should call location.back()', () => {
      component.back();
      expect(location.back).toHaveBeenCalled();
    });
  });
});
