import { Component } from '@angular/core';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { FACULTY_COMMUNITY_GROUP, UM_COMMUNITY_GROUP } from '../community-list-page/community-list-page.component';


@Component({
  selector: 'ds-home-page',
  // styleUrls: ['./home-page.component.scss'],
  styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent extends BaseComponent {
  public FACULTY_COMMUNITY_GROUP: number = FACULTY_COMMUNITY_GROUP;
  public UM_COMMUNITY_GROUP: number = UM_COMMUNITY_GROUP;
}
