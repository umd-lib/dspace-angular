import { cloneDeep } from 'lodash';
import { DatasetJsonLdTransformer } from './json-ld-dataset.transfomer';
import { emptyDataset, escapeTestDataset, fullDataset, notADataset } from './mocks/mock-json-ld-items';

describe('DatasetJsonLdTransformer', () => {
  let transformer: DatasetJsonLdTransformer;

  beforeEach(() => {
    transformer = new DatasetJsonLdTransformer();
  });

  describe('handles', () => {
    it('returns true if the "dc.type" metadata field of the item is "Dataset"', () => {
      let item = fullDataset.dspaceObject;
      expect(transformer.handles(item)).toBe(true);
    });

    describe('returns false', () => {
      it('if the "dc.type" metadata field of the item is not "Dataset"', () => {
        let item = notADataset.dspaceObject;
        expect(transformer.handles(item)).toBe(false);
      });

      it('if the "dc.type" metadata field of the item is not present', () => {
        let item = cloneDeep(notADataset.dspaceObject); // Cloning because item is modified by test
        item.removeMetadata('dc.type');
        expect(transformer.handles(item)).toBe(false);
      });
    });
  });

  describe('asJson', ()=> {
    it('fullDataset - returns the JSON-LD object for the given DSpaceObject', () => {
      let url = fullDataset.url;
      let jsonLd = transformer.asJsonLd(url, fullDataset.dspaceObject);
      expect(jsonLd).toEqual(fullDataset.expectedJsonLd);
    });

    it('emptyDataset - returns a JSON-LD object with default values when values are not given', () => {
      let url = emptyDataset.url;
      let jsonLd = transformer.asJsonLd(url, emptyDataset.dspaceObject);
      expect(jsonLd).toEqual(emptyDataset.expectedJsonLd);
    });

    it('escapeTestDataset - returns a JSON-LD object with escaped values', () => {
      let url = escapeTestDataset.url;
      let jsonLd = transformer.asJsonLd(url, escapeTestDataset.dspaceObject);
      expect(jsonLd).toEqual(escapeTestDataset.expectedJsonLd);
    });
  });
});
