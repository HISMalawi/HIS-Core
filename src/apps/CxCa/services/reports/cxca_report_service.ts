import { Service } from "@/services/service";
import HisDate from "@/utils/Date"

export interface QuarterInterface {
    name: string;
    start: string;
    end: string;
}

export const AGE_GROUPS = [
    '15-19 years', '20-24 years',
    '25-29 years', '30-34 years',
    '35-39 years', '40-44 years',
    '45-49 years', '50 plus years'
]

interface ReportParams {
    report_name: string;
    screening_method?: string;
}

export class CxCaReportService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;
    constructor() {
        super()
        this.endDate = ''
        this.startDate = ''
        this.date = Service.getSessionDate()
        this.programID = Service.getProgramID()
    }

    getPepfarReport(reportName: string) {
        return this.getReport('pepfar_cxca', {'report_name': reportName})
    }

    getClinicReport(reportName: string, screeningMethod: string) {
        return this.getReport('screened_for_cxca', {'report_name': reportName, 'screening_method': screeningMethod})
    }

    getMohReport(reportName: string) {
        return this.getReport('screened_for_cxca', {'report_name': reportName})
    }
    
    getDateIntervalPeriod() {
        return `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
    }

    setStartDate(startDate: string) {
        this.startDate = startDate
    }  

    setEndDate(endDate: string) {
        this.endDate = endDate
    }

    getReportPeriod() {
        return this.startDate && this.endDate
         ? `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
         : '-'
    }

    getReport(url: string, params: ReportParams) {
        return Service.getJson(url, this.buildRequest(params))
    }

    buildRequest(config: Record<string, any> = {}) {
        const payload: any = {'date': this.date, 'program_id': 24}
        if (this.startDate && this.endDate) {
            payload['start_date'] = this.startDate
            payload['end_date'] = this.endDate
        }
        return { ...payload, ...config }
    }

    static getReportQuarters(minDuration= 4) {
        const quarters: Array<QuarterInterface> = []
        let year = HisDate.getCurrentYear()
        for(let i=0; i < minDuration; ++i) {
            quarters.push({ name: `Q4 ${year}`, start: `${year}-10-01`, end: `${year}-12-31` })
            quarters.push({ name: `Q3 ${year}`, start: `${year}-07-01`, end: `${year}-09-30` })
            quarters.push({ name: `Q2 ${year}`, start: `${year}-04-01`, end: `${year}-06-30` })
            quarters.push({ name: `Q1 ${year}`, start: `${year}-01-01`, end: `${year}-03-31` })
            --year
        }
        return quarters
    }
}
