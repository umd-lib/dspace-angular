import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { FlatNode } from '../../../../../app/community-list-page/flat-node.model';
import { SortDirection, SortOptions } from '../../../../../app/core/cache/models/sort-options.model';
import { FindListOptions } from '../../../../../app/core/data/find-list-options.model';
import { isEmpty } from '../../../../../app/shared/empty.util';
import { CommunityListDatasource } from '../community-list-datasource';
import { CommunityListService, MAX_COMCOLS_PER_PAGE } from '../community-list-service';
import { CommunityGroupDataService } from '../../core/data/community-group-data.service';
import { CommunityDataService } from '../../../../../app/core/data/community-data.service';


/**
 * This UMD version of the community list uses the custom community-list-datasource to retrieve the
 * top communities list of a particular CommunityGroup whereas the default implementation
 * uses the CommunityDataService to the overall top communities.
 */

// The reason for using 'ds-cg-community-list' as the selector is:
// The custom version accepts a "Input" field, whereas the 'ds-themed-community-list' does not.
// Therefore, the parent CommunityListPage component cannot use the 'ds-themed-community-list' to
// get the custom version loaded, and using the 'ds-community-list' tag as the selector and referencing
// that in the  CommunityListPage component template leads to runtime error due to multiple components
// matching that selector.
@Component({
  selector: 'ds-cg-community-list',
  templateUrl: './community-list.component.html',
  providers: [CommunityListService, CommunityDataService, CommunityGroupDataService]
})
export class CommunityListComponent implements OnInit, OnDestroy {

  // The community group ID to retrieve the top level communities
  @Input() communityGroupId = 0;

  // Size of the top level communities list displayed on initial rendering
  @Input() size = MAX_COMCOLS_PER_PAGE;

  private expandedNodes: FlatNode[] = [];
  public loadingNode: FlatNode;

  treeControl = new FlatTreeControl<FlatNode>(
    (node: FlatNode) => node.level, (node: FlatNode) => true
  );

  dataSource: CommunityListDatasource;

  paginationConfig: FindListOptions;

  constructor(private communityListService: CommunityListService) {
    this.paginationConfig = new FindListOptions();
    this.paginationConfig.currentPage = 1;
    this.paginationConfig.sort = new SortOptions('dc.title', SortDirection.ASC);
  }

  ngOnInit() {
    this.paginationConfig.elementsPerPage = this.size;
    this.dataSource = new CommunityListDatasource(this.communityListService);
    this.communityListService.getLoadingNodeFromStore().pipe(take(1)).subscribe((result) => {
      this.loadingNode = result;
    });
    this.communityListService.getExpandedNodesFromStore().pipe(take(1)).subscribe((result) => {
      this.expandedNodes = [...result];
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
    });
  }

  ngOnDestroy(): void {
    this.communityListService.saveCommunityListStateToStore(this.expandedNodes, this.loadingNode);
  }

  // whether or not this node has children (subcommunities or collections)
  hasChild(_: number, node: FlatNode) {
    return node.isExpandable$;
  }

  // whether or not it is a show more node (contains no data, but is indication that there are more topcoms, subcoms or collections
  isShowMore(_: number, node: FlatNode) {
    return node.isShowMoreNode;
  }

  /**
   * Toggles the expanded variable of a node, adds it to the expanded nodes list and reloads the tree so this node is expanded
   * @param node  Node we want to expand
   */
  toggleExpanded(node: FlatNode) {
    this.loadingNode = node;
    if (node.isExpanded) {
      this.expandedNodes = this.expandedNodes.filter((node2) => node2.name !== node.name);
      node.isExpanded = false;
    } else {
      this.expandedNodes.push(node);
      node.isExpanded = true;
      if (isEmpty(node.currentCollectionPage)) {
        node.currentCollectionPage = 1;
      }
      if (isEmpty(node.currentCommunityPage)) {
        node.currentCommunityPage = 1;
      }
    }
    this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
  }

  /**
   * Makes sure the next page of a node is added to the tree (top community, sub community of collection)
   *      > Finds its parent (if not top community) and increases its corresponding collection/subcommunity currentPage
   *      > Reloads tree with new page added to corresponding top community lis, sub community list or collection list
   * @param node  The show more node indicating whether it's an increase in top communities, sub communities or collections
   */
  getNextPage(node: FlatNode): void {
    this.loadingNode = node;
    if (node.parent != null) {
      if (node.id === 'collection') {
        const parentNodeInExpandedNodes = this.expandedNodes.find((node2: FlatNode) => node.parent.id === node2.id);
        parentNodeInExpandedNodes.currentCollectionPage++;
      }
      if (node.id === 'community') {
        const parentNodeInExpandedNodes = this.expandedNodes.find((node2: FlatNode) => node.parent.id === node2.id);
        parentNodeInExpandedNodes.currentCommunityPage++;
      }
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
    } else {
      this.paginationConfig.currentPage++;
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
    }
  }

}
