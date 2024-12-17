import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';

import { Bitstream } from '../../../../app/core/shared/bitstream.model';
import { UsageReport } from '../../../../app/core/statistics/models/usage-report.model';
import { UsageReportDataService } from '../../../../app/core/statistics/usage-report-data.service';

@Component({
  template: `{{label}} {{(downloadsReport$ | async)?.points[0].values.views}}`,
  selector: 'ds-bitstream-download-counter',
  imports: [AsyncPipe],
  standalone: true,
})
export class BitstreamDownloadCounterComponent implements OnInit {
  @Input() bitstream: Bitstream;

  @Input() label: string;

  downloadsReport$: Observable<UsageReport>;

  constructor(
    protected usageReportService: UsageReportDataService,
  ) {
  }

  ngOnInit(): void {
    this.downloadsReport$ = this.usageReportService.getStatistic(this.bitstream.id, 'TotalDownloads');
  }

}
