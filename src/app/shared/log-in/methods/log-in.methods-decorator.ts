import { AuthMethodType } from '../../../core/auth/models/auth.method-type';
// UMD Customization
import { LogInCasComponent } from './cas/log-in-cas.component';
// End UMD Customization
import { LogInExternalProviderComponent } from './log-in-external-provider/log-in-external-provider.component';
import { LogInPasswordComponent } from './password/log-in-password.component';

export type AuthMethodTypeComponent =
  typeof LogInPasswordComponent |
  typeof LogInExternalProviderComponent;

export const AUTH_METHOD_FOR_DECORATOR_MAP = new Map<AuthMethodType, AuthMethodTypeComponent>([
  [AuthMethodType.Password, LogInPasswordComponent],
  [AuthMethodType.Shibboleth, LogInExternalProviderComponent],
  [AuthMethodType.Oidc, LogInExternalProviderComponent],
  [AuthMethodType.Orcid, LogInExternalProviderComponent],
  // UMD Customization
  [AuthMethodType.Cas, LogInCasComponent],
  // End UMD Customization
]);

/**
 * @deprecated
 */
export function renderAuthMethodFor(authMethodType: AuthMethodType) {
  return function decorator(objectElement: any) {
    if (!objectElement) {
      return;
    }
    AUTH_METHOD_FOR_DECORATOR_MAP.set(authMethodType, objectElement);
  };
}

export function rendersAuthMethodType(authMethodType: AuthMethodType) {
  return AUTH_METHOD_FOR_DECORATOR_MAP.get(authMethodType);
}
