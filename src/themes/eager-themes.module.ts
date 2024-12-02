import { NgModule } from '@angular/core';
// UMD Customization
import { EagerThemeModule as DrumEagerThemeModule } from './drum/eager-theme.module';
// import { EagerThemeModule as CustomEagerThemeModule } from './custom/eager-theme.module';
// End UMD Customization

/**
 * This module bundles the eager theme modules for all available themes.
 * Eager modules contain components that are present on every page (to speed up initial loading)
 * and entry components (to ensure their decorators get picked up).
 *
 * Themes that aren't in use should not be imported here so they don't take up unnecessary space in the main bundle.
 */
@NgModule({
  imports: [
    // UMD Customization
    // DSpaceEagerThemeModule,
    // CustomEagerThemeModule,
    DrumEagerThemeModule,
    // End UMD Customization
  ],
})
export class EagerThemesModule {
}
