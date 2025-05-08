<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true" />
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface';
import { GLOBAL_PROP } from "@/apps/GLOBAL_APP/global_prop"
import { GlobalPropertyService } from '@/services/global_property_service';
import { IonPage } from "@ionic/vue"

export default defineComponent({
	components: { 
		HisStandardForm, 
		IonPage 
	},
	data: () => ({
		fields: [] as any
	}),
	created() {
		this.fields = [
			this.inactivityTimeout()
		]
	},
	methods: {
		onFinish(_: any, data: any) {
			Promise.all(Object.keys(data).map((prop) => GlobalPropertyService.set(prop, data[prop])))
                .then(()=> this.$router.push('/'))
		},
		inactivityTimeout() {
			let presetTimeout = 0
			return {
				id: GLOBAL_PROP.INACTIVITY_TIMEOUT,
				helpText: "Specify the minutes of inactivity before logging out the user.",
				type: FieldType.TT_NUMBER,
				init: async () => {
					presetTimeout = await GlobalPropertyService.get(GLOBAL_PROP.INACTIVITY_TIMEOUT)
					return true
				},
				defaultValue: () => presetTimeout > 0 ? presetTimeout/60000 : presetTimeout,
				computedValue: (val: Option) => parseInt(`${val.value}`) * 60000, //convert minutes to milliseconds
				validation: (val: Option) => Validation.validateSeries([
					() => Validation.required(val),
					() => Validation.rangeOf(val, 0, 1440)
				])
			}
		}
	}
})
</script>
