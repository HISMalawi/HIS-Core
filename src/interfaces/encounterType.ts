export interface EncounterType {
    encounter_type_id: number;
    name:              string;
    description:       string;
    creator:           number;
    date_created:      Date;
    retired:           number;
    retired_by:        null;
    date_retired:      null;
    retire_reason:     null;
    uuid:              string;
}