import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarModule } from '../../app/navbar/navbar.module';
import { SharedModule } from '../../app/shared/shared.module';
import { HeaderComponent } from './app/header/header.component';
import { NavbarComponent } from './app/navbar/navbar.component';

const DECLARATIONS = [
  HeaderComponent,
  NavbarComponent
];

@NgModule({
  imports: [
    CommonModule,
    NavbarModule,
    SharedModule,
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
