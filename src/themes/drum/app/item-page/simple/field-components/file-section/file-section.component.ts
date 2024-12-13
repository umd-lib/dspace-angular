import { Component } from '@angular/core';
import { slideSidebarPadding } from '../../../../../../../app/shared/animations/slide';
import { FileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/file-section.component';
import {UsageReportDataService} from '../../../../../../../app/core/statistics/usage-report-data.service';
import { ThemedFileDownloadLinkComponent } from 'src/app/shared/file-download-link/themed-file-download-link.component';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { BitstreamDownloadCounterComponent } from 'src/themes/drum/app/bitstream-download-counter/bitstream-download-counter.component';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';

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
        TranslateModule, VarDirective
    ],
    standalone: true,
})
export class FileSectionComponent extends BaseComponent {

}
