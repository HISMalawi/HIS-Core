import { ArtReportService } from "./art_report_service";

export class ClinicReportService extends ArtReportService {
    constructor() {
        super()
    }
    
    getTxHtnReport() {
        return this.getReport(`programs/${this.programID}/reports/tx_hiv_htn`);
    }

    getVlSuppressionReport() {
        return this.getReport(`programs/${this.programID}/reports/vl_supression`, { system_type: "poc" })
    }

    getTtpOutcomes() {
        return this.getReport(`programs/${this.programID}/reports/tpt_outcome`)
    }

    getHypertensionReport(processDue=false) {
        return this.getReport(`programs/${this.programID}/reports/hypertension_report`, {
            process_due: processDue
        })
    }

    getNidUtilizationReport() {
        return this.getReport(`nid_utilization_report`)
    }

    getCumulativeNidReport() {
        return this.getReport(`programs/${this.programID}/reports/nid_cumulative_report`)
    }

    getHtnEnrollmentReport() {
        return this.getReport(`programs/${this.programID}/reports/HTN_ENROLLMENT`)
    }
}
