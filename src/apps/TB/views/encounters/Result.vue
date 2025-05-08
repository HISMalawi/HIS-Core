<template>
	<ion-page>
		<his-standard-form :cancelDestinationPath="patientDashboardUrl" :onFinishAction="onFinish" :fields="fields"
			:skipSummary="true" />
	</ion-page>
</template>
  
<script lang="ts" setup>
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import Validation from '@/components/Forms/validations/StandardValidations';
import { LabService } from "../../services/lab_service"
import { getConceptID } from '../../services/util';
import { toastWarning } from '@/utils/Alerts';
import router from '@/router';
import HisDate from "@/utils/Date"

const fields = ref<Field[]>([]);

const EXAM_MAP = {
	[getConceptID('MICROSCOPY')] : {
		label: 'Microscopy',
		value: '/tb/results/microscopy'
	},
	[getConceptID('XPERT_MTB_RIF')] : {
		label: 'Xpert MTB/RIF',
		value: '/tb/results/xpert'
	},
	[getConceptID('LPA')]: {
		label: 'LPA',
		value: '/tb/results/lpa'
	},
	[getConceptID('LAM')]: {
		label: 'LAM',
		value: '/tb/results/lam'
	},
	[getConceptID('CULTURE_AND_DST')]: {
		label: 'Culture and DST',
		value: '/tb/results/culture'
	}
}

const { patientDashboardUrl, patientId } = useEncounter((provider, patientID) => {
	const examinationField = () => {
		const recentExams: Record<string, Option> = {}
		return {
			id: 'examination',
			helpText: 'Recent Examination(s):',
			type: FieldType.TT_SELECT,
			init: async () => {
				try {
					(await LabService.getRecentOrders(patientID)).observations.forEach((obs: any) => {
						if (obs.concept_id === getConceptID('TEST_REQUESTED') 
							&& EXAM_MAP[obs.value_coded] && !recentExams[obs.value_coded]) {
								recentExams[obs.value_coded] = {
									...EXAM_MAP[obs.value_coded], 
									other: HisDate.toStandardHisFormat(obs.obs_datetime)
								}
						}
					})
				} catch (e) {
					console.error(`${e}`)
					toastWarning("No recent results found")
				}
				return true
			},
			validation: (v: Option) => Validation.required(v),
			options: () => Object.values(recentExams)
		}
	}

	fields.value = [
		examinationField()
	]
});

function onFinish(f: any) {
	router.push(`${f.examination.value}/${patientId.value}?date=${f.examination.other}`)
}
</script>
