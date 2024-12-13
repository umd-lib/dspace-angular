import { Component, OnInit } from '@angular/core';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { UmdEnvironmentBannerComponent } from '../umd-environment-banner/umd-environment-banner.component';
import { UmdHeaderComponent } from '../umd-header/umd-header.component';
import { JsonLdWebsiteComponent } from '../item-page/json-ld/json-ld-website.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from 'src/themes/dspace/app/navbar/navbar.component';
import { ThemedSearchNavbarComponent } from 'src/app/search-navbar/themed-search-navbar.component';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';
import { ContextHelpToggleComponent } from 'src/app/header/context-help-toggle/context-help-toggle.component';
import { ImpersonateNavbarComponent } from 'src/app/shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedAuthNavMenuComponent } from 'src/app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { RouterLink } from '@angular/router';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  imports: [
    AsyncPipe, ContextHelpToggleComponent, ImpersonateNavbarComponent,
    JsonLdWebsiteComponent, NavbarComponent, NgIf, RouterLink,
    UmdEnvironmentBannerComponent, UmdHeaderComponent,
    ThemedAuthNavMenuComponent, ThemedLangSwitchComponent,
    ThemedSearchNavbarComponent, TranslateModule
  ],
  standalone: true,
})
export class HeaderComponent extends BaseComponent implements OnInit {
  public isNavBarCollapsed$: Observable<boolean>;

  ngOnInit() {
    super.ngOnInit();
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
  }
}
