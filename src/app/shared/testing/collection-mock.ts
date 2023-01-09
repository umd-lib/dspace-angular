import { Collection } from '../../core/shared/collection.model';

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

export const CollectionMock2: Collection = Object.assign(new Collection(), {
  selfRegistered: false,
  permanent: false,
  _links: {
      self: {
          href: 'https://rest.api/server/api/core/collections/testcollectionid2',
      },
  },
  _name: 'testcollectionname2',
  id: 'testcollectionid2',
  uuid: 'testcollectionid2',
  type: 'collection2',
});
