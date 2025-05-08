import {Name} from '@/interfaces/name'
import {PersonAttribute} from '@/interfaces/personAttribute'
import {Address} from '@/interfaces/address'
export interface Person {
    person_id:           number;
    gender:              string;
    birthdate:           Date;
    birthdate_estimated: number;
    dead:                number;
    death_date:          null;
    cause_of_death:      null;
    creator:             number;
    date_created:        Date;
    changed_by:          null;
    date_changed:        null;
    voided:              number;
    voided_by:           null;
    date_voided:         null;
    void_reason:         null;
    uuid:                string;
    names:               Name[];
    addresses:           Address[];
    person_attributes:   PersonAttribute[];
}