import { AppEncounterService } from "@/services/app_encounter_service";

export class CxCaAppointmentService extends AppEncounterService {


  constructor(patientID: number, providerID: number) {
    super(patientID, 7, providerID);
  }

  //CxCa Program ID is 24
  getNextAppointment() {
    return AppEncounterService.getJson(`/next_appointment?patient_id=${this.patientID}&date=${this.date}&program_id=${this.programID}&`)
  }
  
  getDailiyAppointments(date: any) {
    return AppEncounterService.getJson(`/programs/${this.programID}/booked_appointments`, {date: date, paginate: false})
  }

}