import { AppEncounterService } from "@/services/app_encounter_service";

export class AppointmentService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 7, providerID);
  }

  async getNextAppointment() {
    return AppEncounterService.getJson(`/programs/${this.programID}/patients/${this.patientID}/next_appointment_date`, {date: this.date})
  }
  
  static async getDailiyAppointments(date: any) {
    const programID = AppEncounterService.getProgramID();
    return AppEncounterService.getJson(`/programs/${programID}/booked_appointments`, {date: date, paginate: false})
  }

}