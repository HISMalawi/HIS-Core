import { Concept } from "./concept";

export interface State {
    program_workflow_state_id: number;
    program_workflow_id:       number;
    concept_id:                number;
    initial:                   number;
    terminal:                  number;
    creator:                   number;
    date_created:              Date;
    retired:                   number;
    changed_by:                null;
    date_changed:              Date;
    uuid:                      string;
    name:                      string;
    concept:                   Concept;
}