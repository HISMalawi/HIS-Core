import { AppEncounterService } from "./app_encounter_service";

export class NotesService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 105, providerID) 
    }
}