import {ConceptName} from '@/interfaces/conceptName'
export interface Concept {
    concept_id:     number;
    retired:        number;
    short_name:     string;
    description:    string;
    form_text:      null;
    datatype_id:    number;
    class_id:       number;
    is_set:         number;
    creator:        number;
    date_created:   Date;
    default_charge: null;
    version:        string;
    changed_by:     number;
    date_changed:   Date;
    retired_by:     null;
    date_retired:   null;
    retire_reason:  null;
    uuid:           string;
    concept_names:  ConceptName[];
}