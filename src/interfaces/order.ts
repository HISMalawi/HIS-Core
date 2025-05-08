import { ReasonForTest } from "./reasonForTest";
import { Test } from "./test";

export interface Order {
    id:                   number;
    order_id:             number;
    encounter_id:         number;
    order_date:           Date;
    patient_id:           number;
    accession_number:     null | string;
    specimen:             ReasonForTest;
    requesting_clinician: null | string;
    target_lab:           null | string;
    reason_for_test:      ReasonForTest;
    tests:                Test[];
}