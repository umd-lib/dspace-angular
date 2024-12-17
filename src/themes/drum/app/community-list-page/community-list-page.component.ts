import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { CommunityListPageComponent as BaseComponent } from '../../../../app/community-list-page/community-list-page.component';
import { ThemedCommunityListComponent } from './community-list/themed-community-list.component';

export const FACULTY_COMMUNITY_GROUP = 0;
export const UM_COMMUNITY_GROUP = 2;

@Component({
  selector: 'ds-themed-community-list-page',
  templateUrl: './community-list-page.component.html',
  standalone: true,
  imports: [ThemedCommunityListComponent, TranslateModule],
})

/**
 * Page with title and the community list tree, as described in community-list.component;
 * navigated to with community-list.page.routing.module
 */
export class CommunityListPageComponent extends BaseComponent {
  // UMD Customization
  public FACULTY_COMMUNITY_GROUP = FACULTY_COMMUNITY_GROUP;
  public UM_COMMUNITY_GROUP = UM_COMMUNITY_GROUP;
  // End UMD Customization
}
