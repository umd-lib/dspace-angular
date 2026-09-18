
import {
  Component,
  Input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { EmbargoListService } from '../embargo-list.service';
import { EmbargoListEntry } from '../models/embargo-list-entry.model';

/**
 * A component to render the embargo list.
 */
@Component({
  selector: 'ds-embargo-list',
  templateUrl: './embargo-list.component.html',
  styleUrls: ['./embargo-list.component.scss'],
  imports: [RouterLink, TranslateModule],
  standalone: true,
})
export class EmbargoListComponent {

  @Input({ required: true })
  embargoListResponse!: EmbargoListEntry[];

  /*
   * The labelPrefix for all translation
   */
  messagePrefix = 'embargo-list.table.label';

  constructor(public embargoListService: EmbargoListService) {
  }
}
