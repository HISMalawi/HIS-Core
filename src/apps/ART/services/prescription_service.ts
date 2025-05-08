import { DrugInterface } from "@/interfaces/Drug";
import { DrugOrderService } from "@/services/drug_order_service";
import { Observation } from "@/interfaces/observation";
import HisDate from "@/utils/Date"
import { RegimenService } from "@/services/regimen_service";
import { isEmpty } from "lodash"
import { AppEncounterService } from "@/services/app_encounter_service"
import { toDate } from "@/utils/Strs";

export enum AdverseEffectsCategories {
    CONTRAINDICATION = "contraindication",
    SIDE_EFFECT = "side_effect"
}

export class PrescriptionService extends AppEncounterService {
    nextVisitInterval: number;
    fastTrack: boolean;
    regimenExtras: Array<Record<string, any>>;
    hangingPills: Array<Record<string, any>>;
    fastTrackMedications: Array<Record<string, any>>;
    medicationOrders: Array<number>;
    treatmentState: string;
    contraindications: Record<string, any>;
    sideEffects: Record<string, any>;
    tptPrescriptionCount: number;
    lastSideEffectDate: string;

    constructor(patientID: number, providerID: number) {
        super(patientID, 25, providerID) //TODO: Use encounter type reference name
        this.nextVisitInterval = 0
        this.fastTrack = false
        this.regimenExtras = []
        this.fastTrackMedications = []
        this.hangingPills = []
        this.medicationOrders = []
        this.treatmentState = ''
        this.contraindications = {}
        this.sideEffects = {}
        this.tptPrescriptionCount = 0
        this.lastSideEffectDate = ''
    }

    setNextVisitInterval(nextVisitInterval: number) {
        this.nextVisitInterval = nextVisitInterval
    }

    getHangingPills() {
        return this.hangingPills
    }

    getMedicationOrders() {
        return this.medicationOrders.map((i: number) => {
            return AppEncounterService.getCachedConceptName(i)
        })
    }

    getTptPrescriptionCount() {
        return this.tptPrescriptionCount
    }

    getLastSideEffectDate() {
        return this.lastSideEffectDate
    }

    getContraindications() { return this.contraindications }

    getSideEffects() { return this.sideEffects }

    getRegimenExtras() { return this.regimenExtras }

    getPatientRegimens() { return RegimenService.getRegimens(this.patientID) }

    getARVs() {
        return RegimenService.getJson('arv_drugs')
    }

    getCustomIngridients() { return RegimenService.getCustomIngridients() }

    getFastTrackMedications() { return this.fastTrackMedications }

    getTreatmentState() { return this.treatmentState }

    isFastTrack() { return this.fastTrack }

    medicationOrdersAvailable() { return !isEmpty(this.medicationOrders) }

    shouldPrescribeArvs() { 
        const arvs = AppEncounterService.getCachedConceptID("Antiretroviral drugs")
        return this.medicationOrders.includes(arvs)
    }

    shouldPrescribeExtras() {
        const extras = AppEncounterService.getConceptsByCategory('art_extra_medication_order')
        const extrasAvailable = extras.map((i: any) => this.medicationOrders.includes(i.concept_id))
        return extrasAvailable.some(Boolean)
    }

    getRegimenStarterpack(regimenCode: number, patientWeight: number) {
        const params = { weight: patientWeight, regimen: regimenCode }

        return AppEncounterService.getJson(
            `programs/${AppEncounterService.getProgramID()}/regimen_starter_packs`,
            params
        )
    }

    async getLvpDrugsByType(type: string, regimen: number) {
        return AppEncounterService.getJson(
            `programs/${AppEncounterService.getProgramID()}/regimens/${regimen}`,
            {
                'patient_id': this.patientID,
                'lpv_drug_type': type
            }
        )
    }

    async loadContraindications() {
        const contraindication = await AppEncounterService.getConceptID('Contraindications')
        const obs = await AppEncounterService.getObs({
            'concept_id': contraindication, 'person_id': this.patientID 
        })

        obs.forEach((o: any) => {
            const date = HisDate.toStandardHisFormat(o.obs_datetime)

            if (!this.contraindications[date]) this.contraindications[date] = []

            const concept = AppEncounterService.getCachedConceptName(o.value_coded)

            this.contraindications[date].push(concept)
        })
    }

    async loadDrugInduced() {
        const drugInduced = await AppEncounterService.getConceptID('Drug induced')
        const obs = await AppEncounterService.getObs({
            'concept_id': drugInduced, 'person_id': this.patientID 
        })

        if (!obs) return

        obs.forEach((o: any) => {
            const date = HisDate.toStandardHisFormat(o.obs_datetime)

            if (!this.lastSideEffectDate) this.lastSideEffectDate = date

            if (!o.value_drug || !o.value_coded) return

            if (!this.sideEffects[date]) this.sideEffects[date] = {}

            if (!this.sideEffects[date][o.value_drug]) this.sideEffects[date][o.value_drug] = []

            const concept = AppEncounterService.getCachedConceptName(o.value_coded)

            this.sideEffects[date][o.value_drug].push(concept)
        })
    }

    async loadTptPrescriptionCount() {
        const res = await AppEncounterService.getJson(
            `tpt_prescription_count`, {
                'patient_id': this.patientID,
                'date': this.date
            }
        )

        if (res) {
            const count = res.count + 1
            this.tptPrescriptionCount = count > 3 ? 3 : count
        } 
    }

    async loadFastTrackStatus() {
        const isFastTrack = await AppEncounterService.getFirstValueCoded(this.patientID, 'Fast track')
        const yes = await AppEncounterService.getConceptID('yes')

        if (isFastTrack) this.fastTrack = isFastTrack === yes
    }
    
    async loadRegimenExtras(date=this.date) {
        const meds = await RegimenService.getJson(
            `programs/${RegimenService.getProgramID()}/patients/${this.patientID}/dosages`,
            {date}
        )
        if (meds) this.regimenExtras = Object.values(meds)
    }

    async loadMedicationOrders() {
        const medicationOrders = await AppEncounterService.getConceptID("Medication orders")
        const orders = await AppEncounterService.getObs({
            'concept_id': medicationOrders,
            'date': this.date,
            'person_id': this.patientID,
            'page_size': 5
        })
        this.medicationOrders = orders.map((i: Observation) => i.value_coded)
    }

    async loadHangingPills() {
        const pills = (await AppEncounterService.getAll(this.patientID, 'Pills brought'))||[]
        this.hangingPills = pills.filter((o: any) => {
            if (o.value_numeric >= 1) {
                // Condition for detecting pills brought during transfer in.. This is a bit hack-ish
                if (o.value_drug && toDate(o.obs_datetime) === toDate(this.date)) {
                    return true
                }
                // This is for normal workflow adherence pills
                return o.order||false
            }
            return false
        }).map((o: any) => o?.order?.drug_order?.drug_inventory_id||o.value_drug)        
    }

    async loadFastTrackMedications() {
        const drugs = await DrugOrderService.getLastDrugsReceived(this.patientID)
        const withDosages = drugs.map(async(data: any) => {
            const { drug } = data
            const dosage = await DrugOrderService.getDrugDosages(this.patientID, drug.drug_id)
            return {
                'drug_id': drug.drug_id,
                'drug_name': drug.name,
                'units': drug.units,
                'am': dosage.am,
                'noon': dosage.noon,
                'pm': dosage.pm,
                'frequency': data.frequency
            }
        })
        this.fastTrackMedications = await Promise.all(withDosages)
    }

    async loadTreatmentState() {
        const params = { date: this.date }

        const req = await AppEncounterService.getJson(
            `programs/${AppEncounterService.getProgramID()}/patients/${this.patientID}/status`,
            params
        )

        if (req) this.treatmentState = req['status']
    }

    findAndGroupDrugSideEffects(drugs: Array<number>) {
        const allSideEffects: any = {}

        for (const date in this.sideEffects) {
            const drugInduced = this.sideEffects[date]

            for(const drug in drugInduced) {
                if (!drugs.includes(parseInt(drug))) continue

                if (!allSideEffects[date]) allSideEffects[date] = []

                allSideEffects[date] = [
                    ...allSideEffects[date], ...drugInduced[drug]
                ]
            }
        }
        return allSideEffects
    }

    calculatePillsPerDay(am: number, noon: number, pm: number) {
        return parseFloat(am.toString()) + noon + pm
    }

    estimatePackSize(pillsPerDay: number, packSize=0) {
        const packs = (pillsPerDay * this.nextVisitInterval) / (packSize || 1)
        
        let roundedPacks = Math.round(packs)

        if (roundedPacks <= 0) roundedPacks += 1

        return roundedPacks
    }

    calculateDosage(morningTabs: number, eveningTabs: number): number {
        let dose = 0
        if (eveningTabs === 0) dose = morningTabs

        if (morningTabs == 0) dose = eveningTabs

        if (morningTabs > 0 && eveningTabs  > 0) {
            dose = (morningTabs + eveningTabs) / 2
        }
        return dose
    }
    
    calculateEquivalentDosage(morningTabs: number, eveningTabs: number): number {
        return morningTabs + eveningTabs
    }

    calculateDateFromInterval() {
        const dateObj = new Date(this.date)
        dateObj.setDate(dateObj.getDate() + this.nextVisitInterval)
        return HisDate.toStandardHisFormat(dateObj)
    }

    getDrugPackSize(drug: any) {
        if (drug.pack_size) return drug.pack_size
        try{
            return drug.barcodes[0].tabs
        }catch(e) {
            return 30
        }
    }

    getInstructions(drugName: string, morningTabs: number, eveningTabs: number, units: string): string {
        return `${drugName} :- Morning: ${morningTabs} ${units}, Evening: ${eveningTabs} ${units}`
    }

    toOrderObj(id: number, name: string, units: string, am=0, pm=0, frequency=''): DrugInterface {
        return {
            'drug_inventory_id': id,
            'equivalent_daily_dose': this.calculateEquivalentDosage(am, pm),
            'start_date': this.date,
            'auto_expire_date': this.calculateDateFromInterval(), 
            'units': units,
            'instructions': this.getInstructions(name, am, pm, units),
            'dose': this.calculateDosage(am, pm),
            'frequency': frequency
        }
    }

    async getReasonForRegimenSwitch() {
        const reason = await AppEncounterService.getFirstValueText(this.patientID, 'Reason for ARV switch')
        return reason ? reason : 'N/A'
    }

    async createDrugOrder(drugOrders: Array<DrugInterface>) {
        return DrugOrderService.create({
            'encounter_id': this.encounterID,
            'drug_orders': drugOrders
        })
    }

    async createHangingPillsObs(response: string) {
        return this.saveValueTextObs('appointment type', response)
    }

    async createRegimenSwitchObs(reasonForSwitch: string): Promise<Observation> {
        return this.saveValueTextObs('Reason for ARV switch', reasonForSwitch)
    }
}
