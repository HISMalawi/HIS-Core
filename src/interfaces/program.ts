export interface Program {
    program_id:   number;
    concept_id:   number;
    creator:      number;
    date_created: Date;
    changed_by:   number;
    date_changed: Date;
    retired:      number;
    name:         string;
    description:  string;
    uuid:         string;
}