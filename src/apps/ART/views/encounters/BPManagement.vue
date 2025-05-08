<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title> 
          <span>BP management screening on {{ date }}</span>
          <small v-if="patientOnBPDrugs" style="color: green">
            (Patient already on BP drugs)</small>
        </ion-title>
        <span slot="end">
          <ion-button
            color="danger"
            @click="showRiskFactors"
            v-if="totalRiskFactors > 0"
            >View/Edit risk factors {{ totalRiskFactors }}</ion-button
          >
          <ion-button @click="showRiskFactors" v-if="totalRiskFactors === 0"
            >add riskfactors</ion-button
          >
        </span>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <data-table :config="{showIndex: false}" :columns="columns" :rows="rows"></data-table>
    </ion-content>
    <ion-footer>
      <ion-toolbar v-if="currentDrugs.length">
        <h1 style="text-align: center">Actions</h1>
        <ion-radio-group v-model="action">
          <ion-grid>
            <ion-row>
              <ion-col v-for="(item, index) in onBpDrugActions" :key="index">
                <ion-item lines="none">
                  <ion-radio style=" margin-right: 10px;" :value="item"></ion-radio>
                  <ion-label style="font-size:1.0rem;font-weight:bold">{{ item.label }}</ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-radio-group>
      </ion-toolbar>
      <ion-toolbar v-else>
        <ion-grid>
          <ion-row>
            <ion-col>        
              <h1 style="text-align: center">Actions</h1>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col v-for="(option, index) in noneBpActions" :key="index">
              <ion-item lines="none">
                <ion-checkbox style= "margin-right: 10px" v-model="option.isChecked"></ion-checkbox>
                <ion-label>{{ option.label }}</ion-label>
              </ion-item>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
      <ion-toolbar color="dark">
        <ion-button
          size="large"
          color="danger"
          slot="start"
          @click="gotoPatientDashboard"
        >
          cancel
        </ion-button>
        <ion-button
          size="large"
          color="danger"
          slot="start"
          v-if="showClinicianButton"
          @click="referPatient"
        >
          Refer to clinician
        </ion-button>
        <ion-button
          size="large"
          slot="end"
          @click="goToDiagnosis"
          v-if="!patientHasHyperTensionObs"
        >
          Hypertension Diagnosis
        </ion-button>
        <ion-button
          size="large"
          slot="end"
          @click="enrollInHTN"
          v-if="patientHasHyperTensionObs && !isEnrolledInHTN"
          > 
          Enroll in HTN
        </ion-button>
        <ion-button 
          size="large"
          color="success" 
          slot="end"
          v-if="patientHasHyperTensionObs"
          @click="onFinish">
          Finish
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  IonCheckbox,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonRadioGroup,
  IonRadio,
  IonButton,
  modalController,
  IonFooter,
  IonPage,
  IonItem,
  IonLabel,
  loadingController
} from "@ionic/vue";
import { toastWarning, toastSuccess } from "@/utils/Alerts";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import RiskFactorModal from "@/components/DataViews/RiskFactorModal.vue";
import { ObservationService } from "@/services/observation_service";
import { ConceptService } from "@/services/concept_service";
import { Service } from "@/services/service";
import HisDate from "@/utils/Date";
import { isEmpty } from "lodash";
import { BPManagementService } from "../../services/htn_service";
import { UserService } from "@/services/user_service";
import { ProgramService } from "@/services/program_service";
import { VitalsService } from "@/apps/ART/services/vitals_service"
import { PatientProgramService } from "@/services/patient_program_service";
import DataTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table from "@/components/DataViews/tables/ReportDataTable"
import { infoActionSheet } from "@/utils/ActionSheets";
import PopupKeyboard from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";

const HEADER_STYLE = {
  background: '#444444',
}
export default defineComponent({
  mixins: [EncounterMixinVue],
  components: {
    IonCheckbox,
    DataTable,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonGrid,
    IonRow,
    IonButton,
    IonRadioGroup,
    IonRadio,
    IonCol,
    IonFooter,
    IonPage,
    IonItem,
    IonLabel,
  },
  data: () => ({
    htn: {} as any,
    hasARVNumber: true,
    suggestedNumber: "" as any,
    columns: [
      [
        table.thTxt("Date", { style: HEADER_STYLE }),
        table.thTxt("Systolic", { style: HEADER_STYLE }),
        table.thTxt("Diastolic", { style: HEADER_STYLE }),
        table.thTxt("BP Drugs", { style: HEADER_STYLE }),
        table.thTxt("Action / Note", { style: HEADER_STYLE })
      ]
    ] as any,
    bpGradeColorMap: {
      'N/A': '#ffffff',
      'normal': '#ffffff',
      'grade 1': '#FFC3CE',
      'grade 2': '#F20056',
      'grade 3': '#FF3333'
    } as any,
    rows: [] as any,
    riskFactors: [] as any,
    action: null as any,
    trail: [] as any,
    date: null as any,
    patientOnBPDrugs: false,
    patientFirstVisit: false,
    normatensive: false,
    patientHasHyperTensionObs: false,
    currentDrugs: [],
    items: [] as any,
    isEnrolledInHTN: false,
    isAliveOnHTN: false,
    HTNProgramID: 20,
    aliveState: 160,
    refer: false,
    onBpDrugActions: [] as Option[],
    noneBpActions: [] as Option[]
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (!ready) return
        const loading = await loadingController.create({
          message: 'Please wait...',
          backdropDismiss: false
        })
        await loading.present()
               
        this.htn = new BPManagementService(this.patientID, this.providerID);
        this.trail = await this.htn.getBPTrail();
        this.rows = this.formatBpTrailRows(this.trail);
        this.normatensive = BPManagementService.isBpNormotensive(this.trail)
        this.riskFactors = await this.getRiskFactors();
        this.date = HisDate.toStandardHisDisplayFormat(Service.getSessionDate());
        await this.isTransfered()
        await this.hasHyperTenstion()
        await this.getTreatmentStatus()
        await this.getProgramStatus()
        loadingController.dismiss()
        if (this.patientFirstVisit && this.patientOnBPDrugs) await this.alertTransferIn()
        this.setBpActions()
      },
      immediate: true,
    },
  },
  computed: {
    totalRiskFactors(): any {
      return this.riskFactors.filter((d: any) => d.value === "Yes").length;
    },
    showClinicianButton() {
      return !(UserService.isClinician() && UserService.isDoctor());
    },
  },
  methods: {
    setBpActions() {
      this.onBpDrugActions = [
        {
          label: "Continue drugs",
          value: "on treatment",
          other: {
            action: () => this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`)
          }
        },
        {
          label: "Medication not available",
          value: "on treatment",
          other: {
            action: () => this.$router.push(`/art/encounters/bp_adherence/${this.patientID}`)
          }
        },
        {
          label: "Review drugs",
          value: "on treatment",
          other: {
            action: () => this.$router.push(
              `/art/encounters/bp_adherence/${this.patientID}?review=true`
            )
          }
        },
      ]

      this.noneBpActions = [
        {
          label: "Lifestyle advice given",
          value: "Lifestyle changes only",
          isChecked: false
        },
        {
          label: "Patient declining BP drugs ",
          value: "Symptomatic but not in treatment",
          isChecked: false
        },
        ...(() => {
          if (this.normatensive) return [{
            label: "Return to annual screening",
            value: "Alive",
          }]
          return []
        })(),
        {
          label: "Start anti hypertensives",
          value: "On treatment",
          other: {
            action: () => this.$router.push(
              `/art/encounters/bp_prescription/${this.patientID}`
            )
          }
        }
      ]
    },
    async onFinish() {
      if (this.noneBpActions.some((option) => option.isChecked) || this.action || this.refer) {
        const encounter = await this.htn.createEncounter();
        if (!encounter) return toastWarning("Unable to create encounter");
        if (this.refer) {
          const obs = await this.htn.saveValueCodedObs(
            "Refer patient to clinician",
            "Yes"
          )
          if (!obs) return toastWarning("Unable to create Obs");
          this.gotoPatientDashboard();
        } else {
          if (!this.currentDrugs.length) {
            const selections = this.noneBpActions.filter((option) => option.isChecked)
            if (selections.length) {
              const resObs: any = selections.map((option: Option) => this.htn.saveValueTextObs("Plan", option.label))
              await Promise.all(resObs)
            }
          } else {
            await this.htn.saveValueTextObs("Plan", this.action.label);
            const patientState = { state: this.action.value }
            await this.htn.enrollPatient(patientState);
          }

          const selectedActions = this.noneBpActions.filter((action) => {
            return action.isChecked && typeof action.other?.action === 'function'
          })
          if (selectedActions.length) {
            return selectedActions.forEach((option) => option.other.action())
          }
          if (typeof this.action?.other?.action === 'function') {
            return this.action.other.action()
          }
          this.nextTask()
        }
      } else {
        toastWarning("Please select an action");
      }
    },
    referPatient() {
      this.refer = true;
      this.onFinish();
    },
    goToDiagnosis() {
      return this.$router.push({
        path: `/art/encounters/hypertension_diagnosis/${this.patientID}`,
      })
    },
    async hasHyperTenstion() {
      const ob = await ObservationService.getFirstValueCoded(
        this.patientID,
        "Patient has hypertension"
      );
      this.patientHasHyperTensionObs = `${ob}`.match(/yes|no/i) ? true : false
    },
    async isTransfered() {
      const ob = await ObservationService.getFirstValueCoded(
        this.patientID,
        "Transferred"
      );
      this.patientFirstVisit = !ob
    },
    async getTreatmentStatus() {
      const ob = await ObservationService.getFirstValueText(
        this.patientID,
        "Treatment status"
      );
      this.patientOnBPDrugs = ob && ob.match(/BP Drugs started/i) ? true : false;
    },
    async getProgramStatus() {
      const programs: any[] = await ProgramService.getPatientPrograms(
        this.patientID
      );
      this.isEnrolledInHTN =
        programs.filter(
          (program) => program.program.name === "HYPERTENSION PROGRAM"
        ).length > 0;
      if (this.isEnrolledInHTN) {
        await this.programState();
      }
    },
    async programState() {
      const programs: any[] = await ProgramService.getPatientStates(
        this.patientID, this.HTNProgramID
      );
      this.isAliveOnHTN =
        programs.filter((program) => program.name === "Alive").length > 0;
    },
    async getRiskFactors() {
      const concepts = ConceptService.getConceptsByCategory("risk factors");
      const j = concepts.map(async (concept) => {
        const val = await ObservationService.getFirstValueCoded(
          this.patientID,
          concept.name
        );
        return {
          concept: concept.name,
          value: val,
        }
      })
      return Promise.all(j);
    },
    formatBpTrailRows(trail: any) {
      return Object.keys(trail).map(m => {
        const date = HisDate.toStandardHisDisplayFormat(m);
        this.currentDrugs = this.currentDrugs.concat(trail[m]["drugs"]);
        const colorGrade = () => {
          const grade: string = BPManagementService.getBpGrade(
            parseInt(trail[m].sbp),
            parseInt(trail[m].dbp)
          )
          return this.bpGradeColorMap[grade]
        }
        const style = {
          background: colorGrade()
        }
        return [
          table.tdDate(date, { style }),
          table.td(trail[m].sbp, { style }),
          table.td(trail[m].dbp, { style }),
          table.td(trail[m]["drugs"].join(", "), { style }),
          table.td(trail[m].note, { style })
        ]
      })
    },
    async showRiskFactors() {
      const modal = await modalController.create({
        component: RiskFactorModal,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
          factors: this.riskFactors,
        },
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      if (!isEmpty(data)) {
        this.riskFactors = data.map((d: any) => {
          const val = d.isChecked === true ? "Yes" : "No";
          return {
            concept: d.concept,
            value: val,
          };
        });
      }
    },
    async alertTransferIn() {
      const action = await infoActionSheet(
        'Transfer in',
        "Does the patient want to transfer in for HTN management?",
        '',
        [
          { 
            name: 'Yes', 
            slot: 'end', 
            color: 'success'
          },
          { 
            name: 'No',  
            slot: 'start', 
            color: 'danger'
          }
        ]
      )
      if(action === 'Yes') {
        await this.enrollInHTN();
        await this.setHtnTransferred('Yes')
        this.patientFirstVisit = false;
        this.setBpActions()
      } else {
        await this.setHtnTransferred('No')
        this.nextTask()
      }
    },
    async enrollInHTN() {
      PopupKeyboard({
        id: "enrollment_date",
        helpText: "HTN Enrollment date",
        type: FieldType.TT_FULL_DATE,
        validation: (val: any) => Validation.required(val),
      }, 
      async (date: Option) => {
        try {
          const program  = new PatientProgramService(this.patientID)
          program.setProgramId(this.HTNProgramID)
          program.setProgramDate(`${date.value}`)
          program.setStateDate(`${date.value}`)
          program.setStateId(this.aliveState)
          await program.enrollProgram()
          await program.updateState()
          this.isEnrolledInHTN = true
          toastSuccess('Patient is now enrolled in HTN')
        } catch (e) {
          console.error(e)
          toastWarning(`${e}`)
        }
      })
    },
    async setHtnTransferred(transferred: 'Yes' | 'No'){
      const vitals = new VitalsService(this.patientID, this.providerID)
      const encounter = await vitals.createEncounter()
      if (!encounter) {
        toastWarning('Unable to create patient transfer encounter')
      } else {
        const obs = await vitals.saveValueCodedObs('Transferred', transferred)
        if (!obs) {
          toastWarning('Unable to create observation Transferred for patient')
        }
      }
    }
  }
})
</script>