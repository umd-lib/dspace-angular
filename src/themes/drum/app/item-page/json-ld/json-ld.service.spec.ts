import { DOCUMENT } from '@angular/common';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { JsonLdService } from './json-ld.service';
import { emptyDataset, fullDataset } from './mocks/mock-json-ld-items';

describe('JsonLdService', () => {
  let jsonLdService: JsonLdService;
  let mockDocument: Document;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    });
    mockDocument = TestBed.inject(DOCUMENT).implementation.createHTMLDocument();
    jsonLdService = new JsonLdService();
  }));

  describe('insertJsonLdSchema', () => {
    it('should insert a JSON-LD script into the HTML <head>', () => {
      jsonLdService.insertJsonLdSchema(mockDocument, 'test-json-ld', fullDataset.expectedJsonLd);
      expect(mockDocument.getElementById('test-json-ld').innerHTML).not.toBeNull();
      expect(mockDocument.getElementById('test-json-ld').innerHTML).toEqual(JSON.stringify(fullDataset.expectedJsonLd));
    });
  });

  describe('removeJsonLdSchema', () => {
    it('should remove a JSON-LD script with the given schema id from the HTML <head>', () => {
      jsonLdService.insertJsonLdSchema(mockDocument, 'test-full-dataset', fullDataset.expectedJsonLd);
      jsonLdService.insertJsonLdSchema(mockDocument, 'test-empty-dataset', emptyDataset.expectedJsonLd);

      expect(mockDocument.getElementById('test-full-dataset').innerHTML).not.toBeNull();
      expect(mockDocument.getElementById('test-empty-dataset').innerHTML).not.toBeNull();

      jsonLdService.removeJsonLdSchema(mockDocument, 'test-empty-dataset');

      expect(mockDocument.getElementById('test-empty-dataset')).toBeNull();
      expect(mockDocument.getElementById('test-full-dataset').innerHTML).toEqual(JSON.stringify(fullDataset.expectedJsonLd));
    });
  });
});
