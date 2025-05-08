import { Service } from '@/services/service'
import { isEmpty } from 'lodash';
import HisDate from "@/utils/Date"
import { Patientservice } from './patient_service';
import GLOBAL_PROP from '@/apps/GLOBAL_APP/global_prop';
import { printNpidLbl } from '@/views/Labels';

export interface DDESearchDemographics {
    given_name: string;
    family_name: string;
    gender: string;
}

export class PatientDemographicsExchangeService extends Service {
    patientID: number;
    enabled: boolean;
    constructor() {
        super()
        this.patientID = -1
        this.enabled = false
    }

    static getRemainingNpids() {
        return Service.getJson('dde/patients/remaining_npids', {
            'program_id': Service.getProgramID()
        })
    }

    setPatientID(patientID: number) {
        this.patientID = patientID
    }

    async loadDDEStatus() {
        this.enabled = await GLOBAL_PROP.ddeEnabled()
    }

    isEnabled() {
        return this.enabled
    }

    importPatient(docID: string) {
        return Service.getJson('dde/patients/import_by_doc_id', {
            'doc_id': docID,
            'program_id': Service.getProgramID()
        })
    }

    postMerge(persons: Array<any>) {
        const [primary, ...secondary] = persons.map((p) => {
            return {
                'patient_id': p.patientID,
                'doc_id': p.docID || ''
            }
        })
        this.patientID = primary.patient_id
        return this.mergePatients({
            primary,  secondary,
            'program_id': Service.getProgramID()
        })
    }

    checkPotentialDuplicates(params: Record<string, any>) {
        return Service.getJson(`dde/patients/match_by_demographics`, {
            ...params, 'program_id': Service.getProgramID()
        }) 
    }

    /** Detects duplicates in patients */
    hasPatientDoubles(patients: Array<any>) {
        return patients.map(
            (i: any) => patients.map(p => p.patient_id)
                .includes(i.patient_id
        )).some(Boolean)
    }

    /**
     * 
     * @param npid 
     * @returns 
     */
    async searchDemographics(demographics: DDESearchDemographics) {
        const req = await Service.getJson(`dde/patients/find_by_name_and_gender`, {
            'program_id': Service.getProgramID(),
            ...demographics,
        })
        const mapResults = (d: any, type: string) => {
            const p = new Patientservice(d)
            return {
                'patient_type': type,
                'doc_id': p.getPatientIdentifier(27),
                ...d,
            }
        }
        if (req) {
            const locals = req.locals.map((i: any) => mapResults(i, 'Local'))
            const remotes = req.remotes.map((i: any) => mapResults(i, 'Remote'))
            return locals.concat(remotes)
        }
        return []
    }
    /**
     * Searches and returns result object combining local and remote details
     * @param npid 
     */
    async searchNpid(npid: string): Promise<Array<any>> {
        const ddeSearch = await this.findNpid(npid)
        if (ddeSearch) {
            const results = ddeSearch.locals.concat(ddeSearch.remotes)
            if (isEmpty(results)) {
                return []
            }
            const hasLocalDoubles = this.hasPatientDoubles(
                ddeSearch.locals
            )
            const hasRemoteDoubles = this.hasPatientDoubles(
                ddeSearch.remotes
            )
            this.patientID = results[0].patient_id
            return !(hasLocalDoubles || hasRemoteDoubles)
                ? results[0]
                : results
        } 
        return []
    }

    findNpid(npid: string) {
        return Service.getJson('dde/patients/find_by_npid', {
            'npid': npid, 'program_id': Service.getProgramID()  
        })
    }

    findVoidedIdentifier(npid: string) {
        return Service.getJson(`search/patients/by_identifier`,{
            'type_id': 3, 
            'voided': true,
            'identifier':npid 
        })
    }

    shouldCreateNpid(diffs: any) {
        return !isEmpty(diffs) && diffs.npid
    }

    formatDiffValuesByType(
        diffs: Record<string, {remote?: any; local?: any}>, 
        by: 'local' | 'remote') 
        {
            const formatted: any = {}
            for(const i in diffs) {
                formatted[i] = diffs[by]
            }
            return formatted
        }

    diffsToTurple(diffs: any) {
        const turple: any = []
        const formatValue: any = (label: string, value: string) => {
            // Detect date labels and format them
            return typeof value === 'string' && label.match(/date/i) 
                ? HisDate.toStandardHisDisplayFormat(value)
                : value
        }
        for(const index in diffs) {
            const diff = diffs[index]
            const label = index
                .split('_')
                .map((word: string) => word.charAt(0)
                    .toUpperCase()+ word.slice(1))
                    .join(' ')
            turple.push([
                label, 
                formatValue(index, diff.local), 
                formatValue(index, diff.remote)
            ])
        }
        return turple
    }

    shouldUpdateDiffs(diffs: any) {
        return !isEmpty(diffs)
    }

    mergePatients(params: Record<string, any>) {
        return Service.postJson('dde/patients/merge', params)
    }

    reassignNpid(docID: string, patientID=this.patientID) {
        return Service.postJson('dde/patients/reassign_npid', {
            'program_id': Service.getProgramID(),
            'patient_id': patientID,
            'doc_id': docID
        })
    }

    createNPID(npid: string) {
        return Service.postJson('patient_identifiers', {
            'identifier': npid,
            'patient_id': this.patientID,
            'identifier_type': 3
        })
    }

    printNpid(id=this.patientID) {
        return printNpidLbl(id)
    }

    getLocalAndRemoteDiffs() {
        return Service.getJson('dde/patients/diff', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    } 

    updateLocalDifferences(diff: any) {
        return Service.putJson(`people/${this.patientID}`, {
            'program_id': Service.getProgramID(), ...diff
        })
    }

    refreshDemographics() {
        return Service.getJson('dde/patients/refresh', {
            'patient_id': this.patientID, 
            'program_id': Service.getProgramID()
        })
    }
}
