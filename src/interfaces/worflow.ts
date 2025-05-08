export interface WorkflowInterface {
    encounter_type_id: number;
    name: string;
    description: string;
    creator: number;
    date_created: string;
    retired: number;
    retired_by?: string;
    date_retired?: string;
    retire_reason?: string;
    uuid: string;
}
