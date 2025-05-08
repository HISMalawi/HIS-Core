import { ObservationService } from "./observation_service";
import { ConceptService} from "./concept_service";
import { Observation } from "@/interfaces/observation";

async function alertSideEffects(patientId: number, typeConceptID='Malawi ART side effects') {
    const data: Observation[] = await ObservationService.getObservations(
        patientId, ConceptService.getCachedConceptID(typeConceptID)
    );
    return data.filter((observation) => {
        try {
            return observation.children[0].value_coded == ConceptService.getCachedConceptID('Yes');
        } catch (e) {
            return false
        }
    });
}

export default {
    alertSideEffects
}