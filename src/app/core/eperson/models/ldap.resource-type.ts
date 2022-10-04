import { ResourceType } from '../../shared/resource-type';

/**
 * The resource type for Ldap
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */

export const LDAP = new ResourceType('ldap');
