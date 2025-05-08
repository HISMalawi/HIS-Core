import { ConceptService } from './concept_service'
import HisDate from '@/utils/Date'
import { isEmpty }  from "lodash"

export interface ObsValue {
    concept_id: number;
    value_text?: string;
    value_coded?: number;
    value_datetime?: string;
    value_modifier?: string | null;
    value_boolean?: string;
    value_numeric?: number;
    obs_group_id?: number;
    obs_datetime?: string;
}

export interface Observation {
    encounter_id: number;
    observations: Array<ObsValue>;
}

export class ObservationService extends ConceptService {
    constructor() {
        super()
    }

    static get(obsID: number) {
        return super.getJson(`/observations/${obsID}`)
    }

    static create(data: Observation) {
        return super.postJson('/observations', data)     
    }

    static voidObs(obsID: number) {
        return super.void('observations/' + obsID, {})
    }

    static saveObs(encounterId: number, obs: ObsValue) {
        return this.create({
            'encounter_id': encounterId,
            observations: [obs]
        })
    }
    
    static saveObsArray(encounterId: number, obs: Array<ObsValue>) {
        return this.create({
            'encounter_id': encounterId,
            observations: obs
        })
    }

    static async buildValueCoded(conceptName: string, valueCoded: string | number, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        const coded = typeof valueCoded === 'number' ? valueCoded 
            : await ConceptService.getConceptID(valueCoded, true)
        return {
            'concept_id': concept,
            'value_coded': coded,
            'obs_datetime': date
        }
    }

    static async buildValueCodedFromConceptId(conceptName: string, valueCoded: number, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        return {
            'concept_id': concept,
            'value_coded': valueCoded,
            'obs_datetime': date
        }
    }

    static async buildValueText(conceptName: string, valueText: string, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        return {
            'concept_id': concept,
            'value_text': valueText,
            'obs_datetime': date
        }
    }

    static async buildValueNumber(
        conceptName: string, 
        value: number, 
        modifier: string | null = null, 
        orderId: number | null = null, 
        date=this.getSessionDate()) {
            const concept = await ConceptService.getConceptID(conceptName, true)
            const payload = {
                'concept_id': concept,
                'value_numeric': value,
                'obs_datetime': date
            }
            if (modifier) 
                Object.assign(payload, {'value_modifier': modifier})
            if (orderId) 
                Object.assign(payload, {'order_id': orderId})
            return payload
    }

    static async buildValueDate(conceptName: string, valueDate: string, date=this.getSessionDate()) {
        const concept = await ConceptService.getConceptID(conceptName, true)
        return {
            'concept_id': concept,
            'value_datetime': valueDate,
            'obs_datetime': date
        }
    }

    // Deprecated: use getObs instead
    static getObservations(patientID: number, conceptID: number) {
        return super.getJson(`/observations?person_id=${patientID}&concept_id=${conceptID}`)
    }

    static getObs(params: Record<string, string | number>) {
        return super.getJson('/observations', params)
    }

    static async getFirstObs(patientID: number, conceptName: string, date=this.getSessionDate(), conceptStrictMode=true) {
        const concept = await ConceptService.getConceptID(conceptName, conceptStrictMode)
        const obs = await ObservationService.getObs({
            'person_id': patientID, 
            'concept_id': concept, 
            'date': date,
            'page_size': 1
        })
        if (!isEmpty(obs)) {
            const [firstObs] = obs
            if (typeof firstObs['value_coded'] === 'number') {
                firstObs['value_coded'] = await ConceptService.getConceptName(firstObs['value_coded'])
            }
            return firstObs
        }
    }

    static obsInValidPeriod(obsObj: any) {
        return obsObj && ConceptService.getSessionDate() >= HisDate.toStandardHisFormat(obsObj.obs_datetime) 
    }

    static async getFirstObsValue(
        patientID: number, 
        conceptName: string, 
        obsAttr: 
            'value_coded' 
            | 'value_drug' 
            | 'value_date' 
            | 'value_text'
            | 'value_datetime'
            | 'value_numeric'
            | 'obs_datetime', 
        date=this.getSessionDate(),
        conceptStrictMode=true) {
            const obs = await this.getFirstObs(patientID, conceptName, date, conceptStrictMode) 
            if (!isEmpty(obs)) return obs[obsAttr]
        }
    
    static async getAll(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true){
        const concept = await ConceptService.getConceptID(conceptName, strictMode)
        const obs = await this.getObs({
            'person_id':  patientID, 
            'concept_id': concept,
            'date': date,
            'page_size': 14000
        })
        if (!isEmpty(obs)) return obs
    }

    static async getAllValueCoded(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true){
        const obs = await this.getAll(patientID, conceptName, date, strictMode)
        return !isEmpty(obs) ? Promise.all(obs.map((ob: any) => ConceptService.getConceptName(ob['value_coded']))) : []
    }

    static getFirstValueText(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        return this.getFirstObsValue(patientID, conceptName, 'value_text', date, strictMode)
    }

    static getFirstValueCoded(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        return this.getFirstObsValue(patientID, conceptName, 'value_coded', date, strictMode)
    }

    static getFirstValueNumber(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        return this.getFirstObsValue(patientID, conceptName, 'value_numeric', date, strictMode)
    }

    static getFirstValueDatetime(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        return this.getFirstObsValue(patientID, conceptName, 'value_datetime', date, strictMode)
    }
    static getFirstObsDatetime(patientID: number, conceptName: string, date=this.getSessionDate(), strictMode=true) {
        return this.getFirstObsValue(patientID, conceptName, 'obs_datetime', date, strictMode)
    }
    
    static async resolvePrimaryValue(obs: any) {
        let value: string | number = ''

        if (obs.value_datetime != null) {
            value = HisDate.toStandardHisDisplayFormat(obs.value_datetime)
        }

        if (obs.value_text != null) {
            value = obs.value_text
        }
        
        if (obs.value_numeric != null) {
            value = obs.value_numeric
        }

        if (obs.value_coded != null) {
            value = await super.getConceptName(obs.value_coded)
        }

        if (obs.value_modifier != null) {
            value = `${value} ${obs.value_modifier}`
        }

        return value
    }
}
