import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { ConfigurationDataService } from 'src/app/core/data/configuration-data.service';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { JsonLdService } from './json-ld.service';

@Component({
  selector: 'ds-json-ld-website',
  styles: [],
  template: ''
})
export class JsonLdWebsiteComponent implements OnInit, OnDestroy {

  /**
   * The id to assign to the HTML script tag containing the JSON-LD schema
   */
  @Input() scriptId: string;

  constructor(
    protected jsonLdService: JsonLdService,
    protected configurationService: ConfigurationDataService,
    @Inject(DOCUMENT) protected document: any,
  ) {
  }

  /**
   * Appends the JSON-LD for the website on all pages
   */
  ngOnInit(): void {
    const dspaceName$ = this.configurationService.findByPropertyName('dspace.name').pipe(
      getFirstCompletedRemoteData(),
    );

    const dspaceBaseUrl$ = this.configurationService.findByPropertyName('dspace.baseUrl').pipe(
      getFirstCompletedRemoteData(),
    );

    combineLatest(
      [dspaceName$, dspaceBaseUrl$]
    ).subscribe(([dspaceNameRd, dspaceBaseUrlRd]) => {
      if (!(dspaceNameRd.hasSucceeded && dspaceBaseUrlRd.hasSucceeded)) {
        return;
      }

      let name = dspaceNameRd.payload.values[0];
      let baseUrl = dspaceBaseUrlRd.payload.values[0];


      this.jsonLdService.insertJsonLdSchema(this.document, this.scriptId, this.asJsonLd(name, baseUrl));
    });
  }

  /**
   * Returns the JSON-LD object to display.
   */
  asJsonLd(name: string, url: string): any {
    return {
      '@context' : 'http://schema.org',
      '@type' : 'WebSite',
      'name' : name,
      'url' : url
    };
  }

  /**
   * Removes the JSON-LD added for the item, if any.
   */
  ngOnDestroy(): void {
    this.jsonLdService.removeJsonLdSchema(this.document, this.scriptId);
  }
}


