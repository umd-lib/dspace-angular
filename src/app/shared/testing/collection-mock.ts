import { Collection } from '../../core/shared/collection.model';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';

export const CollectionMock: Collection = Object.assign(new Collection(), {
    selfRegistered: false,
    permanent: false,
    _links: {
        self: {
            href: 'https://rest.api/server/api/core/collections/testcollectionid',
        },
    },
    _name: 'testcollectionname',
    id: 'testcollectionid',
    uuid: 'testcollectionid',
    type: 'collection',
});
