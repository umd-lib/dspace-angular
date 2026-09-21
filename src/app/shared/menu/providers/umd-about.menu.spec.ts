import { TestBed } from '@angular/core/testing';
import { getUmdAboutPath } from 'src/app/info/info-routing-paths';

import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { UmdAboutMenuProvider } from './umd-about.menu';

describe('UmdAboutMenuProvider', () => {
  const expectedSections: PartialMenuSection[] = [
    {
      visible: true,
      model: {
        type: MenuItemType.LINK,
        text: `menu.section.umd-about`,
        link: getUmdAboutPath(),
      },
    },
  ];

  let provider: UmdAboutMenuProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UmdAboutMenuProvider,
      ],
    });
    provider = TestBed.inject(UmdAboutMenuProvider);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });

  it('getSections should return expected menu sections', (done) => {
    provider.getSections().subscribe((sections) => {
      expect(sections).toEqual(expectedSections);
      done();
    });
  });
});
