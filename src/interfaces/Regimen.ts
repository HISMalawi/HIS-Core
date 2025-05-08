export interface RegimenInterface {
    drug_id: number;
    concept_id: number;
    drug_name: string;
    alternative_drug_name: string;
    am: number;
    noon: number;
    pm: number;
    units: string;
    concept_name: string;
    pack_size: number;
    barcodes: Array<Record<string, any>>;
    regimen_category: string;
}