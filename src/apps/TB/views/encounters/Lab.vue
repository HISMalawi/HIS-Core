<template>
    <ion-page>
        <his-standard-form :cancelDestinationPath="patientDashboardUrl" 
            :onFinishAction="onFinish" :fields="fields"
            :skipSummary="true" />
    </ion-page>
</template>
  
<script lang="ts" setup>
import { AppEncounterService } from '@/services/app_encounter_service';
import { EncounterType } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { mapStrToOptions, resolveObs } from '@/utils/HisFormHelpers/commons';
import { LabService } from "../../services/lab_service"
import dayjs from 'dayjs';
import { Service } from '@/services/service';
import { getLabFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import Validation from '@/components/Forms/validations/StandardValidations';
import { TbGlobals } from "@/apps/TB/meta/constants"
import { GlobalPropertyService } from '@/services/global_property_service';
import { toastWarning } from '@/utils/Alerts';
import { useRoute } from 'vue-router';
import TbService from "../../services/tb_service"

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.LAB_ORDER);
const route = useRoute()

async function postLabOrder(f: any, encounterId: number) {
    const order = {
        tests: [{
            test_type: 'TB',
            sample_status: "N/A",
            target_lab: f.target_lab.value,
            sample_type: f.sample_type.value,
            recommended_examination: f.examination.value,
            sample_date: service.date,
            sending_facility: Service.getLocationName(),
            time_line: f.time_line?.value === 'Other'
                ? `Month ${f.otherTimeLine?.value}`
                : f.time_line?.value || 'N/A',
            treatment_history: 'N/A',
            reason: f.time_line?.value ? 'Follow up' : 'Diagnosis'
        }],
        encounter_id: encounterId,
        requesting_clinician: Service.getUserName()
    }
    await Service.postJson(`programs/${Service.getProgramID()}/lab_tests/orders`, order)
    await TbService.printLabOrder(service.patientID, order.tests[0])
}

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID, p, facts) => {
    service.patientID = patientID
    service.providerID = provider

    const sampleTypeField = () => {
        let samples: string[] = []
        return {
            id: 'sample_type',
            helpText: 'TB Test Specimens Types',
            type: FieldType.TT_SELECT,
            requireNext: false,
            init: async () => {
                try {
                    samples = await Service.getJson(`/programs/${Service.getProgramID()}/lab_tests/panels`, {
                        test_type: "TB Tests"
                    })
                } catch (e) {
                    toastWarning("Unable to load samples!")
                    return false
                }
                return true
            },
            computedValue: (v: Option) => ({
                concept_id: getConceptID('SAMPLE'),
                value_coded: getConceptID(`${v.value}`),
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            options: () => mapStrToOptions(samples)
        } as Field
    } 

    const examinationField = () => {
        const examTurnAroundDates: any = {}
        return {
            id: 'examination',
            helpText: 'Examination',
            type: FieldType.TT_SELECT,
            beforeNext: async (v: Option) => {
                if (!examTurnAroundDates[v.other]) {
                    try {
                        const [time, unit] = (await GlobalPropertyService.get(v.other)).split('_')
                        examTurnAroundDates[v.other] = dayjs(`${service.date} ${dayjs().format('HH:mm:ss')}`)
                            .add(parseInt(time), unit)
                            .format('YYYY-MM-DD HH:mm:ss')
                    } catch (e) {
                        console.warn(`${e}`)
                    }
                }
                return true
            },
            defaultValue: () => route?.query?.test,
            computedValue: (v: Option) => ([
                {
                    concept_id: getConceptID('TEST_REQUESTED'),
                    value_coded: getConceptID(`${v.value}`),
                    obs_datetime: service.date
                },
                ...(() => {
                    if (examTurnAroundDates[v.other]) return [{
                        concept_id: getConceptID('Estimated turnaround time for result'),
                        value_datetime: examTurnAroundDates[v.other],
                        obs_datetime: service.date
                    }]
                    return []
                })()
            ]),
            validation: (v: Option) => Validation.required(v),
            options: () =>  [
                { value: 'MICROSCOPY', label: 'Microscopy', other: TbGlobals.MICROSCOPY_RESULT_TURN_AROUND },
                { value: 'XPERT_MTB_RIF', label: 'Xpert MTB/RIF', other: TbGlobals.XPERT_MTB_RIF_RESULT_TURN_AROUND },
                { value: 'CULTURE_AND_DST', label: 'Culture and DST', other: TbGlobals.CULTURE_AND_DST_RESULT_TURN_AROUND },
                { value: 'LPA', label: 'LPA', other: TbGlobals.LPA_RESULT_TURN_AROUND },
                { value: 'LAM', label: 'LAM', other: TbGlobals.LAM_RESULT_TURN_AROUND },
            ]
        } as Field
    } 

    const targetLabField = () => {
        return {
            id: 'target_lab',
            helpText: 'Select Lab:',
            type: FieldType.TT_SELECT,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('LAB'),
                value_text: `${v.value}`,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            defaultValue: () => Service.getLocationName(),
            options: async (_: any, filter='') => {
                try {
                    return await getLabFacilities(filter)
                } catch (e) {
                    return mapStrToOptions([`${Service.getLocationName()}`])
                }
            },
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true
            }
        } as Field
    }

    const timeLineField = () => {
        let hasRecentLabOrder = false
        return {
            id: 'time_line',
            helpText: 'Follow Up Lab Order Month for Month',
            type: FieldType.TT_SELECT,
            init: async () => {
                const data = await LabService.getRecentOrders(patientID)
                if (data) {
                    const orderDate = dayjs(data.encounter_datetime).format('YYYY-MM-DD')
                    const diff = dayjs(service.date).diff(orderDate, 'days', true)
                    hasRecentLabOrder = diff >= 28
                }
                return true
            },
            defaultValue: () => {
                const duration = dayjs(service.date).diff((facts.outcomeStartDate||service.date), 'months')
                if (!(facts.isBdeMode||duration <=0)) return `Month ${duration}`
            },
            condition: () => hasRecentLabOrder,
            validation: (v: Option) => Validation.required(v),
            computedValue: (v: Option) => {
                if (v.value != 'Other') return [{
                    concept_id: getConceptID('FOLLOW_UP'),
                    value_text: v.value,
                    obs_datetime: service.date
                }] 
            },
            options: () => [
                { value: 'Month 2', label: 'Month 2' },
                { value: 'Month 3', label: 'Month 3' },
                { value: 'Month 4', label: 'Month 4' },
                { value: 'Month 6', label: 'Month 6' },
                { value: 'Other', label: 'Other' },
            ],
        } as Field
    } 

    const otherTimeLineField = () => {
        return {
            id: 'otherTimeLine',
            helpText: 'Other Follow Up Lab Order Month for Month:',
            type: FieldType.TT_NUMBER,
            computedValue: (v: Option) => ({
                concept_id: getConceptID('FOLLOW_UP'),
                value_text: `Month ${v.value}`,
                obs_datetime: service.date
            }),
            validation: (v: Option) => Validation.required(v),
            condition: (f: any) => f.time_line.value === 'Other',
        } as Field
    } 

    fields.value = [
        sampleTypeField(),
        examinationField(),
        targetLabField(),
        timeLineField(),
        otherTimeLineField()
    ]
});

function generateTestReason(formData: any): string {
    return route?.query?.reason
        ? `${route?.query?.reason}`
        : formData.time_line?.value
        ? 'FOLLOW_UP'
        : 'DIAGNOSIS'
}

function buildExtraObs(formData: any) {
    return [
        {
            concept_id: getConceptID('TEST_TYPE'),
            value_coded: getConceptID('TB'),
            obs_datetime: service.date
        },
        {
            concept_id: getConceptID('REASON_FOR_TEST'),
            value_coded: getConceptID(generateTestReason(formData)),
            obs_datetime: service.date
        }
    ]
}

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList([...buildExtraObs(f),...(await resolveObs(cdata))]);
    await postLabOrder(f, service.encounterID) 
    goToNextTask();
}
</script>
