<template>
  <ion-page> 
    <his-standard-form 
      :fields="formFields"
      :skipSummary="true"
      :onFinishAction="onFinish"
      :cancelDestinationPath="cancelDestination" 
    />
  </ion-page>
</template>

<script lang="ts">
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { defineComponent } from 'vue'
import { AncSurgicalHistoryService} from "@/apps/ANC/Services/anc_surgical_history_service"
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { IonPage } from "@ionic/vue"
import { find, findIndex } from 'lodash'
import { ObsValue } from '@/services/observation_service'

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    formFields: [] as any,
    service: {} as any
  }),
  watch: {
    ready: {
      handler(ready: boolean) {
        if (ready) this.formFields = this.getFields()
      },
      immediate: true
    }
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      const obs = await this.resolveObs(computedData)
      const anc = new AncSurgicalHistoryService(this.patientID, this.providerID)
      await anc.createEncounter()
      await anc.saveObservationList(obs as ObsValue[])
      this.nextTask()
    },
    surgeryOptions(onMap: (v: Option) => Option) {
      return [
        ...AncSurgicalHistoryService.surgicalHistoryOptions(), 
        { name: 'None'}
      ].map(h =>(onMap({
          label: h.name,
          value: 'Yes',
          isChecked: false
      })))
    },
    getFields() {
      return [
        {
          id: 'history',
          helpText: 'Previous Surgical Procedure(s) Done',
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (v: Option[]) => Validation.required(v),
          onValueUpdate: (list: Option[], option: Option) => {
            if (option.label === 'None' && option.isChecked) {
                return list.map(i => {
                    if (i.label != "None") i.isChecked = false;
                    return i
                })
            } else if (option.label != 'None' && option.isChecked){
                const noneIndex = findIndex(list, { label: "None" });
                list[noneIndex].isChecked = false; 
            }
            return list
          },
          computedValue: (v: Option[]) => {
            if (find(v, { label: 'None' })) {
              return AncSurgicalHistoryService.buildValueText('Procedure done', 'None')
            }
            return v.map(i => AncSurgicalHistoryService.buildValueCoded(i.label, `${i.value}`))
          },
          options: () => this.surgeryOptions(i => i),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: false,
            footerBtns: [
              {
                "name": "None",
                "slot": "end",
                onClickComponentEvents: {
                  refreshOptions: () => this.surgeryOptions(i => {
                    i.isChecked = i.label === 'None'
                    return i
                  })
                },
                onClick: () => "None"
              }
            ]
          }
        }
      ]
    }
  }
})
</script>
