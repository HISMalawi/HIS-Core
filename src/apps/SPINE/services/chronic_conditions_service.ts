import { AppEncounterService } from "@/services/app_encounter_service"

export class ChronicConditionsService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 58, providerID) 
    }
}