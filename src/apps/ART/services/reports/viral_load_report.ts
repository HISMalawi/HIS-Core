import Url from "@/utils/Url";
import { ArtReportService } from "./art_report_service";

export class ViralLoadReportService extends ArtReportService {
    constructor() {
        super()
    }
    
    getVlCollection() {
        return this.getReport(`programs/${this.programID}/reports/vl_collection`)
    }

    getVLCoverage(rebuild_outcomes = false) {
        return this.getReport(`programs/${this.programID}/reports/viral_load_coverage`, {
            rebuild_outcomes
        })
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
