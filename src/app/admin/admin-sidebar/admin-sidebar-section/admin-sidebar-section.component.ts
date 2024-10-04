// UMD Customization
// Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
// This customization should be removed when upgrading to DSpace 8.0 or later
import { BehaviorSubject } from 'rxjs';
import { NativeWindowRef, NativeWindowService } from '../../../core/services/window.service';
// End UMD Customization
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MenuSectionComponent } from '../../../shared/menu/menu-section/menu-section.component';
import { MenuService } from '../../../shared/menu/menu.service';
import { rendersSectionForMenu } from '../../../shared/menu/menu-section.decorator';
import { LinkMenuItemModel } from '../../../shared/menu/menu-item/models/link.model';
import { MenuSection } from '../../../shared/menu/menu-section.model';
import { MenuID } from '../../../shared/menu/menu-id.model';
import { isEmpty } from '../../../shared/empty.util';
import { Router } from '@angular/router';

/**
 * Represents a non-expandable section in the admin sidebar
 */
@Component({
  selector: 'ds-admin-sidebar-section',
  templateUrl: './admin-sidebar-section.component.html',
  styleUrls: ['./admin-sidebar-section.component.scss'],

})
@rendersSectionForMenu(MenuID.ADMIN, false)
export class AdminSidebarSectionComponent extends MenuSectionComponent implements OnInit {

  /**
   * This section resides in the Admin Sidebar
   */
  menuID: MenuID = MenuID.ADMIN;
  itemModel;

  /**
   * Boolean to indicate whether this section is disabled
   */
  isDisabled: boolean;

  // UMD Customization
  // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
  // This customization should be removed when upgrading to DSpace 8.0 or later
  browserOsClasses = new BehaviorSubject<string[]>([]);
  // End UMD Customization

  constructor(
    @Inject('sectionDataProvider') menuSection: MenuSection,
    protected menuService: MenuService,
    protected injector: Injector,
    protected router: Router,
    //  UMD Customization
    // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
    // This customization should be removed when upgrading to DSpace 8.0 or later
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    // End UMD Customization
  ) {
    super(menuSection, menuService, injector);
    this.itemModel = menuSection.model as LinkMenuItemModel;
  }

  ngOnInit(): void {
    this.isDisabled = this.itemModel?.disabled || isEmpty(this.itemModel?.link);
    super.ngOnInit();
    //  UMD Customization
    // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
    // This customization should be removed when upgrading to DSpace 8.0 or later
    const browserName = this.getBrowserName();
    if (browserName) {
      const browserOsClasses = new Array<string>();
      browserOsClasses.push(`browser-${browserName}`);
      const osName = this.getOSName();
      if (osName) {
        browserOsClasses.push(`browser-${browserName}-${osName}`);
      }
      this.browserOsClasses.next(browserOsClasses);
    }
    // End UMD Customization
  }

  navigate(event: any): void {
    event.preventDefault();
    if (!this.isDisabled) {
      this.router.navigate(this.itemModel.link);
    }
  }

  adminMenuSectionId(sectionId: string) {
    return `admin-menu-section-${sectionId}`;
  }

  adminMenuSectionTitleId(sectionId: string) {
    return `admin-menu-section-${sectionId}-title`;
  }

  //  UMD Customization
  // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
  // and https://github.com/DSpace/dspace-angular/pull/3004
  // This customization should be removed when upgrading to DSpace 8.0 or later
  getBrowserName(): string {
    const userAgent = this._window.nativeWindow.navigator?.userAgent;
    if (/Firefox/.test(userAgent)) {
      return 'firefox';
    }
    if (/Safari/.test(userAgent)) {
      return 'safari';
    }
    return undefined;
  }
  getOSName(): string {
    const userAgent = this._window.nativeWindow.navigator?.userAgent;
    if (/Windows/.test(userAgent)) {
      return 'windows';
    }
    return undefined;
  }
  // End UMD Customization
}
