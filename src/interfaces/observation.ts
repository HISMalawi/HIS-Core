import { Concept } from "@/interfaces/concept";
import { DrugInterface } from "@/interfaces/Drug";

export interface Observation {
    obs_id:              number;
    person_id:           number;
    concept_id:          number;
    encounter_id:        number;
    order_id:            null;
    obs_datetime:        Date;
    location_id:         number | null;
    obs_group_id:        null;
    accession_number:    null;
    value_group_id:      null;
    value_boolean:       null;
    value_coded:         null;
    value_coded_name_id: null;
    value_drug:          null;
    value_datetime:      Date;
    value_numeric:       null;
    value_modifier:      null;
    value_text:          null;
    date_started:        null;
    date_stopped:        null;
    comments:            null | string;
    creator:             number;
    date_created:        Date;
    voided:              number;
    voided_by:           null;
    date_voided:         null;
    void_reason:         null;
    value_complex:       null;
    uuid:                string;
    concept:             Concept;
    children:            Observation[];
    drug:                DrugInterface;
}



