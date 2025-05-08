import { ArtReportService } from "./art_report_service";
import Url from "@/utils/Url";

export class TxReportService extends ArtReportService {
    org: string;
    initializeArvRefillReportTables: boolean;
    constructor() {
        super()
        this.org = 'pepfar'
        this.initializeArvRefillReportTables = true
    }

    initArvRefillPeriod(isInit: boolean) {
        this.initializeArvRefillReportTables = isInit
    }

    setOrg(org: string) {
        this.org = org
    }

    getClinicTxRtt() {
        return this.getReport(`programs/${this.programID}/reports/clinic_tx_rtt`)
    }

    getTxMMDClientLevelData(patients: Array<number>) {
        const params = Url.parameterizeObjToString({
            'start_date': this.startDate,
            'end_date': this.endDate,
            'program_id': this.programID,
            'date': this.date,
            'org': this.org
        })
        const url = `tx_mmd_client_level_data?${params}`
        return ArtReportService.postJson(url, { 'patient_ids': patients })
    }

    remapTxClientLevelData(clientData: Array<any>) {
        return clientData.map((d: any) => {
            let patient: any = null
            const drugs: Array<any> = []
            for(const regimenID in d) {
                const data: any = Object.values(d[regimenID])
                data.forEach((regimen: any) => {
                    for (const regimenIndex in regimen) {
                        const order = regimen[regimenIndex]
                        if (!patient) {
                            patient = {
                                id: order.arv_number,
                                dob: order.birthdate,
                                dispenseDate: order.start_date,  
                                artStartDate: order.art_start_date  
                            }
                        }
                        drugs.push({
                            name: order.drug_name, 
                            quantity: order.quantity,
                            dose: order.dose_per_day
                        })
                    }
                })
            }
            return { ...patient, drugs }
        })
    }

    getTxCurrMMDReport(rebuild=false, reportType='pepfar') {
        return this.getReport(`programs/${this.programID}/reports/tx_curr_mmd`, { 'definition': reportType, rebuild })
    }

    getTxMlReport(rebuild=false) {
        return this.getReport('tx_ml', { rebuild })
    }

    getTxNewReport(rebuildState: boolean) {
        return this.getReport(`programs/${this.programID}/reports/tx_new`, {
            rebuild:`${rebuildState}`
        })
    }

    getTxRttReport(rebuild=false) {
        return this.getReport('tx_rtt', {rebuild})
    }

    getMaternalStatus(patientIds: number[]) {
        const data: any = {
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            'program_id': this.programID,
            'report_definition': 'pepfar',
        }
        if (this.occupation) data['occupation'] = this.occupation
        const params = Url.parameterizeObjToString(data)
        return ArtReportService.postJson(`vl_maternal_status?${params}`, {
            'patient_ids': patientIds
        })
    }
}
