import { ReasonForTest } from "./reasonForTest";

export interface Result {
    id:             number;
    indicator:      ReasonForTest;
    date:           Date;
    value:          number;
    value_type:     string;
    value_modifier: string;
}