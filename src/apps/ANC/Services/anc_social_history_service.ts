import { AppEncounterService } from "@/services/app_encounter_service";
import { printAncPatientHistoryLbl } from "../Labels";

export class AncSocialHistoryService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 84, providerID)
    }

    printSocialHistory() {
        return printAncPatientHistoryLbl(this.patientID)
    }
}
