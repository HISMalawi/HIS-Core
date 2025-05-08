import { AppEncounterService } from "@/services/app_encounter_service";
import { DrugOrderService } from "@/services/drug_order_service";
import { isEmpty } from "lodash";
import HisDate from "@/utils/Date"

export interface AncTreatmentDrugObject {
    'id': number;
    'drug_name': string;
    'dose': string;
    'duration': number;
    'frequency': string;
    'units': string;
}

export const DRUG_FREQUENCIES: Record<string, number> = { 
    'Once a day (OD)' : 1,
    'Twice a day (BD)': 2,
    'Three a day (TDS)': 3,
    'Four times a day (QID)' : 4,
    'Five times a day (5X/D)' : 5,
    'Six times a day (Q4HRS)' : 6,
    'In the morning (QAM)' : 1,
    'Once a week (QWK)' : 1,
    'Once a month' : 1,
    'Twice a month' : 2
}

export class AncTreatmentService extends AppEncounterService {
    constructor(patientID: number, providerID: number){
        super(patientID, 25, providerID)
    }

    vaccinationDrugObj() {
        return {
            'drug_inventory_id': 609,
            'dose': 0.5,
            'equivalent_daily_dose': 0.5,
            'frequency': "Once a day (od)",
            'start_date': this.date,
            'auto_expire_date': this.date,
            'instructions': "Once a day",
            'units': "ml"
        }
    }

    async updateVaccinationOrder() {
        const dispensed = await this.dispenseVaccinationDrug()
        if (!isEmpty(dispensed)) {
            const orderID = dispensed[0].order_id
            return DrugOrderService.updateDispensationOrders([{'order_id': orderID, 'quantity' : 1}])
        }
        throw 'Unable to dispense'
    }

    dispenseVaccinationDrug() {
        return this.createOrders([this.vaccinationDrugObj()])
    }

    createOrders(orders: any) {
        return DrugOrderService.create({
            'drug_orders': orders,
            'encounter_id': this.getEncounterID(),
        })
    }

    async submitTreatment(drugs: AncTreatmentDrugObject[]) {
        await this.createEncounter()
        const orders = await this.createOrders(drugs.map(o => this.buildDrugOrderObj(o)))
        const dispensation = new AppEncounterService(this.patientID, 54, this.providerID)
        await dispensation.createEncounter()
        drugs.forEach(drug => {
            orders.forEach((order: any) => { 
                if (order.drug_inventory_id === drug.id) {
                    order.quantity = this.calculateAmountNeeded(drug);
                }
            })
        })
        await DrugOrderService.updateDispensationOrders(orders)
    }

    calculateAmountNeeded(drug: any) {
        const dosage = this.calculateDosage(drug);
        const dailyEquivalentDose =  this.calculateDailyEquivalentDose(drug, dosage);
        let amount = (drug.duration * (dailyEquivalentDose || 1) - (drug.quantity || 0));
        return Math.max(0, Math.ceil(amount)); 
    }
    
    calculateDosage(drug: AncTreatmentDrugObject) {
        return parseFloat(drug.dose || `${DRUG_FREQUENCIES[drug.frequency]}`);
    }

    calculateDailyEquivalentDose(drug: AncTreatmentDrugObject, dose: number) {
        return dose * DRUG_FREQUENCIES[drug.frequency]
    }

    buildDrugOrderObj(drug: AncTreatmentDrugObject) {
        const startDate = new Date(this.date)
        const expiryDate = startDate.setDate(startDate.getDate() + parseInt(`${drug.duration}`))
        const dose: any = this.calculateDosage(drug);
        return {
            'drug_inventory_id': drug.id,
            'dose': dose,
            'frequency': drug.frequency,
            'start_date': this.date,
            'auto_expire_date': HisDate.toStandardHisFormat(new Date(expiryDate)),
            'equivalent_daily_dose': this.calculateDailyEquivalentDose(drug, dose),
            'instructions': drug.drug_name + ':' + drug.dose + ' ' + drug.units + ' ' + drug.frequency,
            'units': drug.units
        }
    }
}