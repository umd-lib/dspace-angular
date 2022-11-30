import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from 'src/app/core/data/item-data.service';
import { ItemPageComponent as BaseComponent } from '../../../../../app/item-page/simple/item-page.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';

/**
 * This component renders a simple item page.
 * The route parameter 'id' is used to request the item it represents.
 * All fields of the item that should be displayed, are defined in its template.
 */
@Component({
  selector: 'ds-item-page',
  styleUrls: ['../../../../../app/item-page/simple/item-page.component.scss'],
  templateUrl: 'item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class ItemPageComponent extends BaseComponent {
  constructor(
    protected route: ActivatedRoute,
    router: Router,
    items: ItemDataService,
    authService: AuthService,
    authorizationService: AuthorizationDataService
  ) {
    super(route, router, items, authService, authorizationService);
  }
}
