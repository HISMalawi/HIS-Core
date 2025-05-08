import { AppEncounterService } from "@/services/app_encounter_service"

export class HIVStatusService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 39, providerID) 
    }
}
