<template>
  <ion-page>
    <his-standard-form :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from '@/views/EncounterMixin.vue';
import { PatientRadiologyService } from "@/apps/OPD/services/patient_radiology_service";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import OPD_GLOBAL_PROP from "@/apps/OPD/opd_global_props";
import moment from "dayjs";

export default defineComponent({
  components: { HisStandardForm },
  mixins: [EncounterMixinVue],
  data: () => ({
    radiologyService: {} as any,
    isPacsEnabled: false,
    previousRadiologyExaminations: {} as any
  }),
  watch: {
    ready: {
      async handler(isReady: boolean) {
        if(isReady){
          this.radiologyService = new PatientRadiologyService(this.patientID, this.providerID)
          this.isPacsEnabled = (await OPD_GLOBAL_PROP.isPACsEnabled())
          this.previousRadiologyExaminations = await this.radiologyService.showPreviousRadiolgy(this.patient)
          this.fields = this.getFields()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async onSubmit(_: any, computedData: any){
      const data = await Promise.all(computedData.radiology)
      await this.radiologyService.createEncounter()
      const obsObj = await this.radiologyService.obsObj(data) 
      const savedObsData = await this.radiologyService.saveObservationList(obsObj)
      await this.radiologyService.printOrders(savedObsData, this.patient)
      if(this.isPacsEnabled) {
        try {
          await this.radiologyService.submitToPacs(savedObsData, this.patient)
        } catch (error) {
          console.log(error)
        }
      }
      this.gotoPatientDashboard()
    },
    async getTableData() {
      const params = await this.radiologyService.getPreviousRadiologyExaminations(this.patient)
      const data = params.data
      const url = params.url
      const columns = ['Accession#','Body Part', 'Order Type', 'Ordered', 'Result']
      const rows = [] as Array<any>
      for (const order in data) {
        const row = [
          data[order].children[0].accession_number,
          data[order].value_text,
          data[order].children[0].value_text,
          moment(data[order].obs_datetime).format('DD/MMM/YYYY'),
          `<ion-button slot="end" size="large" href="${url}" color="success">
            View
          </ion-button>`
        ]
        rows.push(row)
      }
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
          id: 'radiology_results',
          helpText: 'Previous Radiology Examinations',
          condition: () => this.previousRadiologyExaminations,
          type: FieldType.TT_TABLE_VIEWER,
          options: () => this.getTableData(),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
        {
          id: 'radiology',
          helpText: 'Radiology Examination',
          type: FieldType.TT_RADIOLOGY_PICKER,
          validation: (data: any) => Validation.required(data),
          config: {
            hiddenFooterBtns: [ this.disableBackBtn() ],
          },
          computedValue: (options: Option[]) => {
            return options.map(async (option)=> ({
              ...(await this.radiologyService.buildValueCoded('Radiology Orders', option.other.parent)),
              child: [await this.radiologyService.buildValueCodedFromConceptId(option.other.parent, option.other.concept_id)]
            }))
          },
        },
      ]
    },
    disableBackBtn() {
      if(this.previousRadiologyExaminations) {
        return ''
      } else return 'Back'
    }
  }
})
</script>

