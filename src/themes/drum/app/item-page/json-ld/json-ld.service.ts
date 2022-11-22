import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * This service appends and removes JSON-LD scripts in the "head" tag of the
 * HTML document.
 *
 * Typical use is to call "insertJsonLdSchema" in an "ngOnInit" method of a
 * component, and call "removeJsonLdSchema" in the "ngOnDestroy" method.
 */
export class JsonLdService {
  /**
   * Appends the given JSON-LD to the given Document's <head> tag, with the
   * provided scriptId.
   *
   * The "scriptId" value should be unique, as it is used to remove the
   * JSON-LD when the item is no longer displayed.
   *
   * WARNING: This implementation uses "JSON.stringify" which could result in
   * XSS attacks. Ensure that all string values provided in the "jsonLd"
   * parameter have been properly escaped prior to calling this method.
   *
   * @param document the Document to add the JSON-LD script to
   * @param scriptId the HTML "id" field to identify the JSON-LD script
   * @param jsonLd the JSON-LD object to insert in the document head.
   */
  insertJsonLdSchema(document: Document, scriptId: string, jsonLd: any): void {
    let script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = scriptId;
    document.head.appendChild(script);
  }

  /**
   * Removes the element with the given scriptId from the given Document.
   *
   * @param document the Document to remove the element from.
   * @param scriptId the HTML "id" field of the element to remove.
   */
  removeJsonLdSchema(document: Document, scriptId: string): void {
    let elementToRemove = document.getElementById(scriptId);
    if (elementToRemove) {
      document.head.removeChild(elementToRemove);
    }
  }
}
