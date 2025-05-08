import { Service } from '@/services/service'
import Modal from "@/components/ApplicationModal.vue";
import { modalController } from "@ionic/vue";

export class ProgramService extends Service {
    constructor() {
        super()
    }

    static getAllPrograms() {
      return super.getJson('programs', { 'page_size': 1000 })
    }

    static getPatientPrograms(patientID: number) {
      return super.getJson(`patients/${patientID}/programs`)
    }
    static getPatientVLInfo(patientID: number) {
      const programID = super.getProgramID();
      return super.getJson(`programs/${programID}/patients/${patientID}/vl_info`, {date: this.getSessionDate()})
    }
    static getProgramWorkflows(program: number) {
      return super.getJson(`programs/${program}/workflows`)
    }

    static getPatientStates(patientId: number, programId: number) {
      return super.getJson(`programs/${programId}/patients/${patientId}/states`)
    }

    static voidProgram(patientProgramId: number, reason='') {
      return super.void(`patient_programs/${patientProgramId}/`, { reason })
    }

    static createState(patientId: number, programId: number, state: Record<string, any>) {
      return super.postJson(`programs/${programId}/patients/${patientId}/states`, state) 
    }

    static voidState(patientId: number, programId: number, stateId: number, reason='') {
      return super.void(`programs/${programId}/patients/${patientId}/states/${stateId}`, { reason })
    }

    static async getProgramInformation(patientID: number, programID=super.getProgramID()) {
      try {
        const info = await super.getJson(`/programs/${programID}/patients/${patientID}`);
        return info
      } catch (error) {
        return {}
      }
    }
    static getCurrentProgramInformation(patientID: number, visitDate: any) {
        return super.getJson(`/programs/${super.getProgramID()}/patients/${patientID}/visit?date=${visitDate}`);
    }
    static getMastercardDrugInformation(patientID: number, visitDate: any) {
        return super.getJson(`/programs/${super.getProgramID()}/patients/${patientID}/mastercard_data?date=${visitDate}`);
    }
    static getNextTask(patientID: number) {
        return super.getJson(`/workflows/${super.getProgramID()}/${patientID}`, {date: super.getSessionDate()});
    }
    static getNextSuggestedARVNumber() {
    return super.getJson(`/programs/1/next_available_arv_number`);
      
    }
    static getFastTrackStatus(patientID: number) {
        return super.getJson('/on_fast_track', {'person_id': patientID, date: super.getSessionDate()});
    }
   static createPatient(personID: number) {
     return super.postJson(`/patients/`, {
          'program_id': super.getProgramID(),
          'person_id': personID
      })
    }
    static enrollPatient(personID: number) {
     return super.postJson(`/patients/${personID}/programs`, {
          'program_id': super.getProgramID(),
          'date_enrolled': super.getSessionDate()
      })
    }
    static enrollProgram(patientId: number, program: number, date: string ) {
      return super.postJson(`/patients/${patientId}/programs`, {
        'program_id': program,
        'date_enrolled': date
      })
    }
    static getWeightForHeightValues() {
      return super.getJson('/patient_weight_for_height_values');
    }
    static async selectApplication() {
      const modal = await modalController.create({
        component: Modal,
        cssClass: "my-custom-class",
        backdropDismiss: false,
        componentProps: {
          appVersion: Service.getFullVersion()
        },
      });
      modal.present()
      return modal;
    }
}