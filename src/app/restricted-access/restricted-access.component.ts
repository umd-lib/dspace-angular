import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, windowWhen, zip } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

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

  constructor(
    private auth: AuthService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {
  }
  ngOnInit(): void {
    // Retrieve "restrictedAccess" parameter from history state,
    // see https://medium.com/javascript-everyday/keep-data-in-the-state-object-during-navigation-in-angular-5657af156fb8
    const { embargoRestriction } = window.history.state;

    const isLoggedIn$ = this.auth.isAuthenticated();

    isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      let header$: Observable<string>;
      let message$: Observable<string>;

      if (isLoggedIn) {
        header$ = this.translateService.get('bitstream.restricted-access.user.forbidden.header', {});
        message$  = this.translateService.get('bitstream.restricted-access.user.forbidden.message', {});
      } else {
        [header$, message$] = this.configureAnonymous(embargoRestriction);
      }

      zip(header$, message$).subscribe(([header, message]) => {
        this.restrictedAccessHeader.next(header);
        this.restrictedAccessMessage.next(message);
      });
    });
  }

  protected configureAnonymous(embargoRestriction: string): [Observable<string>, Observable<string>] {
    let header$ = this.translateService.get('bitstream.restricted-access.header', {});
    let message$: Observable<string>;

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
