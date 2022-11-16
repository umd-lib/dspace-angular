import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { EmbargoListExportCsvComponent } from './embargo-list-export-csv.component';
import { ScriptDataService } from 'src/app/core/data/processes/script-data.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { Script } from 'src/app/process-page/scripts/script.model';
import { Process } from 'src/app/process-page/processes/process.model';
import { createFailedRemoteDataObject$, createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { getProcessDetailRoute } from 'src/app/process-page/process-page-routing.paths';

describe('EmbargoListExportCsvComponent', () => {
  let component: EmbargoListExportCsvComponent;
  let fixture: ComponentFixture<EmbargoListExportCsvComponent>;

  let scriptDataService: ScriptDataService;
  let authorizationDataService: AuthorizationDataService;
  let notificationsService;
  let router;

  const script = Object.assign(new Script(), {id: 'embargo-list-export', name: 'embargo-list-export'});
  const process = Object.assign(new Process(), {processId: 5, scriptName: 'embargo-list-export'});

  function initBeforeEachAsync() {
    scriptDataService = jasmine.createSpyObj('scriptDataService', {
      findById: createSuccessfulRemoteDataObject$(script),
      invoke: createSuccessfulRemoteDataObject$(process)
    });
    authorizationDataService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true)
    });

    notificationsService = new NotificationsServiceStub();

    router = jasmine.createSpyObj('authorizationService', ['navigateByUrl']);
    TestBed.configureTestingModule({
      declarations: [EmbargoListExportCsvComponent],
      imports: [TranslateModule.forRoot(), NgbModule],
      providers: [
        {provide: ScriptDataService, useValue: scriptDataService},
        {provide: AuthorizationDataService, useValue: authorizationDataService},
        {provide: NotificationsService, useValue: notificationsService},
        {provide: Router, useValue: router},
      ]
    }).compileComponents();
  }

  function initBeforeEach() {
    fixture = TestBed.createComponent(EmbargoListExportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('init', () => {
    describe('comp', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should init the comp', () => {
        expect(component).toBeTruthy();
      });
    });
    describe('when the user is an admin and the embargo-list-export script is present ', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should add the button', () => {
        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeDefined();
      });
    });
    describe('when the user is not an admin', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
        (authorizationDataService.isAuthorized as jasmine.Spy).and.returnValue(observableOf(false));
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should not add the button', () => {
        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeNull();
      });
    });
    describe('when the embargo-list-export script is not present', () => {
      beforeEach(waitForAsync(() => {
        initBeforeEachAsync();
        (scriptDataService.findById as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Not found', 404));
      }));
      beforeEach(() => {
        initBeforeEach();
      });
      it('should should not add the button', () => {
        const debugElement = fixture.debugElement.query(By.css('button.export-button'));
        expect(debugElement).toBeNull();
      });
    });
  });
  describe('export', () => {
    beforeEach(waitForAsync(() => {
      initBeforeEachAsync();
    }));
    beforeEach(() => {
      initBeforeEach();
    });
    it('should call the invoke script method with the correct parameters', () => {
      component.export();
      expect(scriptDataService.invoke).toHaveBeenCalledWith('embargo-list-export', [], []);

    });
    it('should show a success message when the script was invoked successfully and redirect to the corresponding process page', () => {
      component.export();

      expect(notificationsService.success).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith(getProcessDetailRoute(process.processId));
    });
    it('should show an error message when the script was not invoked successfully and stay on the current page', () => {
      (scriptDataService.invoke as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Error', 500));

      component.export();

      expect(notificationsService.error).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });
  describe('clicking the button', () => {
    beforeEach(waitForAsync(() => {
      initBeforeEachAsync();
    }));
    beforeEach(() => {
      initBeforeEach();
    });
    it('should trigger the export function', () => {
      spyOn(component, 'export');

      const debugElement = fixture.debugElement.query(By.css('button.export-button'));
      debugElement.triggerEventHandler('click', null);

      expect(component.export).toHaveBeenCalled();
    });
  });
});
