import { Service } from "@/services/service";

export interface AncReportParams {
    'start_date'?: string;
    'end_date'?: string;
    'program_id'?: number;
    'date'?: string;
}
export class AncReportService extends Service {
    programID: number;
    startDate: string;
    endDate: string;
    date: string;
    constructor() {
        super()
        this.startDate = ''
        this.endDate = ''
        this.date = Service.getSessionDate()
        this.programID = Service.getProgramID()
    }

    setStartDate(startDate: string) {
        this.startDate = startDate
    }  

    setEndDate(endDate: string) {
        this.endDate = endDate
    }

    buildRequestParams(config: Record<string, number | string | boolean>) {
        const params: AncReportParams = {}
        if (this.startDate) {
            params['start_date'] = this.startDate
        }

        if (this.endDate) {
            params['end_date'] = this.endDate
        }

        if (this.date) {
            params['date'] = this.date
        }

        if (this.programID) {
            params['program_id'] = this.programID
        }
        return {...params, ...config}
    }
}
