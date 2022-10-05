import { Component } from '@angular/core';
import { CommunityListPageComponent as BaseComponent } from '../../../../app/community-list-page/community-list-page.component';

export const FACULTY_COMMUNITY_GROUP = 0;
export const UM_COMMUNITY_GROUP = 2;

@Component({
  selector: 'ds-community-list-page',
  templateUrl: './community-list-page.component.html',
})
export class CommunityListPageComponent extends BaseComponent {

  public FACULTY_COMMUNITY_GROUP = FACULTY_COMMUNITY_GROUP;
  public UM_COMMUNITY_GROUP = UM_COMMUNITY_GROUP;
}
