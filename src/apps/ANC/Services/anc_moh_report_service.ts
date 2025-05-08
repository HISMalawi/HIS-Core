import { AncReportService } from "./anc_report_service";

export class AncMohReportService extends AncReportService {
    generateCohort() {
        return AncReportService.getJson(`programs/${this.programID}/reports/cohort`,{
            'name': 'q1', 
            'start_date': this.startDate
        })
    }

    genertateMonthly() {
        return AncReportService.getJson(`programs/${this.programID}/reports/monthly`,{
            'name': 'q1', 
            'start_date': this.startDate
        })
    }
}
