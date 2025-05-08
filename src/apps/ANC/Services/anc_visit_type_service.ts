import { AppEncounterService } from "@/services/app_encounter_service";
import { isEmpty } from "lodash";

export class AncVisitTypeService extends AppEncounterService {
    lastVisitNumber: number ;
    constructor(patientID: number, providerID: number) {
        super(patientID, 107, providerID)
        this.lastVisitNumber=0
    }

    async loadLastVisitNumber() {
        const visitNumbers = await AppEncounterService.getJson(
            `programs/${this.programID}/patients/${this.patientID}/anc_visit`
        )
        if (!isEmpty(visitNumbers) && visitNumbers.visit_number.length) {
            this.lastVisitNumber = visitNumbers.visit_number[
                visitNumbers.visit_number.length  - 1
            ]
        }
    }
}
