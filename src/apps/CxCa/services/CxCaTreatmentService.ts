import { AppEncounterService } from "@/services/app_encounter_service"

export class TreatmentService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
        super(patientID, 182, providerID) //TODO: Use encounter type reference name'
    }
    async getSummary() {
        const screeningResult = await this.getFirstValueCoded('Screening results');
        const treatmentType = await this.getFirstValueCoded('Directly observed treatment option');
        const referralReason = await this.getFirstValueCoded('Referral reason');
        return {
          'Screening Result': screeningResult,
          'Treatment Type': treatmentType,
          'Referral Reason': referralReason ? referralReason : "N/A"  
        }
    }
}