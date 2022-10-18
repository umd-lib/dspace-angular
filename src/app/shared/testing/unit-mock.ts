import { Unit } from 'src/app/core/eperson/models/unit.model';

export const UnitMock: Unit = Object.assign(new Unit(), {
  _name: 'testunitname',
  id: 'testunitid',
  uuid: 'testunitid',
  type: 'unit',
  _links: {
    self: {
        href: 'https://rest.api/server/api/eperson/units/testunitid',
    },
    groups: {  },
  },
});

export const UnitMock2: Unit = Object.assign(new Unit(), {
  _name: 'testunitname2',
  id: 'testunitid2',
  uuid: 'testunitid2',
  type: 'unit',
  _links: {
    self: {
        href: 'https://rest.api/server/api/eperson/units/testunitid2',
    },
    groups: {  },
  },
});
