import { escape } from 'lodash';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';

export class DatasetJsonLdTransformer {
  /**
   * Returns true if the DSpaceObject is a Dataset, false otherwise.
   *
   * @param item the DSpaceObject to check
   * @return true if the DSpaceObject is a Dataset, false otherwise.
   */
  handles(item: DSpaceObject): boolean {
    return item.hasMetadata('dc.type', { value: 'Dataset' } );
  }

  private fromDspaceObject(url: string, dspaceObject: DSpaceObject): any {
    // Run each value (or array of values) through escape/escapeAll to prevent
    // cross-site scripting (XSS) attacks from user-input values.
    return {
      'type': escape(dspaceObject.firstMetadataValue('dc.type') || ''),
      'name': escape(dspaceObject.firstMetadataValue('dc.title') || ''),
      'url': escape(url),
      'temporalCoverage': escape(dspaceObject.firstMetadataValue('dc.date.issued')  || ''),
      'descriptions': this.escapeAll(dspaceObject.allMetadataValues('dc.description.abstract')),
      'creators': this.escapeAll(dspaceObject.allMetadataValues('dc.contributor.author')),
      'identifiers': this.escapeAll(dspaceObject.allMetadataValues(['dc.identifier.uri', 'dc.identifier.*', 'dc.identifier'])),
      'license': escape(dspaceObject.firstMetadataValue('dc.rights.uri')  || '')
    };
  }

  asJsonLd(url: string, dspaceObject: DSpaceObject): any {
    let jsonObj = this.fromDspaceObject(url, dspaceObject);
    let description = jsonObj.descriptions.join(' ');
    let identifiers = jsonObj.identifiers;
    let creator = [];

    for (const creatorName of jsonObj.creators) {
      let c = {
        '@type': 'Person',
        'name': creatorName
      };
      creator.push(c);
    }

    return {
      '@context' : 'http://schema.org',
      '@type': jsonObj.type,
      'name': jsonObj.name,
      'description': description,
      'url': jsonObj.url,
      'temporalCoverage': jsonObj.temporalCoverage,
      'creator': creator,
      'identifier': identifiers,
      'license': jsonObj.license
    };
  }

  /**
   * Runs "escape" on each value in the string array, returning an array of
   * escaped string.
   *
   * @param values the string array of values to escape
   * @return an array of escaped string values.
   */
  private escapeAll(values: string[]): string[] {
    return values.map(id => escape(id));
  }
}
