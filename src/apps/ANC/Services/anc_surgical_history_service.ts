import { AppEncounterService } from "@/services/app_encounter_service";
import { ConceptService } from "@/services/concept_service";

export class AncSurgicalHistoryService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 83, providerID)
    }

    static surgicalHistoryOptions() {
        return ConceptService.getConceptsByCategory('anc_surgical_history')
            .sort((a, b) => a.name > b.name ? 1 : -1)
    }
}
