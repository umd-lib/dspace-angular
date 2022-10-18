import { URLCombiner } from '../core/url-combiner/url-combiner';
import { getAccessControlModuleRoute } from '../app-routing-paths';

export const GROUP_EDIT_PATH = 'groups';

export function getGroupsRoute() {
  return new URLCombiner(getAccessControlModuleRoute(), GROUP_EDIT_PATH).toString();
}

export function getGroupEditRoute(id: string) {
  return new URLCombiner(getAccessControlModuleRoute(), GROUP_EDIT_PATH, id).toString();
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
