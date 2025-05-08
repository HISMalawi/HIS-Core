import { AppEncounterService } from "@/services/app_encounter_service";


export class AncDispensationService extends AppEncounterService {
    constructor(patientID: number, providerID: number){
        super(patientID, 54, providerID)
    }

    saveNoDispensationObs() {
        return this.saveValueTextObs(
            'Tetanus Diphtheria', 'Not dispensed'
        )
    }

}
