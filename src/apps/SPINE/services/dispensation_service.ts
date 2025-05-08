import { AppEncounterService } from "@/services/app_encounter_service";
import { DrugOrderService } from "@/services/drug_order_service";

export class DispensationService extends AppEncounterService {
  drugHistory: Array<any>;
  currentDrugOrder: Array<any>;

  constructor(patientID: number, providerID: number) {
    super(patientID, 54, providerID)
    this.drugHistory = []
    this.currentDrugOrder = []
  }

  getDrugHistory() {
    return this.drugHistory
  }

  getCurrentOrder() {
    return this.currentDrugOrder
  }

  buildDispensations(orderId: number, quantity: number) {
    return [{
      'drug_order_id': orderId,
      date: this.date,
      quantity: quantity
    }]
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
    const res = await DrugOrderService.getDrugOrderHistory(this.patientID)
    if (res) {
      this.drugHistory = res
    }
  }

  async loadCurrentDrugOrder() {
    const res = await DrugOrderService.getDrugOrders(this.patientID)
    if (res) {
      this.currentDrugOrder = await Promise.all(res)        
    }
  }

  calcCompletePack(drug: any, units: number) {
     //sorting in an ascending order by tabs
    const drugOrderBarcodes = drug.barcodes.sort(function (a: any, b: any) {
      return a.tabs - b.tabs;
    });
    if (drugOrderBarcodes.length == 0 || units == 0.0) {
      return units;
    }
    for (let i = 0; i <= drugOrderBarcodes.length - 1; i++) {
      if (parseInt(drugOrderBarcodes[i].tabs) >= units) {
        return drugOrderBarcodes[i].tabs;
      }
    }
    const smallestAvailableTab = parseInt(drugOrderBarcodes[0].tabs)
    let completePack = parseInt(drugOrderBarcodes[drugOrderBarcodes.length - 1].tabs)
    while (completePack < units) {
      completePack += smallestAvailableTab
    }
    return completePack
  }
}
