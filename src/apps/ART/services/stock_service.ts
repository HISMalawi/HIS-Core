import { Service } from "@/services/service";
import { isEmpty } from "lodash";

export class StockService extends Service {
    constructor() {
        super()
    }

    static async fetchAvailableDrugStock(drugId: number) {
        const stock = await this.getJson('pharmacy/items', { 'drug_id': drugId })
        if(isEmpty(stock)) return
        return stock.map((drug: any) => ({
            quantity: drug.current_quantity,
            packSize: drug.pack_size
        }));
    }
}
