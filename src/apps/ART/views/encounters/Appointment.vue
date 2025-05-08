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
import App from "@/apps/app_lib"
import { isEmpty } from "lodash";
import HisDate from "@/utils/Date"
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"
import dayjs from "dayjs";
import { delayPromise } from "@/utils/Timers";
import { printArtVisitLbl } from "../../Labels";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    appointment: {} as any
  }),
  watch: {
    ready: {
      handler(ready: boolean) {


        //print out App type
        console.log("The Current App calling this encounter  ",App.getActiveApp()?.applicationName)

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
      // TODO: remove the program checks here
      const appsThatDoNotPrint = ['CxCa', 'ANC']

      if(!appsThatDoNotPrint.includes(`${App.getActiveApp()?.applicationName}`)) {
        await printArtVisitLbl(this.patientID);
      }
      this.nextTask()
    },
    getAppointmentField(): Field {
      const d = (date: string) => HisDate.toStandardHisDisplayFormat(date)
      const exists = (strOne: string, strTwo: string) => new RegExp(strOne, 'i').test(`${strTwo}`)
      let clinicDays = ''
      let clinicHolidays = ''
      let appointmentLimit = -1
      let nextAppointment = this.appointment.date
      let drugRunoutDate: string | null = null
      const dateAppointments: Record<string, number> = {}
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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
          const limitRes = (await ART_GLOBAL_PROP.appointmentLimit());
          appointmentLimit = limitRes ? parseInt(limitRes) : 0
          return true
        },
        onValue: async (date: string) => {
          console.log(this.appointment)
          if (dateAppointments[date] === undefined) {
            const res = await AppointmentService.getDailiyAppointments(date)
            dateAppointments[date] = Array.isArray(res) ? res.length : 0
          }
          if (appointmentLimit >= 1 && dateAppointments[date] >= appointmentLimit) {
            if((await alertConfirmation(
              `${dateAppointments[date]} clients were booked on ${d(date)}`, 
              {
                header: `APPOINTMENT LIMIT (${appointmentLimit}) REACHED`,
                cancelBtnLabel: "Proceed",
                confirmBtnLabel: "New date"
              }
            ))) return false;
          }
          // Check clinic holidays
          if (isEmpty(clinicHolidays)) {
            clinicHolidays = await ART_GLOBAL_PROP.clinicHolidays()
          }
          if(exists(date, clinicHolidays)) {
            if (!(await alertConfirmation(`${d(date)} is a clinic holiday, do you want to set an appointment?`))) 
              return false;
          }
          //Check clinic days
          if (isEmpty(clinicDays)) {
            clinicDays = this.patient.getAge() >= 18
              ? (await ART_GLOBAL_PROP.adultClinicDays())
              : (await ART_GLOBAL_PROP.peadsClinicDays())
          }
          if(!exists(weekDays[dayjs(date).day()], clinicDays)){
            if(!(await alertConfirmation(`${d(date)} is not a clinic day. Do you want to proceed with this date?`))) 
              return false;
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

            if(App.getActiveApp()?.applicationName === 'CxCa'){
              return [
                {
                  label: 'User set appointment date',
                  value: d(date)
                },
                {
                  label: 'Appointments',
                  value: dateAppointments[date]
                },
                {
                  label: 'Appointment limit (per/day)',
                  value: appointmentLimit
                }
              ]
            }else{
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
                },
                {
                  label: 'Appointment limit (per/day)',
                  value: appointmentLimit
                }
              ]
            }
          }
        }
      }
    }
  }
});
</script>
