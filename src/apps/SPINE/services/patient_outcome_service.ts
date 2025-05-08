import { AppEncounterService } from "@/services/app_encounter_service"

export class PatientOutcomeService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 40, providerID) 
  }
}
