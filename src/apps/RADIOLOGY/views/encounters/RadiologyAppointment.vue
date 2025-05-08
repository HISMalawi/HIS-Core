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
import { Field, Option } from "@/components/Forms/FieldInterface"
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import EncounterMixinVue from '../../../../views/EncounterMixin.vue';
import {AppointmentService} from '@/apps/ART/services/appointment_service'
import dayjs from "dayjs";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    appointmentDate: "" as any,
    maxAppointmentDate: "" as any,
    appointment: {} as any    
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.appointment = new AppointmentService(this.patientID, this.providerID)
          this.init()
        }
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      await this.appointment.createEncounter()
      await this.appointment.saveObservationList(
        (await this.resolveObs(computedData, 'obs'))
      )
      this.gotoPatientDashboard()
    },
    init() {
        this.appointmentDate = AppointmentService.getSessionDate();
        this.maxAppointmentDate = dayjs(this.appointmentDate)
            .add(100, 'year')
            .format('YYYY-MM-DD')
        this.fields = this.getFields()
     
    },
    getFields(): Array<Field> {
      return [
        {
          id: "set_appointment",
          helpText: "Appointments booking",
          type: FieldType.TT_APPOINTMENTS_ENTRY,
          validation: (val: any) => Validation.required(val),
          computedValue: (d: Option) => {
            return {
              tag: 'obs',
              obs: [
                this.appointment.buildValueDate('Appointment date', d.value),
                ]
            }
          },
          config: {
            patientAge: this.patient.getAge(),
            hideRunoutDate: true,
            hiddenFooterBtns: [
              'Clear'
            ]
          },
          options: () =>  {return [{
            label: "",
            value: "",
            other: {
             runOutDate : this.maxAppointmentDate,
             appointmentDate: this.appointmentDate
            }
          }]}
        }
      ]
    }
  }
});
</script>