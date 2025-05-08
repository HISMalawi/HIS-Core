<template>
    <his-standard-form :skipSummary="true" :fields="fields" @onFinish="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import {DrugService} from "@/services/drug_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field, Option } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import { StockService } from '@/apps/ART/views/ARTStock/stock_service';
import { isEmpty } from 'lodash';
import { printArtDrug } from '@/apps/ART/Labels';

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>,
        packSizes: [] as Array<number>,
    }),
    async created(){
        this.fields = [ 
            {
                id: 'drug',
                helpText: 'Select drug',
                type: FieldType.TT_SELECT,
                validation: (val: any) => Validation.required(val),
                options: async (_, filter='') => {
                    const drugs = await DrugService.getDrugs({name: filter})
                    return drugs.map((facility: any) => ({
                        label: facility.name,
                        value: facility.drug_id
                    }))
                },
                onValue: (drug: Option) => {
                    this.packSizes = StockService.getPackSizes(drug.value as number)
                    return drug
                },
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            },
            {
                id: 'drug_pack_size',
                helpText: "Select Quantity",
                type: FieldType.TT_SELECT,
                condition: () => !isEmpty(this.packSizes),
                options: () => [
                    ...this.packSizes.map(p => ({label: `${p}`, value: p })),
                    {label: "Other (specify)", value: "Other"}
                ]
            },
            {
                id: 'quantity',
                helpText: 'Input quantity',
                type: FieldType.TT_NUMBER,
                validation: (val: any) => Validation.required(val),
                condition: (f: any) => isEmpty(this.packSizes) || f.drug_pack_size.value.match(/other/i),
                config: {
                    showKeyboard: true,
                }
            }
        ]
    },
    methods: {
        async onSubmit(form: any) {
            const quantity = isEmpty(this.packSizes) || form.drug_pack_size.label.includes('Other')
                ? form.quantity.value
                : form.drug_pack_size.value
            try {
                await printArtDrug(form.drug.value, quantity)
                this.$router.push({path: '/'})
            }catch(e) { 
                console.log(e)
            }
        }
    }
})
</script>

