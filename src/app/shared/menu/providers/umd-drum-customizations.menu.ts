import { Injectable } from '@angular/core';
import {
  combineLatest,
  map,
  Observable,
  of,
} from 'rxjs';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { AbstractExpandableMenuProvider } from './helper-providers/expandable-menu-provider';

/**
 * Menu provider to create the "DRUM Customizations" menu (and subsections) in the admin sidebar
 */
@Injectable()
export class UmdDrumCustomizationsMenuProvider extends AbstractExpandableMenuProvider {

  constructor(
    protected authorizationService: AuthorizationDataService,
  ) {
    super();
  }

  public getTopSection(): Observable<PartialMenuSection> {
    return of({
      model: {
        type: MenuItemType.TEXT,
        text: 'menu.section.drum_customizations',
      },
      icon: 'drum',
      visible: true,
    });
  }

  public getSubSections(): Observable<PartialMenuSection[]> {
    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.AdministratorOf),
    ]).pipe(
      map(([isSiteAdmin]: [boolean]) => {
        return [
          // Embargo List
          {
            visible: isSiteAdmin,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.drum_customizations_embargo_list',
              link: '/embargo-list',
            },
          },
          // ETD Departments
          {
            visible: isSiteAdmin,
            model: {
              type: MenuItemType.LINK,
              text: 'menu.section.drum_customizations_etdunits',
              link: '/etdunits',
            },
          },
        ];
      }),
    );
  }
}
