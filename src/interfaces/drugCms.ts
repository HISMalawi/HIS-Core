export interface DrugCms {
    drug_inventory_id: number;
    name: string;
    code: string;
    short_name: string;
    tabs: string;
    pack_size: number;
    weight: number;
    strength: number;
    voided: boolean;
    date_voided: Date;
    void_reason: string;
    created_at: Date;
    updated_at: Date;  
    id: number;
}