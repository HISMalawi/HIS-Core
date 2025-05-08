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
import { PatientComplaintsService } from "@/apps/OPD/services/patient_complaints_service";
import radiology from "@/apps/OPD/views/encounters/modals/radiology.vue"
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { modalController, IonPage } from '@ionic/vue';
import { ObservationService } from "@/services/observation_service"
import { EncounterService } from '@/services/encounter_service'
import HisDate from "@/utils/Date"
import OPD_GLOBAL_PROP from "@/apps/OPD/opd_global_props";
import { alertConfirmation, toastWarning } from '@/utils/Alerts';
import { AppEncounterService } from '@/services/app_encounter_service';
import { OrderService } from '@/services/order_service';
import Store from "@/composables/ApiStore"
import { isEmpty } from 'lodash';

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
    labOrderFieldContext: {} as any,
    labOrders: [] as any,
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.complaintsService = new PatientComplaintsService(this.patientID, this.providerID)
          this.isPacsEnabled = (await OPD_GLOBAL_PROP.isPACsEnabled())
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
      try {
        const complaints = await this.resolveObs(computedData, 'complaints')

        await this.complaintsService.createEncounter()    
        await this.complaintsService.saveObservationList(complaints)
        this.nextTask()
      } catch (error) {
        console.error(error)
        toastWarning('An error occurred while saving the complaints');
      }        
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
          computedValue: (options: Option[]) => ({
            tag: "complaints",
            obs: options
              .filter((option) => !/other (specify)/i.test(option.label))
              .map(async (option)=> ({
              ...(await this.complaintsService.buildValueCoded('Presenting complaint', option.other.parent)),
              child: [await this.complaintsService.buildValueCodedFromConceptId(option.other.parent, option.other.concept_id)]
            }))
          }),
        },
        {
          id: 'other_complaints',
          helpText: 'Other Complaints',
          type: FieldType.TT_TEXT,
          condition: (f: any) => {
            return f.complaints.some((c: any) => c.label === 'Other (specify)' && c.isChecked)
          },
          computedValue: async (data: any) => ({
            tag: "complaints",
            obs: {
              ...(await this.complaintsService.buildValueCoded('Presenting complaint', 'Other')),
              child: [await this.complaintsService.buildValueText('Other', data.label)]
            }
          }),
        },
        {
          id: "lab_order",
          helpText: "Lab Orders",
          type: FieldType.TT_LAB_ORDERS,
          onload: (ctx: any) => this.labOrderFieldContext = ctx,
          init: async () => {
            this.labOrders = OrderService.formatLabs(
              await Store.get('GET_LAB_ORDERS_WITH_GIVEN_RESULT_STATUS', { 
                patientID: this.patientID 
              })
            );
            return true;
          },
          unload: async () => {
            const noGivenResults = this.labOrders.filter((r: any) => r.result_given === 'No')
            if (noGivenResults.length && (await alertConfirmation('Result(s) Given to Client?'))) {
              const enc = new AppEncounterService(this.patientID, -1, this.providerID)
              // flatten array and save observations for results given
              const obs = noGivenResults.reduce((all: any, result: any) => [
                ...all, ...(result.resultIds.map(async (resultID: number) =>{
                  enc.encounterID = result.encounter_id
                  return enc.saveObs((await enc.buildObs("Result Given to Client", {
                      "value_coded": "Yes",
                      "obs_group_id": resultID
                    })))
                })) 
              ], [])
              await Promise.all(obs)
            }
          },
          options: () => {
            return [
              {
                label: "Lab orders",
                value: "order trail",
                other: {
                  values: this.labOrders
                }
              }
            ]
          },
          config: {
            hiddenFooterBtns: [ this.showRadiologyOdersBtn()],
            footerBtns: [
              {
                name: "Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => {
                  if(!isEmpty(this.labOrderFieldContext)){
                    await this.labOrderFieldContext.launchOrderSelection()
                  } 
                }
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
  }
})
</script>
<style>
  .his-table tr {
    height: 50px;
  }
</style>
