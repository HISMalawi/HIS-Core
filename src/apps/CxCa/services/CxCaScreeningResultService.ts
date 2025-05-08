import { AppEncounterService } from "@/services/app_encounter_service"

export class ScreeningResultService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 186, providerID) //TODO: Use encounter type reference name'
    }
}