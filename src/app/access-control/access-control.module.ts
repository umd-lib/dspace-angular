import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AccessControlRoutingModule } from './access-control-routing.module';
import { EPeopleRegistryComponent } from './epeople-registry/epeople-registry.component';
import { EPersonFormComponent } from './epeople-registry/eperson-form/eperson-form.component';
import { GroupFormComponent } from './group-registry/group-form/group-form.component';
import { MembersListComponent } from './group-registry/group-form/members-list/members-list.component';
import { SubgroupsListComponent } from './group-registry/group-form/subgroup-list/subgroups-list.component';
import { GroupsRegistryComponent } from './group-registry/groups-registry.component';
import { FormModule } from '../shared/form/form.module';
// UMD Customization
import { UnitFormComponent } from './unit-registry/unit-form/unit-form.component';
import { UnitGroupsListComponent } from './unit-registry/unit-form/unit-group-list/unit-groups-list.component';
// End  UMD Customization

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AccessControlRoutingModule,
    FormModule
  ],
  declarations: [
    EPeopleRegistryComponent,
    EPersonFormComponent,
    GroupsRegistryComponent,
    GroupFormComponent,
    SubgroupsListComponent,
    MembersListComponent,
    // UMD Customization
    UnitFormComponent,
    UnitGroupsListComponent
    // End UMD Customization
  ]
})
/**
 * This module handles all components related to the access control pages
 */
export class AccessControlModule {

}
