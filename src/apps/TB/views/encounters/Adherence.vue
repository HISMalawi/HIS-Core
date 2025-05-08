<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true"
      />
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
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from "@/components/Forms/validations/StandardValidations"
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import HisDate from "@/utils/Date"
import { ConceptService } from '@/services/concept_service';
import { toastWarning } from '@/utils/Alerts';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.ADHERENCE);

function calculateUnaccountedOrMissed(expected: string, actual: string) {
    const exp = (parseFloat(expected) - parseFloat(actual));
    return (exp < 0 ? ((exp * -1) + ' missed') : (exp + ' unacc'));
}

function calcTimeElapsed(date1: string, timeUnit: 'week' | 'day') {
    return dayjs(HisDate.toStandardHisFormat(service.date)).diff(HisDate.toStandardHisFormat(date1), timeUnit)
}

function calculateAdherence(given: number, pills: number, expected: number) {
    return Math.round(100 * (given - pills) / (given - expected));
}

function calculateExpected(d: any) {
    const timeUnit = d.frequency === 'QW' ? 'week' : 'day'
    const daysGone = calcTimeElapsed(d.order.start_date, timeUnit)
    return (d.quantity - (daysGone * parseFloat(`${d.equivalent_daily_dose}`)));
}

const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider

    const pillsBroughtField = () => {
        let orders: any = []
        return {
            id: 'pills_brought',
            helpText: 'Pills remaining (brought to clinic)',
            type: FieldType.TT_ADHERENCE_INPUT,
            init: async () => {
                try {
                    orders = await AppEncounterService.getJson(`patients/${patientID}/drugs_orders_by_program`, {
                        date: service.date,
                        program_id: service.programID
                    })
                } catch (e) {
                    console.error(`${e}`)
                    toastWarning("Unable to load data!")
                }
                return true
            },
            validation: (val: Option[]) => Validation.validateSeries([
                () => Validation.required(val),
                () => val.some((i: Option) => i.value === '') ? ['Some values are missing'] : null
            ]),
            computedValue: (v: Option[]) => {
                const obs = v.map((v: Option) => {
                    const data = v.other
                    return [
                        {
                            concept_id: ConceptService.getCachedConceptID("Drug adherence"),
                            value_drug: data.drug.drug_id,
                            order_id: data.order_id,
                            value_modifier: '%',
                            person_id: patientID,
                            value_numeric: calculateAdherence(
                                data.quantity,
                                parseInt(`${v.value}`), 
                                calculateExpected(data)
                            )
                        }, 
                        {
                            concept_id: ConceptService.getCachedConceptID("Number of tablets brought to clinic"),
                            order_id: data.order_id,
                            value_numeric: v.value,
                            person_id: patientID
                        }
                    ]
                })
                return obs.flat(1)
            },
            options: (fdata: any) => {
                if (!isEmpty(fdata.pills_brought)) return fdata.pills_brought
                return orders.map((data: any) => ({
                    label: data.drug.name,
                    value: '',
                    other: data
                }))
            }
        }
    }

    const adherenceReportField = () => {
        return {
            id: "adherence_report",
            helpText: "TB adherence",
            type: FieldType.TT_TABLE_VIEWER,
            condition: (f: any) => f.pills_brought.length,
            options: (f: any) => {
                const d = f.pills_brought as Option[]
                const lastVisit = d[0].other.order.start_date
                const daysElapsed = calcTimeElapsed(lastVisit, 'day')
                const timeElapse = ` Last visit: ${HisDate.toStandardHisDisplayFormat(lastVisit)} 
                    (${daysElapsed} Days Elapsed)`
                const rowColors = [{ indexes: [0, 3, 6], class: 'adherence-col-bg' }]
                const cellColors: any = []
                const columns = [timeElapse]
                const rows = [
                    ['Prescription'],
                    ['Tabs given'],
                    ['Tabs per day'],
                    ['Tabs remaining'],
                    ['Expected'],
                    ['Actual (counted)'],
                    ['Adherence'],
                    ['Doses missed/ Unaccounted for'],
                    ['Doses consumed'],
                    ['TB Adherence']
                ]        
                d.forEach((v: Option, index: number) => {
                    const expectedPills = calculateExpected(v.other)
                    const adherence = calculateAdherence(v.other.quantity, parseInt(`${v.value}`), expectedPills)
                    const adherenceStatus = adherence >= 95 && adherence <= 105
                        ? 'Good adherence'
                        : 'Explore problem'
                    const unAccountedDoses = calculateUnaccountedOrMissed(`${expectedPills}`, `${v.value}`)
                    columns.push(v.other.drug.name)
                    rows[0].push('')
                    rows[1].push(v.other.quantity)
                    rows[2].push(`${v.other.equivalent_daily_dose}`)
                    rows[3].push('')
                    rows[4].push(expectedPills < 0 ? '0' : `${expectedPills}`)
                    rows[5].push(`${v.value}`)
                    rows[6].push('')
                    rows[7].push(unAccountedDoses)
                    rows[8].push(`${adherence}%`)
                    rows[9].push(adherenceStatus)

                    cellColors.push({ 
                        index: index+1,
                        row: 9, 
                        class: adherenceStatus.match(/good/i) ? 'adherence-txt-good' : 'adherence-txt-bad' 
                    })
                })
                return [
                    { 
                        label: 'Selected Medication', 
                        value:'Table', 
                        other: { columns, rows, rowColors, cellColors }
                    }      
                ]        
            },
            config: {
                hiddenFooterBtns: ['Clear']
            }
        }
    }

    fields.value = [
        pillsBroughtField(),
        adherenceReportField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    goToNextTask();
}
</script>
  