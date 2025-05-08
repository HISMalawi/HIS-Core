<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"
        />
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
			this.enablePasswordChangePolicy(),
			this.setPasswordChangeInterval()
		]
	},
	methods: {
		async onFinish(_: any, data: any) {
			await Promise.all(
				Object.keys(data).map((prop) => GlobalPropertyService.set(prop, data[prop]))
			)
			this.$router.push('/')
		},
		enablePasswordChangePolicy() {
			let policyEnabled = false
			return {
				id: GLOBAL_PROP.PASSWORD_POLICY_ENABLED,
				helpText: "Password reset policy",
				type: FieldType.TT_YES_NO,
				init: async () => {
					policyEnabled = await GlobalPropertyService.isProp(`${GLOBAL_PROP.PASSWORD_POLICY_ENABLED}=true`)
					return true
				},
				validation: (val: any) => Validation.required(val),
				defaultValue: () => policyEnabled,
				computedValue: (val: any) => val,
				options: () => [
					{
						label: 'Do you want to enable password reset policy?',
						values: [
							{
								label: "Yes",
								value: "true"
							},
							{
								label: "No",
								value: "false"
							}
						]
					}
				]
			}
		},
		setPasswordChangeInterval() {
			let presetResetPeriod = 0
			return {
				id: GLOBAL_PROP.PASSWORD_RESET_INTERVAL,
				helpText: "Specify number of days to reset password",
				type: FieldType.TT_NUMBER,
				init: async () => {
					presetResetPeriod = await GlobalPropertyService.get(GLOBAL_PROP.PASSWORD_RESET_INTERVAL)
					return true
				},
				defaultValue: () => presetResetPeriod,
				computedValue: (val: Option) => val.value,
				condition: (f: any) => f[GLOBAL_PROP.PASSWORD_POLICY_ENABLED] === 'true',
				validation: (val: Option) => Validation.validateSeries([
					() => Validation.required(val),
					() => Validation.rangeOf(val, 1, 365)
				])
			}
		}
	}
})
</script>
