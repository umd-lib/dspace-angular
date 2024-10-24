import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuService } from '../../../shared/menu/menu.service';
import { MenuServiceStub } from '../../../shared/testing/menu-service.stub';
import { CSSVariableService } from '../../../shared/sass-helper/css-variable.service';
import { CSSVariableServiceStub } from '../../../shared/testing/css-variable-service.stub';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminSidebarSectionComponent } from './admin-sidebar-section.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
// UMD Customization
// Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
// This customization should be removed when upgrading to DSpace 8.0 or later
import { NativeWindowService } from 'src/app/core/services/window.service';
import { NativeWindowMockFactory } from 'src/app/shared/mocks/mock-native-window-ref';
// End UMD Customization

describe('AdminSidebarSectionComponent', () => {
  let component: AdminSidebarSectionComponent;
  let fixture: ComponentFixture<AdminSidebarSectionComponent>;
  const menuService = new MenuServiceStub();
  const iconString = 'test';

  describe('when not disabled', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
        declarations: [AdminSidebarSectionComponent, TestComponent],
        providers: [
          {provide: 'sectionDataProvider', useValue: {model: {link: 'google.com'}, icon: iconString}},
          {provide: MenuService, useValue: menuService},
          {provide: CSSVariableService, useClass: CSSVariableServiceStub},
          // UMD Customization
          // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
          // This customization should be removed when upgrading to DSpace 8.0 or later
          { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
          // End UMD Customization
        ]
      }).overrideComponent(AdminSidebarSectionComponent, {
        set: {
          entryComponents: [TestComponent]
        }
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AdminSidebarSectionComponent);
      component = fixture.componentInstance;
      spyOn(component as any, 'getMenuItemComponent').and.returnValue(TestComponent);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the right icon', () => {
      const icon = fixture.debugElement.query(By.css('[data-test="sidebar-section-icon"]')).query(By.css('i.fas'));
      expect(icon.nativeElement.getAttribute('class')).toContain('fa-' + iconString);
    });
    it('should not contain the disabled class', () => {
      const disabled = fixture.debugElement.query(By.css('.disabled'));
      expect(disabled).toBeFalsy();
    });

  });
  describe('when disabled', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
        declarations: [AdminSidebarSectionComponent, TestComponent],
        providers: [
          {provide: 'sectionDataProvider', useValue: {model: {link: 'google.com', disabled: true}, icon: iconString}},
          {provide: MenuService, useValue: menuService},
          {provide: CSSVariableService, useClass: CSSVariableServiceStub},
          // UMD Customization
          // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
          // This customization should be removed when upgrading to DSpace 8.0 or later
          { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
          // End UMD Customization
        ]
      }).overrideComponent(AdminSidebarSectionComponent, {
        set: {
          entryComponents: [TestComponent]
        }
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(AdminSidebarSectionComponent);
      component = fixture.componentInstance;
      spyOn(component as any, 'getMenuItemComponent').and.returnValue(TestComponent);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the right icon', () => {
      const icon = fixture.debugElement.query(By.css('[data-test="sidebar-section-icon"]')).query(By.css('i.fas'));
      expect(icon.nativeElement.getAttribute('class')).toContain('fa-' + iconString);
    });
    it('should contain the disabled class', () => {
      const disabled = fixture.debugElement.query(By.css('.disabled'));
      expect(disabled).toBeTruthy();
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
