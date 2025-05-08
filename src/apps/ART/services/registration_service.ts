import { AppEncounterService } from "@/services/app_encounter_service"

export class ClinicRegistrationService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 9, providerID) //TODO: Use encounter type reference name'
    }
}
