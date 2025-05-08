import { AppEncounterService } from "@/services/app_encounter_service"
import { DrugInterface } from "@/interfaces/Drug"
import HisDate from "@/utils/Date"
import { isEmpty } from "lodash"
import { BPManagementService } from "./htn_service"
import dayjs from "dayjs"

export class AdherenceService extends AppEncounterService {
    lastDrugs: Array<DrugInterface>
    lastReceiptDate: string
    constructor(patientID: number, providerID: number) {
        super(patientID, 68, providerID) //TODO: Use encounter type reference name
        this.lastDrugs = []
        this.lastReceiptDate = ''
    }

    async loadPreviousDrugs(optimiseHangingPills=false) {
        const date = new Date(this.date)
        date.setDate(date.getDate() - 1) // we don't want current date to count
        const d = (date: string | Date) => HisDate.toStandardHisFormat(date)
        const drugs = await AppEncounterService.getJson(
            `patients/${this.patientID}/drugs_received`, { date: d(date) }
        )
        if (!isEmpty(drugs)) {
            this.lastReceiptDate = drugs.reduce((receiptDate: string | null,  drug: any) => {
                return !receiptDate || (new Date(d(drug.order.start_date)) > new Date(receiptDate))
                    ?  d(drug.order.start_date)
                    : receiptDate
            }, null)
            const htnDrugs = BPManagementService.htnDrugReferences().map((d: any) => d.drug_id)
            this.lastDrugs = drugs.filter((drug: DrugInterface) => 
                !htnDrugs.includes(drug.drug['drug_id']) && d(drug.order.start_date) === this.lastReceiptDate
            )
            if (optimiseHangingPills) {
                const lastPillCounts: Record<number, number> = (await this.getPreviousDrugPillCount()) || {}
                this.lastDrugs = this.lastDrugs.map((d: DrugInterface) => {
                    if (lastPillCounts[d.drug.drug_id] && d.quantity) {
                        d.quantity += lastPillCounts[d.drug.drug_id]
                    }
                    return d
                })
            }
        }
    }

    getReceiptDate() { return this.lastReceiptDate }

    getLastDrugs() { return this.lastDrugs }

    receivedDrugsBefore() { return !isEmpty(this.lastDrugs) }

    buildPillCountObs(orderId: number, pillCount: number) {
        return this.buildValueNumber('Number of tablets brought to clinic', pillCount, null, orderId)
    }
    
    getPreviousDrugPillCount() {
        return AppEncounterService.getJson('last_drugs_pill_count', {
            'patient_id': this.patientID,
            'program_id': this.programID,
            'date': this.lastReceiptDate
        })
    }

    async buildAdherenceObs(orderId: number, drugId: number, adherence: number, date=AppEncounterService.getSessionDate()) {
        const concept = await AppEncounterService.getConceptID('Drug adherence', true)
        return {
            'concept_id': concept,
            'value_numeric': adherence,
            'value_drug': drugId,
            'value_modifier': '%',
            'order_id': orderId,
            'person_id': this.patientID,
            'obs_datetime': date
        }
    }

    isAdherenceGood(adherence: number) {
        return adherence >= 95 && adherence <= 105
    }

    calculateAdherence(given: number, pills: number, expected: number) {
        return Math.round(100 * (given - pills) / (given - expected));
    }

    calculateExpected(
        given: number, 
        equivalentDailyDose: number, 
        startDate: string, 
        frequency: 'QOD' | 'QW'
    ) {
        const timeUnit = frequency === 'QW' ? 'week' : 'day'
        const daysGone = this.calcTimeElapsed(startDate, timeUnit);
        return (given - (daysGone * parseFloat(equivalentDailyDose.toString())));
    }

    calcTimeElapsed(date1: string, timeUnit: 'week' | 'day') {
        // Consider this example: 2022-01-28 to 2022-01-01 diff is supposed to give us a difference of 28 days. 
        // However, dayjs calculates it as a difference of 27 days. Adding a one to correct this issue for a better calculation
        return dayjs(HisDate.toStandardHisFormat(this.date)).diff(HisDate.toStandardHisFormat(date1), timeUnit) + 1
    }

    calculateUnaccountedOrMissed(expected: string, actual: string) {
        const exp = (parseFloat(expected) - parseFloat(actual));
        return (exp < 0 ? ((exp * -1) + ' missed') : (exp + ' unacc'));
    }
}
