<template>
    <ion-page> 
        <his-standard-form
            :fields="fields"
            :onFinishAction="onFinish"
            :skipSummary="true"
        > 
        </his-standard-form>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { FieldType } from "@/components/Forms/BaseFormElements";
import AETC_PROP from "@/apps/AETC/aetc_global_props"
import { PatientDiagnosisService } from "@/apps/OPD/services/patient_diagnosis_service"
import {AETC_GLOBAL_PROP} from "@/apps/AETC/aetc_global_props"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations"
import { Option } from '@/components/Forms/FieldInterface';
import { isEmpty } from "lodash"
import { ConceptName } from '@/interfaces/conceptName';
import { GlobalPropertyService } from '@/services/global_property_service';
import { toastSuccess } from '@/utils/Alerts';
import { IonPage } from "@ionic/vue"
import { DrugPrescriptionService } from '@/apps/OPD/services/drug_prescription_service';

export default defineComponent({
	components: { HisStandardForm, IonPage },
	data: () => ({
		preference: '' as string,
		fields: [] as any
	}),
	created() {
		this.preference = this.$route.name as string
		this.fields = [
			...this.setTopTenDiagnosis(),
			...this.setTopTenDrugs(),
		]
	},
	methods: {
		isProp(prop: string) {
			return !this.preference || prop === this.preference
		},
		async onFinish(_: any, data: Record<string, any>) {
			for(const prop in data) {
				await GlobalPropertyService.set(prop, data[prop])
				toastSuccess('Property has been updated', 2000)
			}
			this.$router.back()
		},
		mapListToOptions(list: ConceptName[]){
			if(isEmpty(list)) return []
				return list.map(item => ({
					label: item.name, value: item.name, other: item.concept_id, isChecked: false
			})).sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
		},
		
		setTopTenDiagnosis() {
			const prop = AETC_GLOBAL_PROP.SET_TOP_10_DIAGNOSIS
			const toStr = (v: Option[]) => v.map(d => d.value).join()
			return [
				{
					id: 'primary_diagnosis',
					helpText: 'Select top ten diagnosis',
					type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
					validation: (data: any) => Validation.required(data),
					options: async (_:any, filter='', page=1, limit=10) => this.mapListToOptions(
						await PatientDiagnosisService.getDiagnosis(filter, page, limit)
					),
					computedValue: (v: Option[]) => toStr(v),
					condition : () => this.isProp(prop),
					defaultValue: () => AETC_PROP.topTenDiagnosis(),
					config: {
						isFilterDataViaApi: true,
						showKeyboard: true,
					}
				}
			]
		},

		setTopTenDrugs() {
			const prop = AETC_GLOBAL_PROP.SET_TOP_10_DRUGS
			const toStr = (v: Option[]) => v.map(d => d.value).join()
			return [
				{
					id: 'primary_drugs',
					helpText: 'Select top ten drugs',
					type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
					validation: (data: any) => Validation.required(data),
					options: async (filter = '', page =1, limit=10) => this.mapListToOptions(
						await DrugPrescriptionService.getDrugs(filter, page, limit)
					),
					computedValue: (v: Option[]) => toStr(v),
					condition : () => this.isProp(prop),
					defaultValue: () => AETC_PROP.topTenDiagnosis(),
					config: {
						isFilterDataViaApi: true,
						showKeyboard: true,
					}
				}
			]
		},
	}
})
</script>
