import { AppEncounterService } from "@/services/app_encounter_service";
import { AncCurrentPregnancyService } from "@/apps/ANC/Services/anc_current_pregnancy";

export const FUNDAL_CM_TO_WEEKS: Record<string, number> = {
  '12' : 14,
  '13' : 15,
  '14' : 16,
  '15' : 17,
  '16' : 18,
  '17' : 19,
  '18' : 20,
  '19' : 22,
  '20' : 23,
  '21' : 24,
  '22' : 25,
  '23' : 26, // Not in the actual CM to Weeks chart reference documentation in clinics..
  '24' : 27,
  '24.5' : 28,
  '25' : 29,
  '26' : 30,
  '27' : 31,
  '28' : 32,
  '29' : 33,
  '30' : 34,
  '31' : 35,
  '31.5' : 36,
  '32' : 37,
  '33' : 38,
  '34' : 39,
  '35' : 40,
  '36' : 42,
}

export class AncExaminationService extends AppEncounterService {
  gestationWeeks: number;
  visitNumber: number;

  constructor(patientID: number, providerID: number){
    super(patientID, 98, providerID)
    this.gestationWeeks = 0
    this.visitNumber = 0;
  }

  isFirstVisit() {
    return this.visitNumber === 1;
  }

  expectedFundalHeightForGestationWeeks() {
    return this.getEquivalentFundalHeight(this.gestationWeeks)
  }

  async loadPregnancyStatus() {
    const res = await AppEncounterService.getJson(`programs/${this.programID}/patients/${this.patientID}`)
    if (res) {
      const dateofLmp = res['date_of_lnmp']
      if (dateofLmp) {
        const p = new AncCurrentPregnancyService(this.patientID, this.providerID)
        this.gestationWeeks = p.calculateWeekOfFirstVisit(dateofLmp)
        this.visitNumber = res["anc_visits"] ?? 0
      }
    }
  }

  getEquivalentFundalWeeks(fundalHeight: number): number {
    if (fundalHeight < 12) {
      return FUNDAL_CM_TO_WEEKS['12']
    }
    if (fundalHeight > 37) {
      return FUNDAL_CM_TO_WEEKS['37']
    }
    return FUNDAL_CM_TO_WEEKS[fundalHeight]
  }

  getEquivalentFundalHeight(gestationWeeks: number) {
    for (const cm in FUNDAL_CM_TO_WEEKS) {
      const weeks = FUNDAL_CM_TO_WEEKS[cm]
      if (gestationWeeks <= weeks) { 
        return parseInt(cm)
      }
    }
    return gestationWeeks > 42 ? 37 : gestationWeeks < 13 ? 12 : 0
  }
}
