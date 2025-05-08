import { ArtReportService } from "./art_report_service";

export class StockReportService extends ArtReportService {
    stock: Array<any>;
    constructor() {
        super()
        this.stock = []
    }   

    async loadStock() {
        this.stock = await this.getReport(`pharmacy/items`, { paginate: false })
        // this.stock = await ArtReportService.getJson()
    }
    
    getStockReport() {
        return ArtReportService.getJson(`pharmacy/stock_report`, { paginate: false })
    }

    getStockCardReport() {
        return this.getReport(`programs/${this.programID}/reports/stock_card`);
    }

    loadTrail() {
        return this.getReport('pharmacy/audit_trail/grouped')
    }

    getTrailDetails(date: string, drugId: number, transactionType: string) {
        return this.getReport('pharmacy/audit_trail', {
            'transaction_date': date,
            'drug_id': drugId,
            'transaction_reason': transactionType
        })
    }

    getScCurrReport() {
        return this.getReport('programs/1/reports/sc_curr')
    }

    getDiscrepancyReport () {
        return this.getReport(`programs/${this.programID}/reports/discrepancy_report`);
    }

    /**Code adapted from BHT-Core Art system */
    groupStock() {
        const pharmacyData: any = {};
        for (const index in this.stock) {
            const data = this.stock[index]
            const drugId = data["drug_id"];

            if (!pharmacyData[drugId]) {
                pharmacyData[drugId] = {
                    'current_quantity': 0,
                    'dispensed_quantity': 0,
                    'pack_size': data.pack_size,
                    'drug_name': data["drug_name"] === null ? data["drug_legacy_name"] : data["drug_name"]
                }
            }

            if (data.current_quantity === 0) continue;

            pharmacyData[drugId]["current_quantity"] += parseFloat(data.current_quantity);
            if (data.dispensed_quantity){
                pharmacyData[drugId]["dispensed_quantity"] += parseFloat(data.dispensed_quantity);
            }
        }
        return Object.values(pharmacyData).map((drug: any) => {
            let currentQuantity: any = '0'
            if(drug.pack_size == null) {
                currentQuantity  = drug.current_quantity + '(tabs)';
            }else {
                currentQuantity = Math.trunc(drug.current_quantity / drug.pack_size);
            }
            return {
                drugName: drug.drug_name,
                quantintyDispensed: drug.dispensed_quantity,
                currentQuantity,
                quantityIsTabs: drug.pack_size === null,
            }
        })
    }
}
