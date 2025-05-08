
import { Concept } from "./concept";
import { State } from "./state";

export interface ProgramWorkflow {
    program_workflow_id: number;
    program_id: number;
    concept_id: number;
    creator: number;
    date_created: Date;
    retired: number;
    changed_by: number;
    date_changed: Date;
    uuid: string;
    states: State[];
    concept: Concept;
}