import { AppEncounterService } from "@/services/app_encounter_service"
import { ConceptService } from '@/services/concept_service';

export class PatientComplaintsService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 122, providerID) 
  }

  static async getComplaintsList(complaintType: string, filter = '') {
    return ConceptService.getConceptSet(complaintType, filter) 
  }
  async fetchLatestTriageEncounter() { 
   return await PatientComplaintsService.getObs({
        'concept_id': ConceptService.getConceptID("History of COVID-19 contact") ,
        'start_date': this.date,
        'end_date': this.date,
        'person_id': this.patientID,
    })
  }
}
