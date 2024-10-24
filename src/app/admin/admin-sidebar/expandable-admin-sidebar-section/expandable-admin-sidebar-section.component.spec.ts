import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpandableAdminSidebarSectionComponent } from './expandable-admin-sidebar-section.component';
import { MenuService } from '../../../shared/menu/menu.service';
import { MenuServiceStub } from '../../../shared/testing/menu-service.stub';
import { CSSVariableService } from '../../../shared/sass-helper/css-variable.service';
import { CSSVariableServiceStub } from '../../../shared/testing/css-variable-service.stub';
import { of as observableOf } from 'rxjs';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouterStub } from '../../../shared/testing/router.stub';
// UMD Customization
// Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
// This customization should be removed when upgrading to DSpace 8.0 or later
import { NativeWindowService } from 'src/app/core/services/window.service';
import { NativeWindowMockFactory } from 'src/app/shared/mocks/mock-native-window-ref';
// End UMD Customization

describe('ExpandableAdminSidebarSectionComponent', () => {
  let component: ExpandableAdminSidebarSectionComponent;
  let fixture: ComponentFixture<ExpandableAdminSidebarSectionComponent>;
  const menuService = new MenuServiceStub();
  const iconString = 'test';
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TranslateModule.forRoot()],
      declarations: [ExpandableAdminSidebarSectionComponent, TestComponent],
      providers: [
        { provide: 'sectionDataProvider', useValue: { icon: iconString, model: {} } },
        { provide: MenuService, useValue: menuService },
        { provide: CSSVariableService, useClass: CSSVariableServiceStub },
        { provide: Router, useValue: new RouterStub() },
        // UMD Customization
        // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
        // This customization should be removed when upgrading to DSpace 8.0 or later
        { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
        // End UMD Customization
      ]
    }).overrideComponent(ExpandableAdminSidebarSectionComponent, {
      set: {
        entryComponents: [TestComponent]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOn(menuService, 'getSubSectionsByParentID').and.returnValue(observableOf([]));
    fixture = TestBed.createComponent(ExpandableAdminSidebarSectionComponent);
    component = fixture.componentInstance;
    spyOn(component as any, 'getMenuItemComponent').and.returnValue(TestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the right icon', () => {
    const icon = fixture.debugElement.query(By.css('[data-test="sidebar-section-icon"] > i.fas'));
    expect(icon.nativeElement.getAttribute('class')).toContain('fa-' + iconString);
  });

  describe('when the header text is clicked', () => {
    beforeEach(() => {
      spyOn(menuService, 'toggleActiveSection');
      const sidebarToggler = fixture.debugElement.query(By.css('a.sidebar-section-wrapper'));
      sidebarToggler.triggerEventHandler('click', {
        preventDefault: () => {/**/
        }
      });
    });

    it('should call toggleActiveSection on the menuService', () => {
      expect(menuService.toggleActiveSection).toHaveBeenCalled();
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {
}
