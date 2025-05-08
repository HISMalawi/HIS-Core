import { AppEncounterService } from "@/services/app_encounter_service"

export class MedicalHistoryService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 30, providerID) //TODO: Use encounter type reference name'
    }
}