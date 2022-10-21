import { GroupDtoModel } from 'src/app/core/eperson/models/group-dto.model';

export class UnitGroupDtoModel extends GroupDtoModel {
  /**
   * Whether or not this Group is a group of the Unit on the page it is being
   * used on.
   */
  public isInUnit: boolean;

  public object?: any;
}
