import { AppEncounterService } from "@/services/app_encounter_service";
import { DrugOrderService } from "@/services/drug_order_service";
import { StockService } from "./stock_service";
import ART_PROP from '@/apps/ART/art_global_props';
// ripped from old ART system
export const DRUG_PACK_SIZES: Record<string, any> = {
    '11': [ 30 ],
    '21': [ 25 ],
    '22': [ 60 ],
    '24': [ 30, 60, 90, 100 ],
    '30': [ 90 ],
    '39': [ 60 ],
    '73': [ 120 ],
    '74': [ 60 ],
    '76': [ 1000 ],
    '297': [ 30, 60, 90 ],
    '576': [ 30, 60, 90 ],
    '613': [ 60 ],
    '731': [ 60 ],
    '732': [ 60 ],
    '733': [ 60 ],
    '734': [ 30 ],
    '735': [ 30 ],
    '736': [ 60 ],
    '738': [ 60 ],
    '931': [ 12, 30, 60 ],
    '932': [ 30 ],
    '954': [ 60 ],
    '963': [ 30, 60, 90 ],
    '968': [ 60 ],
    '969': [ 30 ],
    '971': [ 30,60,90 ],
    '976': [ 60 ],
    '977': [ 30 ],
    '982': [ 30 ],
    '983': [ 30, 90 ],
    '1039': [ 30,60,90 ],
    '1043': [ 60 ],
    '1044': [ 30],
    '1056': [ 24 ],
    '1216': [3, 6, 8, 12]
}

interface StockItem {
    quantity: number;
    packSize: number;
}

export class DispensationService extends AppEncounterService {
    drugHistory: Array<any>;
    currentDrugOrder: Array<any>;
    useDrugManagement: boolean; 
    constructor(patientID: number, providerID: number) {
        super(patientID, 54, providerID)
        this.drugHistory = []
        this.currentDrugOrder = []
        this.useDrugManagement = false
    }

    setIsDrugManagementEnabled(isEnabled: boolean) {
        this.useDrugManagement = isEnabled
    }

    async loadDrugManagementEnabled() {
        this.useDrugManagement = await ART_PROP.drugManagementEnabled()
    }

    getDrugHistory() {
        return this.drugHistory
    }

    getCurrentOrder() {
        return this.currentDrugOrder
    }

    buildDispensations(orderId: number, tabs: number, totalPacks: number) {
        const dispensations = []
        for(let i=0; i < totalPacks; i++) {
            dispensations.push({
                'drug_order_id': orderId,
                date: this.date,
                quantity: (tabs / totalPacks)
            })
        }
        return dispensations
    }

    saveDispensations(dispensations: Array<any>) {
        return AppEncounterService.postJson('/dispensations', { 
            dispensations, 
            'program_id': AppEncounterService.getProgramID()
        })
    }

    async voidOrder(orderId: number) {
        return AppEncounterService.void(`/dispensations/${orderId}`, {})
    }

    async loadDrugHistory() {
        try {
            this.drugHistory = (await DrugOrderService.getDrugOrderHistory(this.patientID))||[]
        } catch (e) {
            console.warn(e)
        }
    }

    async loadCurrentDrugOrder() {
        this.currentDrugOrder = (await DrugOrderService.getDrugOrders(this.patientID))||[]
        if (!this.useDrugManagement) return
        for(const order of this.currentDrugOrder) {
            const stocks = await StockService.fetchAvailableDrugStock(order.drug.drug_id)
            order.stocks = this.groupByPackSize(stocks);
        }
    }

    groupByPackSize(stocks?: Array<StockItem>): Array<StockItem> {
        const groupedItems = new Map<number, StockItem>();
        stocks?.forEach(({ packSize, quantity }) => {
            if(packSize) {
                if (groupedItems.has(packSize)) {
                    groupedItems.set(packSize, {
                        packSize,
                        quantity: quantity + (groupedItems.get(packSize)?.quantity ?? 0)
                    });
                } else {
                    groupedItems.set(packSize, { quantity, packSize });
                }
            }
        });
        return Array.from(groupedItems.values())
      }

    getDrugPackSizes(drugId: number) {
        if (drugId in DRUG_PACK_SIZES) {
            return DRUG_PACK_SIZES[drugId]
        }
        return [30, 60, 90]
    }

    // Ripped from old ART system for backwards compatibility purposes
    calcCompletePack(drug: any, units: number) {
        //sorting in an ascending order by tabs
        const drugOrderBarcodes = drug.barcodes.sort((a: any, b: any) => a.tabs - b.tabs); 
        if (drugOrderBarcodes.length == 0 || units == 0.0) return units;
        for (const i in drugOrderBarcodes) {
            const { tabs } = drugOrderBarcodes[i]
            if (parseInt(tabs) >= units) return tabs;
        }
        const completePack = parseInt(drugOrderBarcodes[drugOrderBarcodes.length - 1].tabs)
        return completePack
    }
}
