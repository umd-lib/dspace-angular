import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  combineLatest as observableCombineLatest,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { ScriptDataService } from 'src/app/core/data/processes/script-data.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { getProcessDetailRoute } from 'src/app/process-page/process-page-routing.paths';
import { Process } from 'src/app/process-page/processes/process.model';
import { hasValue } from 'src/app/shared/empty.util';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';

@Component({
  selector: 'ds-embargo-list-export-csv',
  styleUrls: ['./embargo-list-export-csv.component.scss'],
  templateUrl: './embargo-list-export-csv.component.html',
  imports: [AsyncPipe, NgbTooltipModule, NgIf, TranslateModule],
  standalone: true,
})

/**
 * Display a button to export the embargo list results as csv
 */
export class EmbargoListExportCsvComponent implements OnInit {
  /**
   * Observable used to determine whether the button should be shown
   */
  shouldShowButton$: Observable<boolean>;

  /**
   * The message key used for the tooltip of the button
   */
  tooltipMsg = 'embargo-list-export-csv.tooltip';

  constructor(private scriptDataService: ScriptDataService,
              private authorizationDataService: AuthorizationDataService,
              private notificationsService: NotificationsService,
              private translateService: TranslateService,
              private router: Router,
  ) {
  }

  ngOnInit(): void {
    const scriptExists$ = this.scriptDataService.findById('embargo-list-export').pipe(
      getFirstCompletedRemoteData(),
      map((rd) => rd.isSuccess && hasValue(rd.payload)),
    );

    const isAuthorized$ = this.authorizationDataService.isAuthorized(FeatureID.AdministratorOf);

    this.shouldShowButton$ = observableCombineLatest([scriptExists$, isAuthorized$]).pipe(
      map(([scriptExists, isAuthorized]: [boolean, boolean]) => scriptExists && isAuthorized),
    );
  }

  /**
   * Start the export of the embargoed items
   */
  export() {
    const parameters = [];
    this.scriptDataService.invoke('embargo-list-export', parameters, []).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((rd: RemoteData<Process>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get('embargo-list-export-csv.submit.success'));
        this.router.navigateByUrl(getProcessDetailRoute(rd.payload.processId));
      } else {
        this.notificationsService.error(this.translateService.get('embargo-list-export-csv.submit.error'));
      }
    });
  }
}
