import {
  Component,
  Input,
} from '@angular/core';

import { ThemedComponent } from '../../../../../app/shared/theme-support/themed.component';
import { CommunityListComponent } from './community-list.component';


@Component({
  selector: 'ds-community-list',
  styleUrls: [],
  templateUrl: '../../../../../app/shared/theme-support/themed.component.html',
  standalone: true,
  imports: [CommunityListComponent],
})
export class ThemedCommunityListComponent extends ThemedComponent<CommunityListComponent> {
  protected inAndOutputNames: (keyof CommunityListComponent & keyof this)[] = ['communityGroupId', 'size'];

  // The community group ID to retrieve the top level communities
  @Input() communityGroupId: number;

  // Size of the top level communities list displayed on initial rendering
  @Input() size: number;

  protected getComponentName(): string {
    return 'CommunityListComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/community-list-page/community-list/community-list.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./community-list.component`);
  }

}
