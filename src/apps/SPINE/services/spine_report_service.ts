import { Service } from "@/services/service";
import HisDate from "@/utils/Date";

export class SpineReportService extends Service {
  programID: number;
  startDate: string;
  endDate: string;
  date: string;
  constructor() {
    super()
    this.endDate = ''
    this.startDate = ''
    this.date = Service.getSessionDate()
    this.programID = Service.getProgramID()
  }

  getReportPeriod() {
    return this.startDate && this.endDate
      ? `${HisDate.toStandardHisDisplayFormat(this.startDate)} - ${HisDate.toStandardHisDisplayFormat(this.endDate)}`
      : '-'
  }

  getReport(name: string, params = {}) {
    return Service.getJson(`programs/${this.programID}/reports/${name}`, this.buildRequest(params))
  }

  buildRequest(config: Record<string, any> = {}) {
    const payload: any = { 'date': this.date, program_id: this.programID }
    if (this.startDate && this.endDate) {
      payload['start_date'] = this.startDate
      payload['end_date'] = this.endDate
    }
    return { ...payload, ...config }
  }

  getDiagnosisReport() {
    return this.getReport("diagnosis");
  }

  getAttendance() {
    return this.getReport(`attendance`)
  }

  getOutcomesReport(): Promise<Array<any>> {
    return new Promise(resolve => resolve([]))
  }
}