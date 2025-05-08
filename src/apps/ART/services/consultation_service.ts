import { DrugInterface } from "@/interfaces/Drug";
import { AppEncounterService } from "@/services/app_encounter_service";
import { ObservationService } from "@/services/observation_service";
import dayjs from "dayjs";
import { isEmpty } from "lodash";

export class ConsultationService extends AppEncounterService {
  constructor(patientID: number, providerID: number) {
    super(patientID, 53, providerID);
  }
  getFamilyPlanningMethods() {
    return [
      "ORAL CONTRACEPTIVE PILLS",
      "DEPO-PROVERA",
      "INTRAUTERINE CONTRACEPTION",
      "CONTRACEPTIVE IMPLANT",
      "MALE CONDOMS",
      "FEMALE CONDOMS",
      "TUBAL LIGATION",
      "NONE",
    ];
  }

  async getTptTreatmentStatus() {
    return AppEncounterService.getJson(`/patients/${this.patientID}/tpt_status`, {
      date: this.date
    })
  }

  async patientHitMenopause() {
    const obs = await ObservationService.getFirstObs(
      this.patientID, 'Why does the woman not use birth control', 
    )
    return obs && typeof obs?.value_text === 'string'
      ? (obs.value_text.match(/menopause/i) ? true : false)
      && AppEncounterService.obsInValidPeriod(obs)
      : false
  }

  async hasTreatmentHistoryObs() {
    const obs = await ObservationService.getFirstObs(this.patientID, 'Previous TB treatment history')
    return obs && AppEncounterService.obsInValidPeriod(obs)
  }

  getDrugSideEffects() {
    return AppEncounterService.getJson(`programs/${AppEncounterService.getProgramID()}/patients/${this.patientID}/medication_side_effects`, { 
      date: this.date 
    })
  }

  getClient() {
    return AppEncounterService.getFirstValueCoded(this.patientID, 'Patient present');
  }

  async clientLastScreened(){
    const req: any = await AppEncounterService.getJson(`last_cxca_screening_details`, {
      id: this.patientID, date: this.date
    })
    return !isEmpty(req)
  }

  async clientDueForCxCa() {
    const req: any = await AppEncounterService.getJson(`last_cxca_screening_details`, {
      id: this.patientID, date: this.date
    })
    if (!isEmpty(req)) {
      const lastScreened = req['date_screened']
      const duration = dayjs(this.date).diff(lastScreened, 'years')
      return duration >= 1
    }
    return true
  }
async clientHasHadAHysterectomy() {
    const req: any = await AppEncounterService.getFirstValueCoded(this.patientID, 'Reason for NOT offering CxCa'); 
    if(req === "Hysterectomy") {
      return true
    }
    const secondCheck: any = await AppEncounterService.getFirstValueText(this.patientID, 'Treatment'); 
    if(secondCheck === "Hysterectomy") {
      return true
    }
    return false
  }
  async getTLObs() {
    const isTL = ((obs: any) => obs && obs.value_coded === 'Tubal ligation' && AppEncounterService.obsInValidPeriod(obs))
    const tlObs = await AppEncounterService.getFirstObs(this.patientID, 'Family planning')
    if (isTL(tlObs)) {
      return isTL(tlObs)
    } else  {
      const fpObs = await AppEncounterService.getFirstObs(this.patientID, 'Method of family planning')
      return isTL(fpObs)
    }
  }
  async getPreviousDrugs() {

    const drugs = await AppEncounterService.getJson(
      `patients/${this.patientID}/drugs_received`
    )

    if (!drugs) return

    const uniqueDrugs = {} as any
    drugs.forEach((drug: DrugInterface) => {
      uniqueDrugs[drug.drug_inventory_id] = drug;
    })
    return uniqueDrugs;
  }
  familyPlanningMethods(label: string, values: any[]) {
    const familyPlanningLogic: any = {
      "ORAL CONTRACEPTIVE PILLS": {
        "DEPO-PROVERA": 'N', "INTRAUTERINE CONTRACEPTION": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "DEPO-PROVERA": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "INTRAUTERINE CONTRACEPTION": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "INTRAUTERINE CONTRACEPTION": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'CONTRACEPTIVE IMPLANT': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "CONTRACEPTIVE IMPLANT": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "MALE CONDOMS": {
        "ORAL CONTRACEPTIVE PILLS": 'Y', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'Y',
        'CONTRACEPTIVE IMPLANT': 'Y', 'FEMALE CONDOMS': 'Y', 'RYTHM METHOD': 'Y', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'Y'
      },
      "FEMALE CONDOMS": {
        "ORAL CONTRACEPTIVE PILLS": 'Y', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'Y',
        'CONTRACEPTIVE IMPLANT': 'Y', 'MALE CONDOMS': 'Y', 'RYTHM METHOD': 'Y', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'Y'
      },
      "RYTHM METHOD": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'Y', 'CONTRACEPTIVE IMPLANT': 'N', 'TUBAL LIGATION': 'N',
        'VASECTOMY': 'N'
      },
      "TUBAL LIGATION": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'N', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'N', 'RYTHM METHOD': 'N',
        'VASECTOMY': 'N',
      },
      "VASECTOMY": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'Y', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'Y', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'Y', 'RYTHM METHOD': 'N',
        'TUBAL LIGATION': 'N'
      },
      "NONE": {
        "ORAL CONTRACEPTIVE PILLS": 'N', "DEPO-PROVERA": 'N', 'INTRAUTERINE CONTRACEPTION': 'N',
        'MALE CONDOMS': 'N', 'FEMALE CONDOMS': 'N', 'CONTRACEPTIVE IMPLANT': 'N', 'RYTHM METHOD': 'N',
        'TUBAL LIGATION': 'N'
      }
    }
    const selected = familyPlanningLogic[label];
    return values.map(data => {
      if (selected[data.label] === "N") {
        return {
          label: data.label,
          value: data.value,
          isChecked: false,
          disabled: true,
        }
      }
      else {
        return {
          label: data.label,
          value: data.value,
          isChecked: data.isChecked,
          disabled: false,
        }
      }

    })
  }

}