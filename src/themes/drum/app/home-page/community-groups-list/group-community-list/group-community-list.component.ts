import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PaginatedList } from '../../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../../app/core/data/remote-data';
import { Community } from '../../../../../../app/core/shared/community.model';
import { fadeInOut } from '../../../../../../app/shared/animations/fade';
import { CommunityGroup } from '../../../core/shared/community-group.model';

/**
 * this component renders the Top-Level Community list
 */
@Component({
  selector: 'ds-group-community-list',
  styleUrls: ['./group-community-list.component.scss'],
  templateUrl: './group-community-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})

export class GroupCommunityListComponent {

  @Input() communityGroup: CommunityGroup;

  /**
   * A list of remote data objects of all communities
   */
  communitiesRD$: BehaviorSubject<RemoteData<PaginatedList<Community>>> = new BehaviorSubject<RemoteData<PaginatedList<Community>>>({} as any);

  ngOnInit() {
    this.communityGroup.communities.subscribe((results) => {
      this.communitiesRD$.next(results);
    });
  }

}
