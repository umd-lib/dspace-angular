import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedFileDownloadLinkComponent } from 'src/app/shared/file-download-link/themed-file-download-link.component';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
import { VarDirective } from 'src/app/shared/utils/var.directive';
import { BitstreamDownloadCounterComponent } from 'src/themes/drum/app/bitstream-download-counter/bitstream-download-counter.component';

import { UsageReportDataService } from '../../../../../../../app/core/statistics/usage-report-data.service';
import { FileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component';
import { slideSidebarPadding } from '../../../../../../../app/shared/animations/slide';

@Component({
  selector: 'ds-item-page-file-section',
  templateUrl: './file-section.component.html',
  // templateUrl: '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component.html',
  animations: [slideSidebarPadding],
  providers: [UsageReportDataService],
  imports: [
    AsyncPipe, BitstreamDownloadCounterComponent, FileSizePipe,
    MetadataFieldWrapperComponent, NgFor, NgIf,
    ThemedFileDownloadLinkComponent, ThemedLoadingComponent,
    TranslateModule, VarDirective,
  ],
  standalone: true,
})
export class FileSectionComponent extends BaseComponent {

}
