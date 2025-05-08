<template>
    <his-standard-form :fields="fields" :onFinishAction="onFinish" :skipSummary="true"
        :cancelDestinationPath="patientDashboardUrl">
    </his-standard-form>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { FieldType } from '../../../../components/Forms/BaseFormElements';
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option, Field } from "@/components/Forms/FieldInterface";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { AppEncounterService } from '../../../../services/app_encounter_service';
import { resolveObs } from "../../../../utils/HisFormHelpers/commons";
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { AdherenceService } from "@/apps/ART/services/adherence_service"
import dayjs from "dayjs";
import { toDate } from "../../../../utils/Strs";
import { alertConfirmation } from "../../../../utils/Alerts";

const service = new AppEncounterService(-1, 25)
const fields = ref<Field[]>([])

const { patientDashboardUrl, goToPatientDashboard } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider
    const adherenceService = new AdherenceService(service.patientID, service.providerID)
    
    function formatFrequency(frequency: string) {
        return `${frequency}`.match(/qod/i) 
                ? 'QOD'
                : `${frequency}`.match(/weekly/i) 
                ? 'QW'
                : frequency
    }

    function calcPillsExpected(d: any) {
        return adherenceService.calculateExpected(
            d.quantity, 
            d.equivalent_daily_dose, 
            d.order.start_date,
            formatFrequency(d.frequency) as 'QOD' | 'QW'
        )
    }

    function dateOfEmergencyRefill() {
        return {
            id: "date_of_emergency_refill",
            helpText: "Date of emergency refill",
            type: FieldType.TT_FULL_DATE,
            init: async () => {
                await adherenceService.loadPreviousDrugs()
                return true
            },
            beforeNext: async (val: Option) => {
                const lastDrugDate = adherenceService.getLastDrugs()?.[0]?.order?.start_date
                if (lastDrugDate && dayjs(val.value).isBefore(lastDrugDate)) {
                    return alertConfirmation(`Date entered is less than last known dispensation of ${toDate(lastDrugDate)}`)
                }
                return true
            },
            validation: (val: Option) => Validation.validateSeries([
                () => Validation.required(val),
                () => {
                    if (dayjs(val.value).isAfter(service.date)) {
                        return [`Date entered is after current date of ${toDate(service.date)}`]
                    }
                }
            ]),
            computedValue: (date: Option) => service.buildValueDate('Prescription refill date', date.value)
        }
    }

    function facilityCollectedFrom(): Field {
        return {
            id: "facility",
            type: FieldType.TT_SELECT,
            helpText: "Facility where emergency refill was collected",
            validation: (val: Option) => Validation.required(val),
            options: (_: any, filter = '') => getFacilities(filter),
            computedValue: (v: Option) => service.buildValueText('Health facility name', v.label),
            config: {
                showKeyboard: true,
                isFilterDataViaApi: true
            }
        }
    }

    function drugDetails(): Field {
        return {
            id: "drug",
            helpText: "Emmergency Supply Drugs",
            type: FieldType.TT_DRUG_RETROSPECTIVE_INPUT,
            init: async () => {
                await adherenceService.loadPreviousDrugs()
                return true
            },
            options: (f: any) => {
                if (f.drug.length) return f.drug
                return adherenceService.getLastDrugs().map((data: any) => ({
                    label: data.drug.name,
                    value: data.drug.concept_id,
                    other: { 
                        givenAmount: '',
                        remainingAmount: '',
                        drug: data
                    }
                }))
            },
            computedValue: (data: Option[], f: any) => {
                return data.map(async (option) => {
                    const adherence = adherenceService.calculateAdherence(
                        option.other.drug.quantity, 
                        option.other.remainingAmount, 
                        calcPillsExpected(option.other.drug)
                    )
                    return {
                        ...(await adherenceService.buildValueCoded(
                            'Medications dispensed', option.value
                        )),
                        child: [
                            await adherenceService.buildPillCountObs(
                                option.other.drug.order_id, 
                                option.other.remainingAmount
                            ),
                            await adherenceService.buildAdherenceObs(
                                option.other.drug.order_id, 
                                option.other.drug.drug_id,
                                adherence,
                                f.date_of_emergency_refill.value
                            ),
                            await adherenceService.buildValueNumber(
                                'Amount of drug dispensed', 
                                option.other.givenAmount
                            )
                        ]
                    }
                })
            },
            validation: (val: Option[]) => {
                if (val.every((option) => option.other.givenAmount === "" || 
                    option.other.remainingAmount === "")) {
                    return ['Please enter drug details for all drugs']
                }
            }
        }
    }

    function nextAppointment(): Field {
        return {
            id: "next_appointment",
            helpText: "Appointment date",
            type: FieldType.TT_DATE_PICKER,
            computedValue: (date: string) => service.buildValueDate('Appointment date', date),
            validation: (val: Option) => Validation.required(val)
        }
    }

    fields.value = [
        dateOfEmergencyRefill(),
        facilityCollectedFrom(),
        drugDetails(),
        nextAppointment()
    ]
})

async function onFinish(_: any, c: any) {
    await service.createEncounter()
    await service.saveObservationList((await resolveObs(c)))
    goToPatientDashboard()

}
</script>