import { Observation } from "./observation";
import { Patient } from "./patient";
import { Program } from "./program";
import { Provider } from "./provider";
import { EncounterType } from "./encounterType"
import { Location } from "./location"
export interface Encounter {
    encounter_id:       number;
    encounter_type:     number;
    patient_id:         number;
    provider_id:        number;
    location_id:        number;
    form_id:            null;
    encounter_datetime: Date;
    creator:            number;
    date_created:       Date;
    voided:             number;
    voided_by:          null;
    date_voided:        null;
    void_reason:        null;
    uuid:               string;
    changed_by:         null;
    date_changed:       null;
    program_id:         number;
    type:               EncounterType;
    patient:            Patient;
    location:           Location;
    provider:           Provider;
    program:            Program;
    observations:       Observation[];
}

