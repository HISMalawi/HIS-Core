import { OpdReportService } from "./opd_report_service";

export class HMISReportService extends OpdReportService {
    regenerate: boolean;
    constructor() {
        super()
        this.regenerate = false
    }

    setRegenerate(regenerate: boolean) {
        this.regenerate = regenerate
    }

    requestHMIS15() {
        return this.getReport('generate_hmis_15_report', {
            request: 'true'
        })
    }

    requestHMIS17() {
        return this.getReport('generate_hmis_17_report', {
            request: 'true',
        })
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
                total: 0,
                totalPatientIds: ''
            }
            item.name = key
            let total = 0
            item.id = count
            count += 1 
            for (const [key1, value1] of Object.entries(condition)) {
                key1
                const conditionDetails: any = value1
                if (conditionDetails != null) {
                    total +=conditionDetails.length;
                    item.total = total
                    if(conditionDetails.length) {
                        temp.push(...conditionDetails)
                        item.totalPatientIds = temp
                    }
            }
          }
          all.push(item)
        }
        return all
    }

    getCSVString(IDSRConditionsObj: any) {
        let CSVString = `Diseases/Events/Conditions, #,\n`
        for(const condition of IDSRConditionsObj) {
          const row = `${condition.name},${condition.total},\n`
          CSVString+=row
        }
        return {CSVString}
    }
}
