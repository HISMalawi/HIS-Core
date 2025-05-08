import { AppEncounterService } from "@/services/app_encounter_service"
import { ObservationService } from "@/services/observation_service"

export enum HTN_SESSION_KEY {
  Prescription = "htnPrescription"
}

export class BPManagementService extends AppEncounterService {
    constructor(patientID: number, providerID: number) {
      super(patientID, 48, providerID) //TODO: Use encounter type reference name'
    }

    static getAllBpDrugs() {
      return AppEncounterService.getJson('bp_drugs')
    }

    static getBpGrade(sbp: number, dbp: number) {
      if ((sbp < 140) && (dbp < 90)) {
        return "normal"
      }
      else if ((sbp >= 140 && sbp < 160) || (dbp >= 100 && dbp < 110)) {
        return "grade 1"
      }
      else if ((sbp >= 180 && dbp > 110) || sbp >= 180) {
        return "grade 3"
      }
      else if ((sbp >= 160 && sbp < 180) || (dbp >= 110)) {
        return "grade 2"
      }
      return 'N/A'
    }

    /**
     * BP is normointensive if two most recent consecutive tests are normal
     * @param bpTrail 
     * @returns
    */
    static isBpNormotensive(bpTrail: any) {
      const [ firstRecentGrade, secondRecentGrade ] = Object.values(bpTrail)
        .sort((a: any, b: any) => a.date < b.date ? 1 : 0)
        .map((bp: any) => this.getBpGrade(bp.sbp, bp.dbp))
      return firstRecentGrade === 'normal' && secondRecentGrade === 'normal'
    }

    getSystolicBp() {
      return ObservationService.getFirstValueNumber(this.patientID, 'Systolic blood pressure')
    }

    getDiastolicBp() {
      return ObservationService.getFirstValueNumber(this.patientID, 'Diastolic blood pressure')
    }

    async onBpDrugs() {
      const query = await ObservationService.getFirstValueCoded(this.patientID, 'Treatment status')
      return query ? query === 'Yes' : false
    }
  
    async getBPTrail() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/bp_trail`);
    }
    async getCurrentDrugs() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/current_bp_drugs`);
    }
    async getLastDrugs() {
      return await AppEncounterService.getJson(`/patients/${this.patientID}/last_bp_drugs_dispensation`);
    }
    async getAdherence(drugID: number, pills: number) {
      return await AppEncounterService.postJson(`/patients/${this.patientID}/remaining_bp_drugs`, {
        'drug_id': drugID,
        pills: pills
      });
    }
    async enrollPatient(state: any) {
      return await AppEncounterService.postJson(`/patients/${this.patientID}/update_or_create_htn_state`, state);
    }
    static htnDrugReferences() {
      return [
        { 
          'drug_id': 275,
          'drug_name': "HCTZ (25mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 942,
          'drug_name': "Enalapril (5mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 943,
          'drug_name': "Enalapril (10mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 558,
          'drug_name': "Amlodipine (5mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 559,
          'drug_name': "Amlodipine (10mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 117,
          'drug_name': "Atenolol (50mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        },
        {
          'drug_id': 116,
          'drug_name': "Atenolol(100mg tablet)",
          'units': 'tab(s)',
          'am': 0,
          'noon': 0,
          'pm': 1,
          'frequency': 'Daily (QOD)'
        }
      ]
    }
    getDrugs() {
        return {
        HCTZ: {
          drugs: [
            {
              drugName: "HCTZ (25mg tablet)",
              drugID: 275,
              amount: '25mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Enalapril: {
          drugs: [
            {
              drugName: "Enalapril (5mg tablet)",
              drugID: 942,
              amount: '5mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Enalapril (10mg tablet)",
              drugID: 943,
              amount: '10mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Amlodipine: {
          drugs: [
            {
              drugName: "Amlodipine (5mg tablet)",
              drugID: 558,
              amount: '5mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Amlodipine (10mg tablet)",
              drugID: 559,
              amount: '10mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
        Atenolol: {
          drugs: [
            {
              drugName: "Atenolol (50mg tablet)",
              drugID: 117,
              amount: '50mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
            {
              drugName: "Atenolol(100mg tablet)",
              drugID: 116,
              amount: '100mg',
              current: false,
              selected: false,
              isChecked: false,
              dispensed: null,
              expectedRemaining: null,
              adherence: null,
              remaining: null,
            },
          ],
          selected: null,
          notes: [],
        },
      }
    }
}