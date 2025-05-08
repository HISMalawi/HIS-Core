import { DrugCms } from "@/interfaces/drugCms";

export interface DrugInterface{
    drug_inventory_id: number;
    name: string;
    dose: number;
    drug?: any;
    dosage_struct?: any;
    order?: any;
    equivalent_daily_dose: number;
    frequency: string;
    start_date: string;
    auto_expire_date: string;
    instructions: string;
    units: string;
    quantity?: number;
    drug_cms?: DrugCms;
}