<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"> 
        </his-standard-form>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements";
import RADIOLOGY_PROP from "@/apps/RADIOLOGY/radiology_global_props"
import { RADIOLOGY_GLOBAL_PROP } from "@/apps/RADIOLOGY/radiology_global_props"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface';
import { GlobalPropertyService } from '@/services/global_property_service';
import { toastSuccess } from '@/utils/Alerts';
import { IonPage } from "@ionic/vue"
import {
	getFacilities
} from '@/utils/HisFormHelpers/LocationFieldOptions'

export default defineComponent({
	components: { HisStandardForm, IonPage },
	data: () => ({
		preference: '' as string,
		fields: [] as any
	}),
	created() {
		this.preference = this.$route.params.name as string
		this.fields = [
			...this.defaultReferralLocation()
		]
	},
	methods: {
		async onFinish(_: any, data: Record<string, any>) {
			for(const prop in data) {
				await GlobalPropertyService.set(prop, data[prop])
				toastSuccess('Property has been updated', 2000)
			}
			this.$router.back()
		},
        isPreference(prop: string) {
			return !this.preference || prop === this.preference
		},
		defaultReferralLocation() {
			return [
				{
					id: RADIOLOGY_GLOBAL_PROP.DEFAULT_REFERRAL_LOCATION,
					helpText: 'Default external referral location',
					type: FieldType.TT_SELECT,
					computedValue: (v: Option) => v.label,
					defaultValue: () => RADIOLOGY_PROP.defaultReferralLocation(),
					validation: (val: any) => Validation.required(val),
					condition: () => this.isPreference('default_referral_location'),
					options: (_: any, filter='') => getFacilities(filter),
					config: {
						showKeyboard: true,
						isFilterDataViaApi: true
					}
				}
			]
		}
	}
})
</script>
