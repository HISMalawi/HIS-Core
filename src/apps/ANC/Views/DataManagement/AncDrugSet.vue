<template>
    <ion-page>
        <his-standard-form
        :key="hisFormKey"
        :activeField="fieldComponent"
        :skipSummary="true"
        :fields="fields"
        @onIndex="fieldComponent=''"
        @onFinish="onFinish"
        ></his-standard-form>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import {
    IonPage
} from "@ionic/vue"
import { DrugService } from '@/services/drug_service';
import { DRUG_FREQUENCIES } from "@/apps/ANC/Services/anc_treatment_service";
import { NewDrugSet, AncDrugSetService } from "@/apps/ANC/Services/anc_drug_set";
import { toastSuccess, toastWarning } from '@/utils/Alerts';

export default defineComponent({
    components: { HisStandardForm, IonPage },
    data: () => ({
        hisFormKey: 0 as number,
        fields: [] as Array<Field>,
        allDrugs: [] as Array<Option>,
        fieldComponent: '' as string,
        service: {} as any
    }),
    created() {
        this.fields = this.getFields()
    },
    methods: {
        async onFinish(_: any, computedData: NewDrugSet) {
            try {
                if ((await AncDrugSetService.saveDrugSet(computedData))) {
                    toastSuccess('Drugset saved successfully');
                    return this.$router.back()
                }
                toastWarning('Unable to save drugset')
            } catch (e) {
                toastWarning(`${e}`)
            }
        },
        getFields() {
            return [
                {
                    id: 'name',
                    helpText: 'Enter drug set name',
                    type: FieldType.TT_TEXT,
                    computedValue: (v: Option) => v.value,
                    validation: (v: Option) => Validation.validateSeries([
                        () => Validation.required(v),
                        () => !`${v.value}`.match(/^([a-zA-Z_ ]{2,17})'?-?([a-zA-Z_ ]{1,17})$/)
                            ? ['Enter a valid drug set name.']
                            : null
                    ]),

                },
                {
                    id: 'description',
                    helpText: 'Drug set description',
                    type: FieldType.TT_TEXT,
                    computedValue: (v: Option) => v.value,
                    validation: (v: Option) => Validation.validateSeries([
                        () => Validation.required(v),
                        () => !`${v.value}`.match(/^([a-zA-Z_ ]{2,100})'?-?([a-zA-Z_ ]{1,100})$/)
                            ? ['Enter a valid drug set description']
                            : null
                    ]) 
                },
                {
                    id: 'drug_selection',
                    helpText: 'Select drugs to add',
                    type: FieldType.TT_ASYNC_MULTI_SELECT,
                    options: async (_: any, name="") => {
                        return (await DrugService.getDrugs({ page_size: 20, name }))
                            .map((d: any) => ({
                                label: d.name,
                                value: d.id,
                                other: {
                                    'drug': d.name,
                                    'quantity': 0,
                                    'frequency': '',
                                }
                            }))
                    },
                    validation: (v: Option[]) => Validation.required(v)
                },
                {
                    id: 'drugs',
                    helpText: 'Set drugs',
                    type: FieldType.TT_ANC_DRUGSET_INPUT,
                    computedValue: (v: Option[]) => v.map(d => d.other), 
                    validation: (v: Option[]) => Validation.validateSeries([
                        () =>  Validation.required(v),
                        () => !v.map(d => d.other.quantity && d.other.frequency).every(Boolean)
                                ? ['Data is not complete']
                                : null
                    ]),
                    options: (fdata: any) => fdata.drug_selection as Option[],
                    config: {
                        drugFrequencies: Object.keys(DRUG_FREQUENCIES)
                            .map((k: string) => ({ label: k, value: k }))
                    }
                }
            ]
        }
    }
})
</script>
