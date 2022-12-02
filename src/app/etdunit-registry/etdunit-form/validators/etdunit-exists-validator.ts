import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EtdUnitDataService } from '../../etdunit-data.service';
import { EtdUnit } from '../../models/etdunit.model';
import { getFirstSucceededRemoteListPayload } from 'src/app/core/shared/operators';

export class ValidateUnitExists {

  /**
   * This method will create the validator with the etdunitDataService requested from component
   * @param etdunitDataService the service with DI in the component that this validator is being utilized.
   * @return Observable<ValidationErrors | null>
   */
  static createValidator(etdunitDataService: EtdUnitDataService) {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
      return etdunitDataService.searchEtdUnits(control.value, {
        currentPage: 1,
        elementsPerPage: 100
      })
        .pipe(
          getFirstSucceededRemoteListPayload(),
          map((etdunits: EtdUnit[]) => {
            return etdunits.filter(etdunit => etdunit.name === control.value);
          }),
          map((etdunits: EtdUnit[]) => {
            return etdunits.length > 0 ? { etdunitExists: true } : null;
          }),
        );
    };
  }
}
