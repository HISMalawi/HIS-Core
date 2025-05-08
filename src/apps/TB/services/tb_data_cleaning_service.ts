import { TBReportService } from "./tb_report_service";


export enum TBCleaningIndicator {
  WITHOUT_PROGRAM="WITHOUT PROGRAM",
  WITHOUT_TB_NUMBER="WITHOUT TB NUMBER",
  BAD_TB_NUMBER="BAD TB NUMBER",
  IN_TREATMENT_BUT_COMPLETED="IN TREATMENT BUT COMPLETED",
  WITH_DISPENSATION_ANOMALIES="WITH DISPENSATION ANOMALIES",
  WITH_UNKNOWN_OUTCOME="WITH UNKNOWN OUTCOME",
  WITH_DUPLICATE_TB_NUMBER="WITH DUPLICATE TB NUMBER",
}

export class TBDataCleaningToolService extends TBReportService {
  constructor() {
    super();
  }

  getDataToolReport(tool: TBCleaningIndicator) {
    return TBReportService.getJson(
      "tb_data_cleaning_tools",
      this.buildRequestParams({
        context: tool,
      })
    );
  }
}
