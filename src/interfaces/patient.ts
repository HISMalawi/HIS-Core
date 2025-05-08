import {Person} from '@/interfaces/person'
import {PatientIdentifier} from '@/interfaces/patientIdentifier'

export interface Patient {
    patient_id:          number;
    tribe:               null;
    creator:             number;
    date_created:        Date;
    changed_by:          null;
    date_changed:        null;
    voided:              number;
    voided_by:           null;
    date_voided:         null;
    void_reason:         null;
    person:              Person;
    patient_identifiers: PatientIdentifier[];
}