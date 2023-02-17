import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest as observableCombineLatest, filter, map, Observable, of as observableOf, switchMap, take, zip } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../core/data/feature-authorization/feature-id';
import { RemoteData } from '../core/data/remote-data';
import { HardRedirectService } from '../core/services/hard-redirect.service';
import { redirectOn4xx } from '../core/shared/authorized.operators';
import { Bitstream } from '../core/shared/bitstream.model';
import { FileService } from '../core/shared/file.service';
import { getRemoteDataPayload } from '../core/shared/operators';
import { hasValue, isNotEmpty } from '../shared/empty.util';

/**
 * This component representing the `Restricted Access` DSpace page.
 */
@Component({
  selector: 'ds-restricted-access',
  templateUrl: './restricted-access.component.html',
  styleUrls: ['./restricted-access.component.scss']
})

export class RestrictedAccessComponent implements OnInit {
  /**
   * The header to display
   */
  restrictedAccessHeader: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  /**
   * The message to display
   */
  restrictedAccessMessage: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  bitstreamRD$: Observable<RemoteData<Bitstream>>;
  bitstream$: Observable<Bitstream>;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private auth: AuthService,
    private fileService: FileService,
    private hardRedirectService: HardRedirectService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {
  }
  ngOnInit(): void {
    this.bitstreamRD$ = this.route.data.pipe(
      map((data) => data.bitstream));

    this.bitstream$ = this.bitstreamRD$.pipe(
      redirectOn4xx(this.router, this.auth),
      getRemoteDataPayload()
    );

    this.bitstream$.pipe(
      switchMap((bitstream: Bitstream) => {
        const isAuthorized$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, isNotEmpty(bitstream) ? bitstream.self : undefined);
        const isLoggedIn$ = this.auth.isAuthenticated();
        return observableCombineLatest([isAuthorized$, isLoggedIn$, observableOf(bitstream)]);
      }),
      filter(([isAuthorized, isLoggedIn, bitstream]: [boolean, boolean, Bitstream]) => hasValue(isAuthorized) && hasValue(isLoggedIn)),
      take(1),
      switchMap(([isAuthorized, isLoggedIn, bitstream]: [boolean, boolean, Bitstream]) => {
        if (isAuthorized) {
          return this.fileService.retrieveFileDownloadLink(bitstream._links.content.href).pipe(
            filter((fileLink) => hasValue(fileLink)),
            take(1),
            map((fileLink) => {
              return [isAuthorized, isLoggedIn, bitstream, fileLink];
            }));
        } else {
          return [[isAuthorized, isLoggedIn, bitstream, '']];
        }
      })
    ).subscribe(([isAuthorized, isLoggedIn, bitstream, fileLink]: [boolean, boolean, Bitstream, string]) => {
      if (isAuthorized && isNotEmpty(fileLink)) {
        // This shouldn't happen, as the download is authorized, and the file link is available, so just redirect to
        // actual download page.
        this.hardRedirectService.redirect(fileLink);
      } else {
        let header$: Observable<string>;
        let message$: Observable<string>;

        if (isLoggedIn) {
          // This is a logged in user
          header$ = this.translateService.get('bitstream.restricted-access.user.forbidden.header', {});

          if (bitstream && bitstream.metadata['dc.title'] &&  bitstream.metadata['dc.title'][0] && bitstream.metadata['dc.title'][0].value) {
            let filename = bitstream.metadata['dc.title'][0].value;
            message$ = this.translateService.get(
              'bitstream.restricted-access.user.forbidden.with_file.message', {'filename': filename});
          } else {
            message$ = this.translateService.get(
              'bitstream.restricted-access.user.forbidden.generic.message', {});
          }
        } else {
          // This is an anonymous user
          [header$, message$] = this.configureAnonymous(bitstream);
        }

        zip(header$, message$).subscribe(([header, message]) => {
          this.restrictedAccessHeader.next(header);
          this.restrictedAccessMessage.next(message);
          });
      }
    });
  }

  protected configureAnonymous(bitstream: Bitstream): [Observable<string>, Observable<string>] {
    let header$ = this.translateService.get('bitstream.restricted-access.header', {});
    let message$: Observable<string>;

    let embargoRestriction = bitstream.embargoRestriction;

    if (embargoRestriction == null) {
      message$ = this.translateService.get('bitstream.restricted-access.anonymous.forbidden.message', {});
    } else if (('FOREVER' === embargoRestriction)) {
      message$ = this.translateService.get('bitstream.restricted-access.embargo.forever.message', {});
    } else if (this.isValidDate(embargoRestriction)) {
      let parsedDate = this.datePipe.transform(embargoRestriction, 'longDate');
      message$ = this.translateService.get(
        'bitstream.restricted-access.embargo.restricted-until.message', { 'restrictedAccessDate': parsedDate}
      );
    } else {
      // Reach this branch when embargoRestriction is "NONE", but there is some
      // other restriction, such as a "Campus" IP address group restiction.
      message$ = this.translateService.get('bitstream.restricted-access.anonymous.forbidden.message', {});
    }

    return [header$, message$];
  }

  /**
   * Returns true if the given String represents a valid date, false otherise.
   *
   * @param str the String to check.
   * @true if the given String represents a valid date, false otherise.
   */
  private isValidDate(str: string): boolean {
    // Expected date is in yyyy-MM-dd format.
    return (str.match(/\d\d\d\d-\d\d-\d\d/) != null);
  }
}
