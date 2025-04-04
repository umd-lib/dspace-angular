import {
  CdkTreeModule,
  FlatTreeControl,
} from '@angular/cdk/tree';
import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';

import { FlatNode } from '../../../../../app/community-list-page/flat-node.model';
import { DSONameService } from '../../../../../app/core/breadcrumbs/dso-name.service';
import {
  SortDirection,
  SortOptions,
} from '../../../../../app/core/cache/models/sort-options.model';
import { CommunityDataService } from '../../../../../app/core/data/community-data.service';
import { CommunityGroupDataService } from '../../../../../app/core/data/community-group-data.service';
import { FindListOptions } from '../../../../../app/core/data/find-list-options.model';
import { isEmpty } from '../../../../../app/shared/empty.util';
import { CommunityListDatasource } from '../community-list-datasource';
import {
  CommunityListService,
  MAX_COMCOLS_PER_PAGE,
} from '../community-list-service';

// UMD Customization
/**
 * This UMD version of the community list uses the custom community-list-datasource to retrieve the
 * top communities list of a particular CommunityGroup whereas the default implementation
 * uses the CommunityDataService to the overall top communities.
 */
// The "ds-themed-base-community-list" selector is used to satisfy the
// "dspace-angular-ts/themed-component-selectors" Angular Lint error
@Component({
  selector: 'ds-themed-base-community-list',
  templateUrl: './community-list.component.html',
  providers: [CommunityListService, CommunityDataService, CommunityGroupDataService],
  //styleUrls: ['./community-list.component.scss'],
  imports: [NgIf, ThemedLoadingComponent, CdkTreeModule, NgClass, RouterLink, TruncatableComponent, TruncatablePartComponent, AsyncPipe, TranslateModule],
  standalone: true,
})
// End UMD Customization

export class CommunityListComponent implements OnInit, OnDestroy {
  // UMD Customization
  // The community group ID to retrieve the top level communities
  @Input() communityGroupId = 0;

  // Size of the top level communities list displayed on initial rendering
  @Input() size = MAX_COMCOLS_PER_PAGE;
  // End UMD Customization

  private expandedNodes: FlatNode[] = [];
  public loadingNode: FlatNode;

  treeControl = new FlatTreeControl<FlatNode>(
    (node: FlatNode) => node.level, (node: FlatNode) => true,
  );
  dataSource: CommunityListDatasource;
  paginationConfig: FindListOptions;
  trackBy = (index, node: FlatNode) => node.id;

  constructor(
    protected communityListService: CommunityListService,
    public dsoNameService: DSONameService,
  ) {
    this.paginationConfig = new FindListOptions();
    this.paginationConfig.elementsPerPage = 2;
    this.paginationConfig.currentPage = 1;
    this.paginationConfig.sort = new SortOptions('dc.title', SortDirection.ASC);
  }

  ngOnInit() {
    // UMD Customization
    this.paginationConfig.elementsPerPage = this.size;
    // End UMD Customization
    this.dataSource = new CommunityListDatasource(this.communityListService);
    this.communityListService.getLoadingNodeFromStore().pipe(take(1)).subscribe((result) => {
      this.loadingNode = result;
    });
    this.communityListService.getExpandedNodesFromStore().pipe(take(1)).subscribe((result) => {
      this.expandedNodes = [...result];
      // UMD Customization
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
      // End UMD Customization
    });
  }

  ngOnDestroy(): void {
    this.communityListService.saveCommunityListStateToStore(this.expandedNodes, this.loadingNode);
  }

  /**
   * Whether this node has children (subcommunities or collections)
   * @param _
   * @param node
   */
  hasChild(_: number, node: FlatNode) {
    return node.isExpandable$;
  }

  /**
   * Whether this is a show more node that contains no data, but indicates that there is
   * one or more community or collection.
   * @param _
   * @param node
   */
  isShowMore(_: number, node: FlatNode) {
    return node.isShowMoreNode;
  }

  /**
   * Toggles the expanded variable of a node, adds it to the expanded nodes list and reloads the tree
   * so this node is expanded
   * @param node  Node we want to expand
   */
  toggleExpanded(node: FlatNode) {
    this.loadingNode = node;
    if (node.isExpanded) {
      this.expandedNodes = this.expandedNodes.filter((node2) => node2.id !== node.id);
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
    // UMD Customization
    this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
    // End UMD Customization
  }

  /**
   * Makes sure the next page of a node is added to the tree (top community, sub community of collection)
   *      > Finds its parent (if not top community) and increases its corresponding collection/subcommunity
   *      currentPage
   *      > Reloads tree with new page added to corresponding top community lis, sub community list or
   *      collection list
   * @param node  The show more node indicating whether it's an increase in top communities, sub communities
   *              or collections
   */
  getNextPage(node: FlatNode): void {
    this.loadingNode = node;
    if (node.parent != null) {
      if (node.id.startsWith('collection')) {
        const parentNodeInExpandedNodes = this.expandedNodes.find((node2: FlatNode) => node.parent.id === node2.id);
        parentNodeInExpandedNodes.currentCollectionPage++;
      }
      if (node.id.startsWith('community')) {
        const parentNodeInExpandedNodes = this.expandedNodes.find((node2: FlatNode) => node.parent.id === node2.id);
        parentNodeInExpandedNodes.currentCommunityPage++;
      }
      // UMD Customization
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
      // End UMD Customization
    } else {
      this.paginationConfig.currentPage++;
      // UMD Customization
      // When the "Show More" button is clicked in a subcommunity, retrieve up
      // to MAX_COMCOLS_PER_PAGE additional entries, instead of the DSpace
      // default of 5 entries
      this.paginationConfig.elementsPerPage = MAX_COMCOLS_PER_PAGE;
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes, this.communityGroupId);
      // End UMD Customization
    }
  }
}
