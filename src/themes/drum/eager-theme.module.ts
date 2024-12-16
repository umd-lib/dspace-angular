import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CommunityGroup } from '../../app/core/shared/community-group.model';
import { BitstreamDownloadCounterComponent } from './app/bitstream-download-counter/bitstream-download-counter.component';
import { CommunityListComponent } from './app/community-list-page/community-list/community-list.component';
import { CommunityListPageComponent } from './app/community-list-page/community-list-page.component';
import { FooterComponent } from './app/footer/footer.component';
import { HeaderComponent } from './app/header/header.component';
import { HomeNewsComponent } from './app/home-page/home-news/home-news.component';
import { HomePageComponent } from './app/home-page/home-page.component';
import { FeedbackComponent } from './app/info/feedback/feedback.component';
import { FeedbackFormComponent } from './app/info/feedback/feedback-form/feedback-form.component';
import { JsonLdWebsiteComponent } from './app/item-page/json-ld/json-ld-website.component';
import { FileSectionComponent } from './app/item-page/simple/field-components/file-section/file-section.component';
import { UntypedItemComponent } from './app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { UmdEnvironmentBannerComponent } from './app/umd-environment-banner/umd-environment-banner.component';
import { UmdHeaderComponent } from './app/umd-header/umd-header.component';

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
  FeedbackComponent,
  FeedbackFormComponent,
  FileSectionComponent,
  FooterComponent,
  HeaderComponent,
  UmdEnvironmentBannerComponent,
  UmdHeaderComponent,
  CommunityListPageComponent,
  CommunityListComponent,
  HomePageComponent,
  HomeNewsComponent,
  JsonLdWebsiteComponent,
];

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ...DECLARATIONS,
  ],
  providers: [
    ...ENTRY_COMPONENTS.map((component) => ({ provide: component })),
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
