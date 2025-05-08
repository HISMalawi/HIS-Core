import { DrugInterface } from "./Drug";

export interface DrugOrderInterface {
    'encounter_id': number;
    'drug_orders': Array<DrugInterface>;
}
