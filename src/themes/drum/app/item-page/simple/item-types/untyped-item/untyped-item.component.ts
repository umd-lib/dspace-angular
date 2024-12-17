import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Context } from 'src/app/core/shared/context.model';
import { CollectionsComponent } from 'src/app/item-page/field-components/collections/collections.component';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { ThemedMediaViewerComponent } from 'src/app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from 'src/app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from 'src/app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageDateFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ItemPageUriFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { ThemedMetadataRepresentationListComponent } from 'src/app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { DsoEditMenuComponent } from 'src/app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { ThemedResultsBackButtonComponent } from 'src/app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from 'src/app/thumbnail/themed-thumbnail.component';

import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';

/**
 * Component that represents a publication Item page
 */

@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'drum')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe, CollectionsComponent, DsoEditMenuComponent,
    GenericItemPageFieldComponent, ItemPageAbstractFieldComponent,
    ItemPageDateFieldComponent, ItemPageUriFieldComponent,
    MetadataValuesComponent, MetadataFieldWrapperComponent,
    MiradorViewerComponent, NgIf, RouterLink, ThemedFileSectionComponent,
    ThemedMediaViewerComponent, ThemedMetadataRepresentationListComponent,
    ThemedResultsBackButtonComponent, ThemedThumbnailComponent,
    TranslateModule,
  ],
  standalone: true,
})
export class UntypedItemComponent extends BaseComponent implements OnInit {
  public publicationLinkLabelI18nKey = 'item.page.publicationLink';
  public citationLabelI18nKey = 'item.page.citation';

  ngOnInit(): void {
    super.ngOnInit();

    const itemType: string = this.object.firstMetadataValue('dc.type');

    if (('Dataset' === itemType) || ('Software' === itemType)) {
      // Change labels for Dataset/Software items
      this.publicationLinkLabelI18nKey = 'item.page.publicationLink.datasetOrSoftware';
      this.citationLabelI18nKey = 'item.page.citation.datasetOrSoftware';
    }
  }
}
