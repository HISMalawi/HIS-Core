import { AncReportService } from "./anc_report_service";


export enum AncCleaningIndicator {
  MALES_WITH_ANC_ENCOUNTERS='MALES WITH ANC ENCOUNTERS',
  ENCOUNTERS_AFTER_DEATH='ENCOUNTERS AFTER DEATH',
  INCOMPLETE_VISITS='INCOMPLETE VISITS',
  DUPLICATE_ENCOUNTERS='DUPLICATE ENCOUNTERS',
  MISSING_HIV_STATUS='NO HIV STATUS',
  MISSING_LMP="MISSING LMP"
}

export class AncDataCleaningToolService extends AncReportService {
    constructor() {
        super()
    }

    getDataToolReport(tool: AncCleaningIndicator) {
        return AncReportService.getJson(
            'anc_data_cleaning_tools', this.buildRequestParams({
                'report_name': tool
            })
        )
    }
}