import { Component } from '@angular/core';
import { CommunityListPageComponent as BaseComponent } from '../../../../app/community-list-page/community-list-page.component';

@Component({
  selector: 'ds-community-list-page',
  templateUrl: './community-list-page.component.html',
})
export class CommunityListPageComponent extends BaseComponent {

  public FACULTY_COMMUNITY_GROUP: Number = 0;
  public UM_COMMUNITY_GROUP: Number = 2;
}
