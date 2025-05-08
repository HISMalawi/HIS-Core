
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
import { EncounterType, TbGlobals, TbState } from "@/apps/TB/meta/constants"
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { getConceptID } from "../../services/util"
import { resolveObs } from '@/utils/HisFormHelpers/commons';
import Validation from '@/components/Forms/validations/StandardValidations';
import { AppointmentService } from '@/apps/ART/services/appointment_service';
import { GlobalPropertyService } from '@/services/global_property_service';
import { toDate } from '@/utils/Strs';
import { printTbVisitSummaryLbl } from '../../labels';
import TbService  from "@/apps/TB/services/tb_service"
import { PatientProgramService } from '@/services/patient_program_service';
import { toastWarning } from '@/utils/Alerts';

const fields = ref<Field[]>([]);
const service = new AppEncounterService(-1, EncounterType.APPOINTMENT);
let patientId = 0;
 
const { goToNextTask, patientDashboardUrl } = useEncounter((provider, patientID) => {
    service.patientID = patientID
    service.providerID = provider
    patientId = patientID

    const appointmentField = () => {
        let nextAppointment: any = {}
        let appointmentLimit = -1
        const bookedAppointments: any = {}
        return {
            id: 'appointment',
            helpText: 'Appointment booking',
            type: FieldType.TT_DATE_PICKER,
            init: async () => {
                appointmentLimit = await GlobalPropertyService.get(
                    TbGlobals.CLINIC_APPOINTMENT_LIMIT)
                nextAppointment = await AppointmentService.getJson(
                    `programs/${service.programID}/patients/${patientID}/next_appointment_date`, {
                        date: service.date
                    }
                )
                return true
            },
            defaultValue: () => nextAppointment?.appointment_date,
            validation: (v: Option) => Validation.required(v),
            computedValue: (date: string) => ([
                {
                    concept_id: getConceptID('APPOINTMENT_DATE'),
                    value_datetime: date,
                    obs_datetime: service.date   
                },
                {
                    concept_id: getConceptID('ESTIMATED_DATE'),
                    value_datetime: nextAppointment?.appointment_date,
                    obs_datetime: service.date
                }
            ]),
            config: {
                minDate: () => service.date,
                maxDate: () => nextAppointment?.drugs_run_out_date,
                supValue: (date: string) => `${(bookedAppointments[date]||[]).length}`,
                infoItems: async (date: string) => {
                    if (!bookedAppointments[date]) {
                        bookedAppointments[date] = await AppointmentService.getJson(
                            `programs/${service.programID}/booked_appointments`, {
                            date, paginate: false
                        })
                    }
                    return [
                        { 
                            label: 'Medication Run out Date',
                            value: toDate(nextAppointment?.drugs_run_out_date||'Not available')
                        },
                        {
                            label: 'User set appointment date',
                            value: toDate(date)
                        },
                        {
                            label: 'Appointments',
                            value: (bookedAppointments[date]||[]).length
                        },
                        {
                            label: 'Appointment limit (per/day)',
                            value: appointmentLimit||'N/A'
                        }
                    ]
                },
                hiddenFooterBtns: [
                    'Clear'
                ]
            }
        }
    }

    fields.value = [
        appointmentField()
    ]
});

async function onFinish(f: any, cdata: any) {
    await service.createEncounter();
    await service.saveObservationList((await resolveObs(cdata)));
    if ((await TbService.shouldTransferToExternalFacility(service.patientID))) {
        const program = new PatientProgramService(service.patientID)
        program.setStateDate(service.date)
        program.setStateId(TbState.TRANSFER_OUT)
        try {
            await program.updateState()
        } catch (e) {
            toastWarning("Failed to transfer out patient, please do it manually for now.")
            console.error(e)
        }
    }
    await printTbVisitSummaryLbl(service.patientID);
    goToNextTask();
}
</script>
  