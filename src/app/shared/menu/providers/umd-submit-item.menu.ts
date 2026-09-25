import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';

import { ThemedCreateItemParentSelectorComponent } from '../../dso-selector/modal-wrappers/create-item-parent-selector/themed-create-item-parent-selector.component';
import { OnClickMenuItemModel } from '../menu-item/models/onclick.model';
import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractMenuProvider,
  PartialMenuSection,
} from '../menu-provider.model';

/**
 * Menu provider to create the "Submit Item to DRUM" item in the public navbar.
 *
 * Only displayed for logged-in users that are allowed to submit items.
 */
@Injectable()
export class UmdSubmitItemMenuProvider extends AbstractMenuProvider {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected modalService: NgbModal,
  ) {
    super();
  }

  public getSections(): Observable<PartialMenuSection[]> {
    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.CanSubmit),
    ]).pipe(
      map(([canSubmit]) => {
        return [
          {
            visible: canSubmit,
            model: {
              type: MenuItemType.ONCLICK,
              text: `menu.section.umd-submit_item`,
              function: () => {
                this.modalService.open(ThemedCreateItemParentSelectorComponent);
              },
            } as OnClickMenuItemModel,
          },
        ] as PartialMenuSection[];
      }),
    );
  }
}
