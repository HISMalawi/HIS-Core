import { AppEncounterService } from "@/services/app_encounter_service";
import { ConceptService } from "@/services/concept_service";

export class AncMedicalHistoryService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 30, providerID)
    }

    static medicalHistoryOptions() {
        return ConceptService.getConceptsByCategory('anc_medical_history')
    }
}
