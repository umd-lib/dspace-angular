import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { Context } from 'src/app/core/shared/context.model';

/**
 * Component that represents a publication Item page
 */

@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'drum')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UntypedItemComponent extends BaseComponent implements OnInit {
  public publicationLinkLabelI18nKey = 'item.page.publicationLink';
  public citationLabelI18nKey = 'item.page.citation';

  ngOnInit(): void {
    super.ngOnInit();

    let itemType: string = this.object.firstMetadataValue('dc.type');

    if (('Dataset' === itemType) || ('Software' === itemType)) {
      // Change labels for Dataset/Software items
      this.publicationLinkLabelI18nKey = 'item.page.publicationLink.datasetOrSoftware';
      this.citationLabelI18nKey = 'item.page.citation.datasetOrSoftware';
    }
  }
}
