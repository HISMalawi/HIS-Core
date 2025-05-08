import { AppEncounterService } from "@/services/app_encounter_service"

export class PatientServicesService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 5, providerID) 
    }
}