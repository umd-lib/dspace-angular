import { Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmbargoListService } from './embargo-list.service';
import { EmbargoListResponse } from './models/embargo-list-entry.model';


@Component({
  selector: 'ds-embargo-list-page',
  templateUrl: './embargo-list-page.component.html',
  styleUrls: ['./embargo-list-page.component.scss']
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
   * Retrieve response from rest
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
      }
    });
  }
}
