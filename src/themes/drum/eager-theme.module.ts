import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../app/shared/shared.module';
import { NavbarComponent } from './app/navbar/navbar.component';
import { HeaderComponent } from './app/header/header.component';
import { FooterComponent } from './app/footer/footer.component';
import { NavbarModule } from '../../app/navbar/navbar.module';
import { ItemPageModule } from '../../app/item-page/item-page.module';

import { UmdEnvironmentBannerComponent } from './app/umd-environment-banner/umd-environment-banner.component';
import { UntypedItemComponent } from './app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { UmdHeaderComponent } from './app/umd-header/umd-header.component';
import { FileSectionComponent } from './app/item-page/simple/field-components/file-section/file-section.component';
import { BitstreamDownloadCounterComponent } from './app/bitstream-download-counter/bitstream-download-counter.component';
import { CommunityGroup } from '../../app/core/shared/community-group.model';
import { HomePageComponent } from './app/home-page/home-page.component';
import { StatisticsModule } from 'src/app/statistics/statistics.module';
import { CommunityListPageModule } from 'src/app/community-list-page/community-list-page.module';
import { CommunityListComponent } from './app/community-list-page/community-list/community-list.component';
import { CommunityListPageComponent } from './app/community-list-page/community-list-page.component';
import { HomePageModule } from 'src/app/home-page/home-page.module';
import { JsonLdWebsiteComponent } from './app/item-page/json-ld/json-ld-website.component';

/**
 * Declaration needed to make sure all decorator functions are called in time
 */
export const models =
  [
    CommunityGroup,
  ];

/**
 * Add components that use a custom decorator to ENTRY_COMPONENTS as well as DECLARATIONS.
 * This will ensure that decorator gets picked up when the app loads
 */
const ENTRY_COMPONENTS = [
  UntypedItemComponent,
];

const DECLARATIONS = [
  ...ENTRY_COMPONENTS,
  BitstreamDownloadCounterComponent,
  FileSectionComponent,
  FooterComponent,
  HeaderComponent,
  NavbarComponent,
  UmdEnvironmentBannerComponent,
  UmdHeaderComponent,
  CommunityListPageComponent,
  CommunityListComponent,
  HomePageComponent,
  JsonLdWebsiteComponent,
];

@NgModule({
  imports: [
    CommonModule,
    NavbarModule,
    SharedModule,
    ItemPageModule,
    TranslateModule,
    StatisticsModule.forRoot(),
    CommunityListPageModule,
    HomePageModule,
  ],
  declarations: DECLARATIONS,
  providers: [
    ...ENTRY_COMPONENTS.map((component) => ({ provide: component }))
  ],
})
/**
 * This module is included in the main bundle that gets downloaded at first page load. So it should
 * contain only the themed components that have to be available immediately for the first page load,
 * and the minimal set of imports required to make them work. Anything you can cut from it will make
 * the initial page load faster, but may cause the page to flicker as components that were already
 * rendered server side need to be lazy-loaded again client side
 *
 * Themed EntryComponents should also be added here
 */
export class EagerThemeModule {
}
