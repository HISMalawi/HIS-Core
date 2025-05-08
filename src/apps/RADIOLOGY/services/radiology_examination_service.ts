import { AppEncounterService } from "@/services/app_encounter_service"
import { printRadiologyExamination } from "../Labels"

export class RadiologyExaminationService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 121, providerID) 
    }

    
    static getListOfRadiologyTests(id: string | number) {
        return super.getJson('radiology_set', { id })
    }
    
    getPatientExaminations() {
        return AppEncounterService.getJson('radiology/examinations', {
            'patient_id': this.patientID
        })
    }

    createOrder(params: any) {
        return AppEncounterService.postJson('orders/radiology', params)
    }

    printExamination(accessionNumber: string) {
        return printRadiologyExamination(accessionNumber)
    }
}
