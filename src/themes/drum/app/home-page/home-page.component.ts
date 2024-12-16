import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HomeCoarComponent } from 'src/app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from 'src/app/home-page/home-news/themed-home-news.component';
import { RecentItemListComponent } from 'src/app/home-page/recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from 'src/app/home-page/top-level-community-list/themed-top-level-community-list.component';
import { SuggestionsPopupComponent } from 'src/app/notifications/suggestions-popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from 'src/app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from 'src/app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from 'src/app/shared/sidebar/page-with-sidebar.component';
import { ViewTrackerComponent } from 'src/app/statistics/angulartics/dspace/view-tracker.component';

import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { CommunityListComponent } from '../community-list-page/community-list/community-list.component';
import {
  FACULTY_COMMUNITY_GROUP,
  UM_COMMUNITY_GROUP,
} from '../community-list-page/community-list-page.component';


@Component({
  selector: 'ds-themed-home-page',
  // styleUrls: ['./home-page.component.scss'],
  styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html',
  imports: [CommunityListComponent, ThemedHomeNewsComponent, NgTemplateOutlet, NgIf, ViewTrackerComponent, ThemedSearchFormComponent, ThemedTopLevelCommunityListComponent, RecentItemListComponent, AsyncPipe, TranslateModule, NgClass, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, PageWithSidebarComponent, HomeCoarComponent],
  standalone: true,
})
export class HomePageComponent extends BaseComponent {
  public FACULTY_COMMUNITY_GROUP = FACULTY_COMMUNITY_GROUP;
  public UM_COMMUNITY_GROUP = UM_COMMUNITY_GROUP;
  public COMMUNITY_LIST_SIZE = 5;
}
