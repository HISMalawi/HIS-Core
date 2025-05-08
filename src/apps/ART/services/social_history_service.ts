import { AppEncounterService } from "@/services/app_encounter_service"

export class SocialHistoryService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 84, providerID) //TODO: Use encounter type reference name'
    }
}