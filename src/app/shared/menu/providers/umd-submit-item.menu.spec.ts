import { TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { ThemedCreateItemParentSelectorComponent } from '../../dso-selector/modal-wrappers/create-item-parent-selector/themed-create-item-parent-selector.component';
import { OnClickMenuItemModel } from '../menu-item/models/onclick.model';
import { MenuItemType } from '../menu-item-type.model';
import { UmdSubmitItemMenuProvider } from './umd-submit-item.menu';

describe('UmdSubmitItemMenuProvider', () => {
  let provider: UmdSubmitItemMenuProvider;

  let authorizationService: jasmine.SpyObj<AuthorizationDataService>;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(() => {
    authorizationService =
      jasmine.createSpyObj<AuthorizationDataService>(
        'authorizationService',
        ['isAuthorized'],
      );

    authorizationService.isAuthorized.and.returnValue(of(true));

    modalService = jasmine.createSpyObj<NgbModal>(
      'modalService',
      ['open'],
    );

    TestBed.configureTestingModule({
      providers: [
        UmdSubmitItemMenuProvider,
        {
          provide: AuthorizationDataService,
          useValue: authorizationService,
        },
        {
          provide: NgbModal,
          useValue: modalService,
        },
      ],
    });

    provider = TestBed.inject(UmdSubmitItemMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });

  describe('getSections', () => {
    it('should return a visible menu item when submission is authorized', (done) => {
      provider.getSections().subscribe((sections) => {
        expect(sections.length).toBe(1);
        expect(sections[0].visible).toBeTrue();

        const model = sections[0].model as OnClickMenuItemModel;

        expect(model.type).toBe(MenuItemType.ONCLICK);
        expect(model.text).toBe('menu.section.umd-submit_item');
        expect(model.function).toEqual(jasmine.any(Function));

        model.function();

        expect(modalService.open).toHaveBeenCalledOnceWith(
          ThemedCreateItemParentSelectorComponent,
        );

        done();
      });
    });

    it('should return a hidden menu item when submission is not authorized', (done) => {
      authorizationService.isAuthorized.and.returnValue(of(false));

      provider.getSections().subscribe((sections) => {
        expect(sections.length).toBe(1);
        expect(sections[0].visible).toBeFalse();

        const model = sections[0].model as OnClickMenuItemModel;

        expect(model.type).toBe(MenuItemType.ONCLICK);
        expect(model.text).toBe('menu.section.umd-submit_item');
        expect(model.function).toEqual(jasmine.any(Function));

        expect(modalService.open).not.toHaveBeenCalled();

        done();
      });
    });
  });
});
