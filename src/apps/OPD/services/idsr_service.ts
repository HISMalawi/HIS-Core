import { OpdReportService } from "./opd_report_service";
import { Service } from "@/services/service";

export interface CohortValidationInterface {
    param: number | string;
    error: (indicator: number, param: number) => string;
    check: (indicator: number, param: number) => boolean;
}

export interface CommonInterface {
    name: string;
    start: string;
    end: string;
}

export class IDSRReportService extends OpdReportService {
    regenerate: boolean;
    constructor() {
        super()
        this.regenerate = false
    }

    setRegenerate(regenerate: boolean) {
        this.regenerate = regenerate
    }

    requestIDSRWeekly() {
        return this.getReport('generate_weekly_idsr_report', {
            request: 'true',
        })
    }

    requestIDSRMonthly() {
        return this.getReport('generate_monthly_idsr_report', {
            request: 'true',
        })
    }

    requestIDSRQuarterly() {
        return this.getReport('generate_quarterly_idsr_report')
    }

    renderResults(params: any) {
        const all = []
        let count = 1
        for (const [key, value] of Object.entries(params)) {
            const temp: any = []
            const condition: any = value
            const item = {
                id: 0,
                name: '',
                lessThanFiveYears: '',
                lessThanFiveYearsPatientIds: '',
                greaterThanEqualFiveYears: '',
                greaterThanEqualFiveYearsPatientIds: '',
                total: 0,
                totalPatientIds: ''
            }
            item.name = key
            let total = 0
            item.id = count
            count += 1 
            for (const [key1, value1] of Object.entries(condition)) {
                const conditionDetails: any = value1
                if (conditionDetails != null) {
                    total +=conditionDetails.length;
                    item.total = total
                    if(conditionDetails.length) {
                        temp.push(...conditionDetails)
                        item.totalPatientIds = temp
                    }
                    if (key1 == '<5yrs') {
                    item.lessThanFiveYears = conditionDetails.length
                    item.lessThanFiveYearsPatientIds = conditionDetails
                    }
                if (key1 == '>=5yrs') {
                item.greaterThanEqualFiveYears = conditionDetails.length
                item.greaterThanEqualFiveYearsPatientIds = conditionDetails
                }
            }
          }
          all.push(item)
        }
        return all
    }

    getCSVString(IDSRConditionsObj: any) {
        let CSVString = `Diseases/Events/Conditions, <5 yrs, >=5 yrs, Total,\n`
        for(const condition of IDSRConditionsObj) {
            CSVString += `${condition.name},${condition.lessThanFiveYears},${condition.greaterThanEqualFiveYears},${condition.total},\n`  
        }
        return {CSVString}
    }

    static async getReportEpiWeeks() {
        const epiWeeks: Array<CommonInterface> = []
        const epiWeeksObj = await Service.getJson('get_weeks')
        epiWeeksObj.reverse().forEach( (item: any) => { 
            const dates = item[1].split(" ")
            const startDate = dates[0]
            const endDate = dates[2]
            const txt = item[0].split('W')
            const name = txt[0] +"/W"+ txt[1]
            epiWeeks.push({ name: name, start: startDate, end: endDate })
        })
        return epiWeeks
    }

    static async getReportMonths() {
        const months: Array<CommonInterface> = []
        const epiWeeksObj = await Service.getJson('get_months')
        epiWeeksObj.forEach( (item: any) => {
            const _payload = item[1];
            const monthandyear = _payload[0]
            const startandendmonths = _payload[1];
            const dates = startandendmonths.split("to");
            months.push({ name: monthandyear, start: dates[0], end: dates[1].trim() })
        })
        return months
    }
}
