/* eslint-disable max-classes-per-file */
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { combineLatest as observableCombineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Community } from '../../../../app/core/shared/community.model';
import { PageInfo } from '../../../../app/core/shared/page-info.model';
import { buildPaginatedList, PaginatedList } from '../../../../app/core/data/paginated-list.model';
import { CollectionDataService } from '../../../../app/core/data/collection-data.service';
import { CommunityDataService } from '../../../../app/core/data/community-data.service';
import { getFirstSucceededRemoteData } from '../../../../app/core/shared/operators';
import { followLink } from '../../../../app/shared/utils/follow-link-config.model';
import { FlatNode } from '../../../../app/community-list-page/flat-node.model';
import { FindListOptions } from '../../../../app/core/data/find-list-options.model';

import { CommunityListService as BaseService } from '../../../../app/community-list-page/community-list-service';
import { CommunityGroupDataService } from '../core/data/community-group-data.service';

export const MAX_COMCOLS_PER_PAGE = 40;

/**
 * The UMD version uses the custom CommunityGroupDataService to get top comunities of a group.
 *
 * Service class for the community list, responsible for the creating of the flat list used by communityList dataSource
 *  and connection to the store to retrieve and save the state of the community list
 */
@Injectable()
export class CommunityListService extends BaseService {


  constructor(private _communityDataService: CommunityDataService, private _collectionDataService: CollectionDataService,
    private communityGroupDataService: CommunityGroupDataService, private _store: Store<any>) {
    super(_communityDataService, _collectionDataService, _store);
  }

  private _configOnePage: FindListOptions = Object.assign(new FindListOptions(), {
    elementsPerPage: 1
  });

  /**
   * Gets all top communities, limited by page, and transforms this in a list of flatNodes.
   * @param findOptions       FindListOptions
   * @param expandedNodes     List of expanded nodes; if a node is not expanded its subCommunities and collections need
   *                            not be added to the list
   */
  loadCommunitiesInGroup(findOptions: FindListOptions, expandedNodes: FlatNode[], communityGroupId: number): Observable<FlatNode[]> {
    const currentPage = findOptions.currentPage;
    const topCommunities = [];
    for (let i = 1; i <= currentPage; i++) {
      const pagination: FindListOptions = Object.assign({}, findOptions, { currentPage: i });
      topCommunities.push(this.getTopCommunitiesByGroup(pagination, communityGroupId));
    }
    const topComs$ = observableCombineLatest([...topCommunities]).pipe(
      map((coms: PaginatedList<Community>[]) => {
        const newPages: Community[][] = coms.map((unit: PaginatedList<Community>) => unit.page);
        const newPage: Community[] = [].concat(...newPages);
        let newPageInfo = new PageInfo();
        if (coms && coms.length > 0) {
          newPageInfo = Object.assign({}, coms[0].pageInfo, { currentPage });
        }
        return buildPaginatedList(newPageInfo, newPage);
      })
    );
    return topComs$.pipe(
      switchMap((topComs: PaginatedList<Community>) => this.transformListOfCommunities(topComs, 0, null, expandedNodes)),
      // distinctUntilChanged((a: FlatNode[], b: FlatNode[]) => a.length === b.length)
    );
  }

  /**
   * Puts the initial top level communities in a list to be called upon
   */
  private getTopCommunitiesByGroup(options: FindListOptions, communityGroupId: number): Observable<PaginatedList<Community>> {
    return this.communityGroupDataService.getTopCommunitiesByGroup(communityGroupId,
      {
        currentPage: options.currentPage,
        elementsPerPage: options.elementsPerPage,
        sort: {
          field: options.sort.field,
          direction: options.sort.direction
        }
      },
      followLink('subcommunities', { findListOptions: this._configOnePage }),
      followLink('collections', { findListOptions: this._configOnePage }))
      .pipe(
        getFirstSucceededRemoteData(),
        map((results) => results.payload),
      );
  }

}
