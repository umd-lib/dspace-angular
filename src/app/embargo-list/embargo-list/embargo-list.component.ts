import { Component, Input } from '@angular/core';

import { EmbargoListService } from '../embargo-list.service';
import { EmbargoListResponse } from '../models/embargo-list-entry.model';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf } from '@angular/common';

/**
 * A component to render the embargo list.
 */
@Component({
  selector: 'ds-embargo-list',
  templateUrl: './embargo-list.component.html',
  styleUrls: ['./embargo-list.component.scss'],
  imports: [NgForOf, RouterLink, TranslateModule],
  standalone: true,
})
export class EmbargoListComponent {

  @Input() embargoListResponse: EmbargoListResponse;

  /*
   * The labelPrefix for all translation
   */
  messagePrefix = 'embargo-list.table.label';

  constructor(public embargoListService: EmbargoListService) {
  }
}
