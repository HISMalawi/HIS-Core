<template>
  <ion-page>
    <his-standard-form 
    :cancelDestinationPath="cancelDestination" 
    :fields="fields" 
    :onFinishAction="onSubmit"
    :skipSummary="true"/>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientComplaintsService } from "@/apps/AETC/services/patient_complaints_service";
import LabOrderModal from "@/components/DataViews/LabOrderModal.vue"
import radiology from "@/apps/AETC/views/encounters/modals/radiology.vue"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { modalController, IonPage } from '@ionic/vue';
import { ObservationService } from "@/services/observation_service"
import { EncounterService } from '@/services/encounter_service'
import HisDate from "@/utils/Date"
import AETC_GLOBAL_PROP from "@/apps/AETC/aetc_global_props";

export default defineComponent({
  components: { HisStandardForm, IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    complaintsService: {} as any,
    todaysDate: ObservationService.getSessionDate(),
    presentingComplaints: "" as any,
    isPacsEnabled: false,
    radiologyBtnName: 'Radiology Order',
    hasTriageComplaints: false,
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.complaintsService = new PatientComplaintsService(this.patientID, this.providerID)
          this.isPacsEnabled = (await AETC_GLOBAL_PROP.isPACsEnabled())
          this.hasTriageComplaints = await this.getTriagePresentingComplaints()
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(_: any, computedData: any){     
      const data = await Promise.all(computedData.complaints)   
      await this.complaintsService.createEncounter()    
      await this.complaintsService.saveObservationList(data)
      this.nextTask()        
    },
    async launchOrderSelection() {
      const modal = await modalController.create({
        component: LabOrderModal,
        backdropDismiss: false,
        cssClass: 'large-modal'
      })
      modal.present()
      await modal.onDidDismiss()
    },
    async launchRadiologyOrderSelection() {
      const modal = await modalController.create({
        component: radiology,
        backdropDismiss: false,
        cssClass: 'large-modal'
      })
      modal.present()
      await modal.onDidDismiss()
    },
    async getTriagePresentingComplaints(){
      const data =  await this.complaintsService.fetchLatestTriageEncounter();
      if(!(data.length > 0)){ return false;}

      const encounters = await EncounterService.getEncounters(this.patientID, this.todaysDate)
      const todayPresentingComplaints = encounters.filter(function (el: any){
        return el.type.name == "TRIAGE PRESENTING COMPLAINTS" &&
        HisDate.toStandardHisFormat(el.encounter_datetime) == ObservationService.getSessionDate() 
      });
      if(!(todayPresentingComplaints.length > 0)) {return false;}

      this.presentingComplaints =   todayPresentingComplaints[0].observations;
      return true;
    },
    buildResults() {
      const columns = [ 'Group','Presenting complaints'];
      let group = "";
      let rows =this.presentingComplaints.map((item: any) =>{
        if(item.obs_group_id != null)
          return [group,item.value_text]

        group = item.value_text;
      });
      rows = rows.filter((el: any) =>{
        return el != undefined
      })
      this.presentingComplaints = rows;
      return [
        {
          label: '',
          value: '',
          other: { columns, rows},
        },
      ];
    },

    getFields(): Array<Field>{
      return [
        {
          id: "triage_complaints",
          helpText: "Triaging Complaints",
          condition: () => this.hasTriageComplaints,
          type: FieldType.TT_TABLE_VIEWER,
          options: () => this.buildResults(),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
        {
          id: 'complaints',
          helpText: 'Presenting Complaints',
          type: FieldType.TT_COMPLAINTS_PICKER,
          validation: (data: any) => Validation.required(data),
          computedValue: (options: Option[]) => {
            return options.map(async (option)=> ({
              ...(await this.complaintsService.buildValueCoded('Presenting complaint', option.other.parent)),
              child: [await this.complaintsService.buildValueCodedFromConceptId(option.other.parent, option.other.concept_id)]
            }))
          },
          config: {
            hiddenFooterBtns: [ this.showRadiologyOdersBtn(), this.disableBackBtn()],
            footerBtns: [
              {
                name: "Lab Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => await this.launchOrderSelection(),
                visibleOnStateChange: (state: Record<string, any>) => {
                  return state.index === 1;
                },
              },
              {
                name: this.radiologyBtnName,
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => await this.launchRadiologyOrderSelection(),
                visibleOnStateChange: (state: Record<string, any>) => {
                  return state.index === 1;
                },
              }
            ],
          }
        },
        {
          id: "all_presenting_complaints",
          helpText: "Summary",
          condition: () => this.presentingComplaints.length > 0,
          type: FieldType.TT_SUMMARY,
          options: (d: any) => this.buildSummaryResults(d),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
      ]
    },
    showRadiologyOdersBtn() {
      if(this.isPacsEnabled) {
        return ''
      } else return this.radiologyBtnName
    },
    buildSummaryResults(data: any) {
      const OPDComplaint = data.complaints.map((value: any)=>{
        return {
          'label': "OPD Complaints",
          'value': value.label,
        };
      })
      const triageComplaint = this.presentingComplaints.map((value: any)=>{
        return {
          'label': 'Triaging Complaints',
          'value': value[1],
        };
      })
      return OPDComplaint.concat(triageComplaint);
    },
    disableBackBtn() {
      if(this.hasTriageComplaints) {
        return ''
      } else return 'Back'
    }
  }
})
</script>
<style>
  .his-table tr {
    height: 50px;
  }
</style>
