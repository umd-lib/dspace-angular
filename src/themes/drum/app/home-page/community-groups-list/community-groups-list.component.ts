import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { PaginatedList } from '../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../app/core/data/remote-data';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { CommunityGroupDataService } from '../../core/data/community-group-data.service';
import { CommunityGroup } from '../../core/shared/community-group.model';

/**
 * Declaration needed to make sure all decorator functions are called in time
 */
export const models =
  [
    CommunityGroup,
  ];

/**
 * this component renders the group Community list
 */
@Component({
  selector: 'ds-community-groups-list',
  styleUrls: ['./community-groups-list.component.scss'],
  templateUrl: './community-groups-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  providers: [CommunityGroupDataService],
})

export class CommunityGroupsListComponent implements OnInit {
  /**
   * A list of remote data objects of all top communities
   */
  communityGroupsRD$: BehaviorSubject<RemoteData<PaginatedList<CommunityGroup>>> = new BehaviorSubject<RemoteData<PaginatedList<CommunityGroup>>>({} as any);

  constructor(private cgds: CommunityGroupDataService) {
  }

  ngOnInit() {
    this.cgds.findAll({}, true, true, followLink('communities')).subscribe((results) => {
      this.communityGroupsRD$.next(results);
    });
  }

}
