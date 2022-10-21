import { ResourceType } from './resource-type';

/**
 * The resource type for CommunityGroup
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const COMMUNITY_GROUP = new ResourceType('communitygroup');
