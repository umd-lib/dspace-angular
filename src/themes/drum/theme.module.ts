import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarModule } from '../../app/navbar/navbar.module';
import { SharedModule } from '../../app/shared/shared.module';
import { HeaderComponent } from './app/header/header.component';
import { NavbarComponent } from './app/navbar/navbar.component';
import { UmdEnvironmentBannerComponent } from './app/umd-environment-banner/umd-environment-banner.component';
import { UntypedItemComponent } from './app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ItemPageModule } from '../../app/item-page/item-page.module';
import { UmdHeaderComponent } from './app/umd-header/umd-header.component';

const DECLARATIONS = [
  HeaderComponent,
  NavbarComponent,
  UmdEnvironmentBannerComponent,
  UmdHeaderComponent,
  UntypedItemComponent
];

@NgModule({
  imports: [
    CommonModule,
    NavbarModule,
    SharedModule,
    ItemPageModule,
  ],
  declarations: DECLARATIONS
})

/**
 * This module serves as an index for all the components in this theme.
 * It should import all other modules, so the compiler knows where to find any components referenced
 * from a component in this theme
 * It is purposefully not exported, it should never be imported anywhere else, its only purpose is
 * to give lazily loaded components a context in which they can be compiled successfully
 */
class ThemeModule {
}
