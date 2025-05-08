import { AppEncounterService } from "@/services/app_encounter_service"

export class InfluenzaDataService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 56, providerID) 
    }
}