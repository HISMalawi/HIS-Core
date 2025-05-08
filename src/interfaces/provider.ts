export interface Provider {
    person_id:           number;
    gender:              string;
    birthdate:           null;
    birthdate_estimated: number;
    dead:                number;
    death_date:          null;
    cause_of_death:      null;
    creator:             number;
    date_created:        Date;
    changed_by:          number;
    date_changed:        Date;
    voided:              number;
    voided_by:           null;
    date_voided:         null;
    void_reason:         null;
    uuid:                string;
}