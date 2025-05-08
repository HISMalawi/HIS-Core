import { AppEncounterService } from "@/services/app_encounter_service";
export class FastTrackService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 156, providerID);
  }
  getAssessmentValues() {
    return AppEncounterService.getConceptsByCategory("fast_track")
  }
}