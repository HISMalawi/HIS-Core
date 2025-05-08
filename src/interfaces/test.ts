import { Result } from "./result";

export interface Test {
    id:         number;
    concept_id: number;
    name:       string;
    result:     Result[];
}