import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';

import { UnitDataService } from 'src/app/core/eperson/unit-data.service';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { getFirstSucceededRemoteListPayload } from 'src/app/core/shared/operators';

export class ValidateUnitExists {

  /**
   * This method will create the validator with the unitDataService requested from component
   * @param unitDataService the service with DI in the component that this validator is being utilized.
   * @return Observable<ValidationErrors | null>
   */
  static createValidator(unitDataService: UnitDataService) {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return unitDataService.searchUnits(control.value, {
            currentPage: 1,
            elementsPerPage: 100
          })
        .pipe(
          getFirstSucceededRemoteListPayload(),
          map( (units: Unit[]) => {
            return units.filter(unit => unit.name === control.value);
          }),
          map( (units: Unit[]) => {
            return units.length > 0 ? { unitExists: true } : null;
          }),
        );
    };
  }
}
