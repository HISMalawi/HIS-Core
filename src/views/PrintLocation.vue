<template>
    <his-standard-form :skipSummary="true" :fields="fields" @onFinish="onSubmit"/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import {LocationService} from "@/services/location_service"
import { FieldType } from "@/components/Forms/BaseFormElements"
import { Field } from "@/components/Forms/FieldInterface"
import Validation from "@/components/Forms/validations/StandardValidations"
import { printLocationLbl } from './Labels';

export default defineComponent({
    components: { HisStandardForm },
    data: () => ({
        fields: [] as Array<Field>    
    }),
    async created(){
        this.fields = [ 
            {
                id: 'location',
                helpText: 'Please select facility name',
                type: FieldType.TT_SELECT,
                defaultValue: () => LocationService.getUserLocation(),
                validation: (val: any) => Validation.required(val),
                options: async (_, filter='') => {
                    const facilities = await LocationService.getFacilities({name: filter})
                    return facilities.map((facility: any) => ({
                        label: facility.name,
                        value: facility.location_id
                    }))
                },
                config: {
                    showKeyboard: true,
                    isFilterDataViaApi: true
                }
            }
        ]
    },
    methods: {
        async onSubmit(form: any) {
            await printLocationLbl(form.location.value)
            this.$router.push({path: '/'})
        }
    }
})
</script>

