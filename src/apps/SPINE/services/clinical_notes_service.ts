import { AppEncounterService } from "@/services/app_encounter_service"

export class ClinicalNotesService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 105, providerID) 
    }
}
