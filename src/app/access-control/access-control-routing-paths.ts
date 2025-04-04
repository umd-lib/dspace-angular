import { getAccessControlModuleRoute } from '../app-routing-paths';
import { URLCombiner } from '../core/url-combiner/url-combiner';

export const EPERSON_PATH = 'epeople';

export function getEPersonsRoute(): string {
  return new URLCombiner(getAccessControlModuleRoute(), EPERSON_PATH).toString();
}

export function getEPersonEditRoute(id: string): string {
  return new URLCombiner(getEPersonsRoute(), id, 'edit').toString();
}

export const GROUP_PATH = 'groups';

export function getGroupsRoute() {
  return new URLCombiner(getAccessControlModuleRoute(), GROUP_PATH).toString();
}

export function getGroupEditRoute(id: string) {
  return new URLCombiner(getGroupsRoute(), id, 'edit').toString();
}

// UMD Customization
export const UNIT_EDIT_PATH = 'units';

export function getUnitsRoute() {
  return new URLCombiner(getAccessControlModuleRoute(), UNIT_EDIT_PATH).toString();
}

export function getUnitEditRoute(id: string) {
  return new URLCombiner(getAccessControlModuleRoute(), UNIT_EDIT_PATH, id).toString();
}
// End UMD Customization
