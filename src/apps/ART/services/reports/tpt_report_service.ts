import { ArtReportService } from "./art_report_service";

export class TptReportService extends ArtReportService {
    constructor() {
        super()
    }

    getCohort() {
        return this.getReport('moh_tpt')
    }
}
