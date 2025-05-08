import { AppEncounterService } from "@/services/app_encounter_service"

export class PatientAdmitService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 42, providerID) 
    }
}