import { ArtReportService } from "./art_report_service";

export class EncounterReportService extends ArtReportService {
    constructor() {
        super()
    }

    getEncounterStats (data: Record<string, any>) {
        return ArtReportService.postJson(`reports/encounters?date=${this.date}&program_id=${this.programID}`,  data)
    }
}
