<template>
    <his-standard-form
      :fields="fields"
      :onFinishAction="onFinish"
      :skipSummary="true"
      :cancelDestinationPath="cancelDestination"
    >
    </his-standard-form>
</template> 
<script lang="ts">
  import { defineComponent } from "vue";
  import { Field } from "@/components/Forms/FieldInterface"
  import { FieldType } from "@/components/Forms/BaseFormElements";
  import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
  import Validation from "@/components/Forms/validations/StandardValidations";
  import { alertConfirmation } from "@/utils/Alerts"
  import EncounterMixinVue from '../../../../views/EncounterMixin.vue';
  import {AppointmentService} from '@/apps/ART/services/appointment_service'
  import HisDate from "@/utils/Date"
  import { delayPromise } from "@/utils/Timers";
  
  export default defineComponent({
    mixins: [EncounterMixinVue],
    components: { HisStandardForm },
    data: () => ({
      appointment: {} as any
    }),
    watch: {
      ready: {
        handler(ready: boolean) {
          if (ready) {
            this.appointment = new AppointmentService(this.patientID, this.providerID)
            this.fields = [
              this.getAppointmentField()
            ]
          }
        },
        immediate: true
      }
    },
    methods: {
      async onFinish(_: any, computedData: any) {
        await this.appointment.createEncounter()
        await this.appointment.saveObservationList(
          (await this.resolveObs(computedData))
        )
        this.nextTask()
      },
      getAppointmentField(): Field {
        const d = (date: string) => HisDate.toStandardHisDisplayFormat(date)
        let nextAppointment = this.appointment.date
        let drugRunoutDate: string | null = null
        const dateAppointments: Record<string, number> = {}
        return {
          id: "set_appointment",
          helpText: "Appointments booking",
          type: FieldType.TT_DATE_PICKER,
          init: async () => {
            try {
              const res = await this.appointment.getNextAppointment()
              nextAppointment = res.appointment_date
              drugRunoutDate = res.drugs_run_out_date
            } catch(e) {
              console.warn(e)
              await delayPromise(400)
              if (!(await alertConfirmation('Next appointment/drug-runout date is not available, do you want to proceed anyway?'))) {
                this.gotoPatientDashboard()
                return true
              }
            }
            return true
          },
          onValue: async (date: string) => {
            if (dateAppointments[date] === undefined) {
              const res = await AppointmentService.getDailiyAppointments(date)
              dateAppointments[date] = Array.isArray(res) ? res.length : 0
            }
            return true
          },
          validation: (val: any) => Validation.required(val),
          defaultValue: () => nextAppointment,
          computedValue: (date: string) => {
            return [
              this.appointment.buildValueDate('Appointment date', date),
              this.appointment.buildValueDate('Estimated date', nextAppointment)
            ]
          },
          config: {
            hiddenFooterBtns: [
              'Clear'
            ],
            minDate: () => this.appointment.date,
            maxDate: () => drugRunoutDate,
            supValue: (date: string) => `${dateAppointments[date]}`,
            infoItems: (date: string) => {
                return [
                  { 
                    label: 'Medication Run out Date',
                    value: drugRunoutDate ? d(drugRunoutDate) : 'Not available'
                  },
                  {
                    label: 'User set appointment date',
                    value: d(date)
                  },
                  {
                    label: 'Appointments',
                    value: dateAppointments[date]
                  }
                ]
            }
          }
        }
      }
    }
  });
</script>
