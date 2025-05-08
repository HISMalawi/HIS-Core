import { AppEncounterService } from "@/services/app_encounter_service"

export class PatientVisitRegistrationService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 104, providerID) 
    }
}
