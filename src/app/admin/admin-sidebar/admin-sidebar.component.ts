// UMD Customization
// Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
// This customization should be removed when upgrading to DSpace 8.0 or later
import { NgClass } from '@angular/common';
import { Inject } from'@angular/core';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
// End UMD Customization
import { Component, HostListener, Injector, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, withLatestFrom } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { slideSidebar } from '../../shared/animations/slide';
import { MenuComponent } from '../../shared/menu/menu.component';
import { MenuService } from '../../shared/menu/menu.service';
import { CSSVariableService } from '../../shared/sass-helper/css-variable.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { MenuID } from '../../shared/menu/menu-id.model';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../shared/theme-support/theme.service';

/**
 * Component representing the admin sidebar
 */
@Component({
  selector: 'ds-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  animations: [slideSidebar]
})
export class AdminSidebarComponent extends MenuComponent implements OnInit {
  /**
   * The menu ID of the Navbar is PUBLIC
   * @type {MenuID.ADMIN}
   */
  menuID = MenuID.ADMIN;

  /**
   * Observable that emits the width of the sidebar when expanded
   */
  @Input() expandedSidebarWidth$: Observable<string>;

  /**
   * Observable that emits the width of the sidebar when collapsed
   */
  @Input() collapsedSidebarWidth$: Observable<string>;

  /**
   * Is true when the sidebar is open, is false when the sidebar is animating or closed
   * @type {boolean}
   */
  sidebarOpen = true; // Open in UI, animation finished

  /**
   * Is true when the sidebar is closed, is false when the sidebar is animating or open
   * @type {boolean}
   */
  sidebarClosed = !this.sidebarOpen; // Closed in UI, animation finished

  /**
   * Is true when the sidebar is opening or closing
   * @type {boolean}
   */
  sidebarTransitioning = !this.sidebarOpen; // Animation in progress

  /**
   * Emits true when either the menu OR the menu's preview is expanded, else emits false
   */
  sidebarExpanded: Observable<boolean>;

  inFocus$: BehaviorSubject<boolean>;

  // UMD Customization
  // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
  // This customization should be removed when upgrading to DSpace 8.0 or later
  browserOsClasses = new BehaviorSubject<string[]>([]);
  // End UMD Customization

  constructor(
    protected menuService: MenuService,
    protected injector: Injector,
    private variableService: CSSVariableService,
    private authService: AuthService,
    public authorizationService: AuthorizationDataService,
    public route: ActivatedRoute,
    protected themeService: ThemeService,
    //  UMD Customization
    // Adaption of DSpace 8.0 fix from https://github.com/DSpace/dspace-angular/pull/2976
    // This customization should be removed when upgrading to DSpace 8.0 or later
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    // End UMD Customization
  ) {
    super(menuService, injector, authorizationService, route, themeService);
    this.inFocus$ = new BehaviorSubject(false);
  }

  /**
   * Set and calculate all initial values of the instance variables
   */
  ngOnInit(): void {
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

    this.authService.isAuthenticated()
      .subscribe((loggedIn: boolean) => {
        if (loggedIn) {
          this.menuService.showMenu(this.menuID);
        }
      });
    this.menuCollapsed.pipe(first())
      .subscribe((collapsed: boolean) => {
        this.sidebarOpen = !collapsed;
        this.sidebarClosed = collapsed;
      });
    this.sidebarExpanded = combineLatest([this.menuCollapsed, this.menuPreviewCollapsed])
      .pipe(
        map(([collapsed, previewCollapsed]) => (!collapsed || !previewCollapsed))
      );
    this.inFocus$.pipe(
      debounceTime(50),
      distinctUntilChanged(),  // disregard focusout in situations like --(focusout)-(focusin)--
      withLatestFrom(
        combineLatest([this.menuCollapsed, this.menuPreviewCollapsed])
      ),
    ).subscribe(([inFocus, [collapsed, previewCollapsed]]) => {
      if (collapsed) {
        if (inFocus && previewCollapsed) {
          this.expandPreview(new Event('focusin → expand'));
        } else if (!inFocus && !previewCollapsed) {
          this.collapsePreview(new Event('focusout → collapse'));
        }
      }
    });
    this.menuVisible = this.menuService.isMenuVisibleWithVisibleSections(this.menuID);
  }

  @HostListener('focusin')
  public handleFocusIn() {
    this.inFocus$.next(true);
  }

  @HostListener('focusout')
  public handleFocusOut() {
    this.inFocus$.next(false);
  }

  public handleMouseEnter(event: any) {
    if (!this.inFocus$.getValue()) {
      this.expandPreview(event);
    } else {
      event.preventDefault();
    }
  }

  public handleMouseLeave(event: any) {
    if (!this.inFocus$.getValue()) {
      this.collapsePreview(event);
    } else {
      event.preventDefault();
    }
  }

  /**
   * Method to change this.collapsed to false when the slide animation ends and is sliding open
   * @param event The animation event
   */
  startSlide(event: any): void {
    this.sidebarTransitioning = true;
    if (event.toState === 'expanded') {
      this.sidebarClosed = false;
    } else if (event.toState === 'collapsed') {
      this.sidebarOpen = false;
    }
  }

  /**
   * Method to change this.collapsed to false when the slide animation ends and is sliding open
   * @param event The animation event
   */
  finishSlide(event: any): void {
    this.sidebarTransitioning = false;
    if (event.fromState === 'expanded') {
      this.sidebarClosed = true;
    } else if (event.fromState === 'collapsed') {
      this.sidebarOpen = true;
    }
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
