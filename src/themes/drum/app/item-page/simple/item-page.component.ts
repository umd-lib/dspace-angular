import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NotifyInfoService } from 'src/app/core/coar-notify/notify-info/notify-info.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { SignpostingDataService } from 'src/app/core/data/signposting-data.service';
import { LinkHeadService } from 'src/app/core/services/link-head.service';
import { ServerResponseService } from 'src/app/core/services/server-response.service';
import { ThemedItemAlertsComponent } from 'src/app/item-page/alerts/themed-item-alerts.component';
import { ItemVersionsComponent } from 'src/app/item-page/versions/item-versions.component';
import { ItemVersionsNoticeComponent } from 'src/app/item-page/versions/notice/item-versions-notice.component';
import { ErrorComponent } from 'src/app/shared/error/error.component';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ListableObjectComponentLoaderComponent } from 'src/app/shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';
import { ViewTrackerComponent } from 'src/app/statistics/angulartics/dspace/view-tracker.component';

import { ItemPageComponent as BaseComponent } from '../../../../../app/item-page/simple/item-page.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { JsonLdDatasetComponent } from '../json-ld/json-ld-dataset.component';

/**
 * This component renders a simple item page.
 * The route parameter 'id' is used to request the item it represents.
 * All fields of the item that should be displayed, are defined in its template.
 */
@Component({
  selector: 'ds-item-page',
  styleUrls: ['../../../../../app/item-page/simple/item-page.component.scss'],
  templateUrl: 'item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  imports: [
    AsyncPipe, ErrorComponent, ItemVersionsComponent,
    ItemVersionsNoticeComponent, JsonLdDatasetComponent,
    ListableObjectComponentLoaderComponent, NgIf, ThemedItemAlertsComponent,
    ThemedLoadingComponent, TranslateModule, VarDirective, ViewTrackerComponent,
  ],
  standalone: true,
})
export class ItemPageComponent extends BaseComponent {
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected items: ItemDataService,
    protected authorizationService: AuthorizationDataService,
    protected responseService: ServerResponseService,
    protected signpostingDataService: SignpostingDataService,
    protected linkHeadService: LinkHeadService,
    protected notifyInfoService: NotifyInfoService,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
    super(route, router, items, authorizationService,
      responseService, signpostingDataService, linkHeadService, notifyInfoService, platformId);
  }
}
