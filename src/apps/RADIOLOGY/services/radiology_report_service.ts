import { Service } from "@/services/service"
import HisDate from "@/utils/Date"

export class RadiologyReportService extends Service {
    startDate: string
    endDate: string
    date: string
    name: string
    programID: number
    constructor(
        name: string, 
        startDate: string, 
        endDate: string, 
        date=Service.getSessionDate(), 
        programID=Service.getProgramID()
        ) {
        super()
        this.startDate = startDate
        this.endDate = endDate
        this.date = date
        this.name = name
        this.programID = programID
    }

    requestReport(params: any={}) {
        return Service.getJson('radiology_reports', {
            'program_id': this.programID,
            'report_name': this.name,
            'start_date': this.startDate,
            'end_date': this.endDate,
            'date': this.date,
            ...params
        })
    }

    periodStr() {
        const d = (date: string) => HisDate.toStandardHisDisplayFormat(date)
        return `${d(this.startDate)} - ${d(this.endDate)}`
    }
}
