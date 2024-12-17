import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AlertComponent } from '../shared/alert/alert.component';
import { EmbargoListService } from './embargo-list.service';
import { EmbargoListComponent } from './embargo-list/embargo-list.component';
import { EmbargoListExportCsvComponent } from './embargo-list-export-csv/embargo-list-export-csv.component';
import { EmbargoListResponse } from './models/embargo-list-entry.model';


@Component({
  selector: 'ds-embargo-list-page',
  templateUrl: './embargo-list-page.component.html',
  styleUrls: ['./embargo-list-page.component.scss'],
  imports: [AlertComponent,  AsyncPipe, EmbargoListComponent, EmbargoListExportCsvComponent, NgIf, TranslateModule],
  standalone: true,
})
export class EmbargoListPageComponent implements OnInit {
  /**
   * Embargo list endpoint response
   */
  embargoListResponse: BehaviorSubject<EmbargoListResponse> = new BehaviorSubject<EmbargoListResponse>(null);

  /**
   * True if the response from embargo list endpoint has already retrieved, false otherwise
   */
  embargoListResponseInitialised: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private embargoListService: EmbargoListService) {
  }

  /**
   * Retrieve response from REST endpoint
   */
  ngOnInit(): void {
    this.embargoListService.getEmbargoList().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.embargoListResponse.next(data.payload);
        this.embargoListResponseInitialised.next(true);
      },
      error: () => {
        this.embargoListResponse.next(null);
        this.embargoListResponseInitialised.next(true);
      },
    });
  }
}
