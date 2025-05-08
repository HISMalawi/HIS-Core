import { AppEncounterService } from "@/services/app_encounter_service";

export class AncArtFollowupService extends AppEncounterService {
    constructor(patientID: number, providerID: number){
        super(patientID, 10, providerID)
    }
}
