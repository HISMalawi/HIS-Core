import { ObservationService, ObsValue } from "@/services/observation_service"
import { EncounterService } from "@/services/encounter_service"
import { Encounter } from "@/interfaces/encounter"
import { ConceptService } from "@/services/concept_service"

export class AppEncounterService extends ObservationService {
    encounterTypeID: number;
    programID: number;
    encounterID: number;
    providerID: number;
    patientID: number;
    date: string;
    constructor(patientID: number, encounterTypeID: number, providerID=-1) {
        super()
        this.encounterTypeID = encounterTypeID
        this.patientID = patientID
        this.encounterID = 0
        this.date = ObservationService.getSessionDate()
        this.providerID = providerID
        this.programID = ObservationService.getProgramID()
    }

    getDate() {
        return this.date
    }

    setDate(date: string) {
        this.date = date
    }

    setEncounterID(encounterID: number) {
        this.encounterID = encounterID
    }

    getEncounterID() {
        return this.encounterID
    }

    getFirstValueCoded(conceptName: string) {
        return AppEncounterService.getFirstValueCoded(this.patientID, conceptName, this.date)
    }

    getFirstValueNumber(conceptName: string) { 
        return AppEncounterService.getFirstValueNumber(this.patientID, conceptName, this.date)
    }

    async buildObs(conceptName: string, obj: Record<string, any>) {
        const obs: any = {
            ...obj,
            'person_id': this.patientID,
            'obs_datetime': this.date
        }

        obs['concept_id'] = await ConceptService.getConceptID(conceptName)

        if (typeof obj.value_coded === 'string') {
            obs['value_coded'] = await ConceptService.getConceptID(obj.value_coded)
        }

        return obs
    }

    buildValueText(conceptName: string, value: string) {
        return AppEncounterService.buildValueText(conceptName, value, this.date)
    }

    buildValueCoded(conceptName: string, value: string | number) {
        return AppEncounterService.buildValueCoded(conceptName, value, this.date)
    }

    buildValueCodedFromConceptId(conceptName: string, value: number) {
        return AppEncounterService.buildValueCodedFromConceptId(conceptName, value, this.date)
    }

    buildValueNumber(conceptName: string, value: number, modifier=null, orderId: number | null = null) {
        return AppEncounterService.buildValueNumber(conceptName, value, modifier, orderId, this.date)
    }

    buildValueDate(conceptName: string, value: string) {
        return AppEncounterService.buildValueDate(conceptName, value, this.date)
    }

    buildValueDateEstimated(conceptName: string, date: string) {
        return this.buildObs(conceptName, {
            'value_datetime': date,
            'value_text': 'Estimated'
        })
    }

    buildDateObs(conceptName: string, date: string, isEstimate: boolean) {
        if(/unknown/i.test(date)) return this.buildValueText(conceptName, 'Unknown');
        if(isEstimate) return this.buildValueDateEstimated(conceptName, date);
        return this.buildValueDate(conceptName, date);
    }

    async saveObservationList(obs: Array<ObsValue>) {
        return ObservationService.saveObsArray(this.encounterID, obs)
    }

    async saveValueTextObs(conceptName: string, value: string) {
        const obs: ObsValue = await ObservationService.buildValueText(
            conceptName, 
            value
        )
        return this.saveObs(obs)
    }

    async saveValueCodedObs(conceptName: string, value: string) {
        const obs: ObsValue = await ObservationService.buildValueCoded(
            conceptName, 
            value
        )
        return this.saveObs(obs)
    }

    async saveValueNumericObs(conceptName: string, value: number, modifier=null) {
        const obs: ObsValue = await ObservationService.buildValueNumber(
            conceptName, value, modifier
        )
        return this.saveObs(obs)
    }

    async saveValueDatetimeObs(conceptName: string, value: string) {
        const obs = await  ObservationService.buildValueDate(
            conceptName, value, ObservationService.getSessionDate()
        )
        return this.saveObs(obs)
    }

    async createEncounter():  Promise<Encounter | undefined>  {
        const payload: any = {
            'encounter_type_id': this.encounterTypeID,
            'patient_id': this.patientID,
            'encounter_datetime': this.date
        }
        if (this.providerID != -1) {
            payload['provider_id'] = this.providerID
        }
        const encounter = await EncounterService.create(payload)
        if (encounter) {
            this.encounterID = encounter.encounter_id
            await this.saveValueTextObs('Workstation location', ObservationService.getUserLocation()||'Unknown')
            if (AppEncounterService.getReasonForBDE()) {
                await this.saveValueTextObs('Reason for BDE', AppEncounterService.getReasonForBDE())
            }
            return encounter
        }
    }

    saveObs(obs: ObsValue) {
        return AppEncounterService.saveObs(this.encounterID, obs)
    }
}