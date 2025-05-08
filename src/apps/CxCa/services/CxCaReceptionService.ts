import { AppEncounterService } from "@/services/app_encounter_service"

export class ReceptionService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 184, providerID) //TODO: Use encounter type reference name'
    }
}