import { Service } from "@/services/service";
import { Patientservice } from "@/services/patient_service";
import ART_PROP from "../art_global_props";
import { printArtFilingNumberLbl } from "../Labels";

export class FilingNumberService extends Service {
    patientID: number;
    activePrefix: string;
    dormantPrefix: string;

    constructor() {
        super()
        this.patientID = 0
        this.activePrefix = ''
        this.dormantPrefix = ''
    }

    getActivePrx() {
        return this.activePrefix
    }

    getDormantPrx() {
        return this.dormantPrefix
    }

    getPatientID() {
        return this.patientID
    }

    setPatientID(patientID: number) {
        this.patientID = patientID
    }

    formatNumber(num: string) {
        const prefix = num.search(this.activePrefix) >= 0 
            ? this.activePrefix
            : num.search(this.dormantPrefix) >= 0 
            ? this.dormantPrefix
            : ''
        return prefix ? num.substring(prefix.length, num.length) : num
    }

    async loadFilingPrefix() {
        const prx = await ART_PROP.filingNumberPrefix()
        if (prx) {
            const [activePrefix, dormantPrefix] = prx.split(',')
            this.activePrefix = activePrefix
            this.dormantPrefix = dormantPrefix
        }
    }

    isActiveFilingNum(filingNumber: string) {
        return filingNumber.match(new RegExp(this.activePrefix, 'i'))
            ? true
            : false
    }

    isDormantFilingNum(filingNumber: string) {
        return filingNumber.match(new RegExp(this.dormantPrefix, 'i'))
            ? true
            : false
    }

    async assignFilingNumber() {
        return Service.postJson(`patients/${this.patientID}/filing_number`, {})
    }

    async getFilingNumber(filingNumber: string) {
        const identifier = `${this.activePrefix}${filingNumber}`
        const res = await Service.getJson(`search/patients/by_identifier`, {
            'type_id': 17, 
            'identifier': identifier
        })
        if (res) {
            return res.map((person: any) => {
                const patient = new Patientservice(person)
                return {
                    identifier,
                    'patient_id': patient.getID(),
                    'given_name': patient.getGivenName(),
                    'family_name': patient.getFamilyName(),
                    'state': 'N/A',
                    'appointment_date': ''
                }
            })
        }
        return []
    }

    archiveFilingNumber() {
        return Service.getJson(`archive_active_filing_number`, {
            'patient_id': this.patientID
        })
    }

    archivePatient(secondaryPatient: number, identifier: string | number) {
        return Service.postJson('swap_active_number', {
            'primary_patient_id': this.patientID,
            'secondary_patient_id': secondaryPatient,
            identifier
        })
    }

    getArchivingCandidates(page=0, pageSize=10) {
        return Service.getJson(`archiving_candidates`, {
            page,'page_size': pageSize
        })
    }

    getPastFilingNumbers() {
        return Service.getJson(`patients/${this.patientID}/past_filing_numbers`)
    }

    printFilingNumber() {
        return printArtFilingNumberLbl(this.patientID)
    }
}