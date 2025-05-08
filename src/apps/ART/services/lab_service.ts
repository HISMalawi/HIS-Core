import { AppEncounterService } from "@/services/app_encounter_service";
export class ARTLabService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 13, providerID);
  }
  async buildDefferedOrder(milestone: any) {
    const concept = await AppEncounterService.getConceptID("HIV viral load");
    const coded = await AppEncounterService.getConceptID("Delayed milestones");

    return [
      {
        'concept_id': concept,
        'value_text': "Wait till next milestone",
        'value_coded': coded,
        'value_numeric': milestone,
      }]
  }
}