import Url from "@/utils/Url";
import { ArtReportService } from "./art_report_service";
import { Service } from "@/services/service";

export class TBReportService extends ArtReportService {
  programID: number;

  constructor() {
    super();
    this.programID = Service.getProgramID();
  }

  getCommunityReport(year: string, quarter: number, indicators: string[]): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/community`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTPTOutcomesReport(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/iptoutcomes`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBOutcomesReport(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/mdr_outcomes`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBDRInterimOutcomesReport(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/mdr_interim_outcomes`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBHighRiskPatients(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/highriskpatients`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBContacts(year: string, quarter: number, indicators: string[]): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/contacts`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBPresumptives(year: string, quarter: number, indicators: string[]): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);
    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/presumptives`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBHIVReportingForm(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);

    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/tbhiv`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getMDRTBCaseFindingReport(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);

    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/mdr_casefinding`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBCaseFindingReport(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);

    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/casefinding`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTBQuateryTreatmentOutcomes(
    year: string,
    quarter: number,
    indicators: string[]
  ): any {
    const { start_date, end_date } = this.getQuarterDates(year, quarter);

    return Promise.all(
      indicators.map((indicator) => {
        return TBReportService.getJson(
          `programs/${this.programID}/reports/quarterly`,
          {
            start_date: start_date,
            end_date: end_date,
            name: indicator,
          }
        );
      })
    );
  }

  getTxTbReport(rebuildOutcome: boolean, type: 'pepfar'|'moh') {
    return this.getReport(`programs/1/reports/tx_tb`, { rebuild_outcome: rebuildOutcome, report_type: type  })
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

  private getQuarterDates(year: string, quarter: number) {
    const quarterStartDates: { [key: number]: string } = {
      1: `${year}-01-01`,
      2: `${year}-04-01`,
      3: `${year}-07-01`,
      4: `${year}-10-01`,
    };

    const quarterEndDates: { [key: number]: string } = {
      1: `${year}-03-31`,
      2: `${year}-06-30`,
      3: `${year}-09-30`,
      4: `${year}-12-31`,
    };
    return {
      start_date: quarterStartDates[quarter],
      end_date: quarterEndDates[quarter],
    };
  }
}
