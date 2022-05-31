import {Component, Input, OnInit} from '@angular/core';
import {Bitstream} from '../../../../app/core/shared/bitstream.model';
import {Observable} from 'rxjs';
import {UsageReportService} from '../../../../app/core/statistics/usage-report-data.service';
import {UsageReport} from '../../../../app/core/statistics/models/usage-report.model';

@Component({
  template: `{{label}} {{(downloadsReport$ | async)?.points[0].values.views}}`,
  selector: 'ds-bitstream-download-counter'
})
export class BitstreamDownloadCounterComponent implements OnInit {
  @Input() bitstream: Bitstream;

  @Input() label: string;

  downloadsReport$: Observable<UsageReport>;

  constructor(
    protected usageReportService: UsageReportService
  ) {
  }

  ngOnInit(): void {
    this.downloadsReport$ = this.usageReportService.getStatistic(this.bitstream.id, 'TotalDownloads');
  }

}
