import { AncReportService } from "./anc_report_service";

export class AncClinicReportService extends AncReportService {
    generateBookedAppointments() {
        return AncReportService.getJson(`programs/${this.programID}/booked_appointments`, {
            date: this.startDate,
            paginated: false
        })
    }
}
