import { hasValue } from '../../../../app/shared/empty.util';
import { CommunityListService } from './community-list-service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FlatNode } from '../../../../app/community-list-page/flat-node.model';
import { FindListOptions } from '../../../../app/core/data/find-list-options.model';

/**
 * The UMD version uses the custom community-list-service to get top comunities of a group.
 *
 * DataSource object needed by a CDK Tree to render its nodes.
 * The list of FlatNodes that this DataSource object represents gets created in the CommunityListService at
 *    the beginning (initial page-limited top communities) and re-calculated any time the tree state changes
 *    (a node gets expanded or page-limited result become larger by triggering a show more node)
 */
export class CommunityListDatasource implements DataSource<FlatNode> {

  private communityList$ = new BehaviorSubject<FlatNode[]>([]);
  public loading$ = new BehaviorSubject<boolean>(false);
  private subLoadCommunities: Subscription;

  constructor(private communityListService: CommunityListService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    return this.communityList$.asObservable();
  }

  loadCommunities(findOptions: FindListOptions, expandedNodes: FlatNode[], communityGroupId: number) {
    this.loading$.next(true);
    if (hasValue(this.subLoadCommunities)) {
      this.subLoadCommunities.unsubscribe();
    }
    this.subLoadCommunities = this.communityListService.loadCommunitiesInGroup(findOptions, expandedNodes, communityGroupId).pipe(
      finalize(() => this.loading$.next(false)),
    ).subscribe((flatNodes: FlatNode[]) => {
      this.communityList$.next(flatNodes);
    });
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.communityList$.complete();
    this.loading$.complete();
  }

}
