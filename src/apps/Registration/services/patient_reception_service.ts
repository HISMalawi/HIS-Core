import { AppEncounterService } from "@/services/app_encounter_service"

export class PatientReceptionService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 80, providerID) 
    }
}
