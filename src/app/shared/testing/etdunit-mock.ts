import { EtdUnit } from 'src/app/etdunit-registry/models/etdunit.model';
import { CollectionMock } from './collection-mock';

export const EtdUnitMock: EtdUnit = Object.assign(new EtdUnit(), {
  _name: 'testetdunitname',
  id: 'testetdunitid',
  uuid: 'testetdunitid',
  type: 'etdunit',
  _links: {
    self: {
      href: 'https://rest.api/server/api/eperson/etdunits/testetdunitid',
    },
    collections: {},
  },
});

export const EtdUnitMock2: EtdUnit = Object.assign(new EtdUnit(), {
  _name: 'testetdunitname2',
  id: 'testetdunitid2',
  uuid: 'testetdunitid2',
  type: 'etdunit',
  _links: {
    self: {
      href: 'https://rest.api/server/api/eperson/etdunits/testetdunitid2',
    },
    collections: {},
  },
});

export const EtdUnitMockWithCollection: EtdUnit = Object.assign(new EtdUnit(), {
  _name: 'testetdunitid3_with_collection',
  id: 'testetdunitid3_with_collection',
  uuid: 'testetdunitid3_with_collection',
  type: 'etdunit',
  collections: [CollectionMock],
  _links: {
    self: {
      href: 'https://rest.api/server/api/eperson/etdunits/testetdunitid3_with_collection',
    },
    collections: { href: 'https://rest.api/server/api/eperson/etdunits/testetdunitid3_with_collection/collections' },
  },
});
