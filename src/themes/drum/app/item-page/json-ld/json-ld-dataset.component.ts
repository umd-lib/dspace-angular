import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';

import { JsonLdService } from './json-ld.service';
import { DatasetJsonLdTransformer } from './json-ld-dataset.transformer';

@Component({
  selector: 'ds-json-ld-dataset',
  styles: [],
  template: '',
  imports: [],
  standalone: true,
})
export class JsonLdDatasetComponent implements OnInit, OnDestroy {
  transformer: DatasetJsonLdTransformer;

  /**
   * The id to assign to the HTML script tag containing the JSON-LD schema
   */
  @Input() scriptId: string;

  /**
   * The Item to display the JSON-LD for
   */
  @Input() item: Item;

  constructor(
    protected jsonLdService: JsonLdService,
    @Inject(DOCUMENT) protected document: any,
  ) {
    this.transformer = new DatasetJsonLdTransformer();
  }

  /**
   * Appends the JSON-LD for the item, if the item is a Dataset.
   */
  ngOnInit(): void {
    if (this.transformer.handles(this.item)) {
      const url = this.document.location.href;
      const jsonLd = this.transformer.asJsonLd(url, this.item);
      this.jsonLdService.insertJsonLdSchema(this.document, this.scriptId, jsonLd);
    }
  }

  /**
   * Removes the JSON-LD added for the item, if any.
   */
  ngOnDestroy(): void {
    this.jsonLdService.removeJsonLdSchema(this.document, this.scriptId);
  }
}


