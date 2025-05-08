<template>
  <view-port>
    <div class='view-port-content'>
      <ion-grid>
        <ion-row>
          <ion-col size="8">
            <Calendar
              color="blue"
              ref="calendar"
              is-expanded
              class="custom-calendar"
              :min-date="sessionDate"
              :max-date="runOutDate"
              :attributes="attributes"
              :masks="masks"
              disable-page-swipe
            >
              <template v-slot:day-content="{ day }">
                <div
                  @click="dayClicked(day)"
                  v-bind:class="{
                    selected: day.id === cDate,
                    isDisabled: day.isDisabled,
                  }"
                >
                  <span>{{ day.day }}</span>
                  <sup v-if="day.id === cDate" class="appointments">{{
                    appointments.length
                  }}</sup>
                </div>
              </template>
            </Calendar>
          </ion-col>
          <ion-col size="4" class="his-card">
            <ion-list>
              <ion-item class="his-sm-text" v-if="showMedicationRunoutDate && rDate">
                <ion-label class="ion-text-wrap">
                  <b>Medication Run out Date</b>
                  <p/>
                  <span>{{ rDate }}</span>
                </ion-label>
              </ion-item>
              <ion-item class="his-sm-text">
                <ion-label class="ion-text-wrap">
                  <b>User set appointment date</b>
                  <p/>
                  <span>{{ aDate }}</span>
                </ion-label>
              </ion-item>
              <ion-item class="his-sm-text">
                <ion-label class="ion-text-wrap">
                  <b>Appointment(s)</b> 
                  <p/>
                  <span>{{ appointments.length }}</span>
                </ion-label>
              </ion-item>
              <ion-item class="his-sm-text">
                <ion-label class="ion-text-wrap"> 
                  <b>Appointment limit (per/day)</b>
                  <p/>
                  <span>{{ appointmentLimit }}</span>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "@/components/DataViews/ViewPort.vue";
import { IonGrid, IonCol, IonRow } from "@ionic/vue";
import { Calendar } from "v-calendar";
import HisDate from "@/utils/Date";
import { AppointmentService } from "@/apps/ART/services/appointment_service";
import FieldMixinVue from "./FieldMixin.vue";
import ART_GLOBAL_PROP from "@/apps/ART/art_global_props"
import { alertConfirmation } from "@/utils/Alerts";
import dayjs from "dayjs";

export default defineComponent({
  components: { ViewPort, Calendar, IonGrid, IonCol, IonRow },
  mixins: [FieldMixinVue],
  watch: {
    startDate: {
      async handler(params: any) {
        const date = params ? params : HisDate.toStandardHisDisplayFormat(this.sessionDate)
        this.$emit("onValue", { label: "", value: date });
      },
      immediate: true,
    },
  },
  data: () => ({
    rows: [],
    startDate: null as any,
    runOutDate: null as any,
    appointments: [],
    clinicHolidays: [] as Array<string>,
    clinicDays: [] as Array<string>,
    patientAge: 0,
    appointmentLimit: 0 as any,
    sessionDate: null as any,
    masks: {
      weekdays: 'WWW',
    }
  }),
  mounted() {
    this.$emit('onFieldActivated', this)
  },
  activated(){
    this.$emit('onFieldActivated', this)
  },
  async created() {
    this.patientAge = this.config.patientAge || 0;
    await this.getAppointmentLimit()
    await this.getClinicHolidays()
    await this.getClinicDays()
    const items = await this.options(this.fdata);
    this.sessionDate = AppointmentService.getSessionDate();
    const date = items[0].other.appointmentDate;
    this.appointments = await this.getAppointments(date)
    this.setDate(date)
    this.runOutDate = items[0].other.runOutDate ? new Date(items[0].other.runOutDate) : null
  },
  methods: {
    getAppointments(date: string) {
      return AppointmentService.getDailiyAppointments(
        HisDate.toStandardHisFormat(date)
      );
    },
    async getAppointmentLimit() {
      const limit = await ART_GLOBAL_PROP.appointmentLimit();
      if (limit) {
        this.appointmentLimit = limit;
      }
    },
    async getClinicHolidays() {
      const holidays: string = await ART_GLOBAL_PROP.clinicHolidays()
      if(holidays) {
        this.clinicHolidays = holidays.split(',')
      }
    },
    async getClinicDays() {
      let days = ''
      if (this.patientAge >= 18) {
        days = await ART_GLOBAL_PROP.adultClinicDays()
      } else {
        days = await ART_GLOBAL_PROP.peadsClinicDays()
      }
      if(days) this.clinicDays = days.split(',')
    },
    async isDateAvalaible(date: string) {
      const appointments = await this.getAppointments(date)
      if(appointments.length !== 0 && appointments.length >= this.appointmentLimit) {
        const confirm = await alertConfirmation(
          `Appointment limit reached for the selected date ${HisDate.toStandardHisDisplayFormat(date)}`, 
          {
            header: "APPOINTMENT LIMIT REACHED",
            cancelBtnLabel: "Proceed with Selected Date",
            confirmBtnLabel: "Select Another Date"
          }
        )
        if (confirm) return false
      }

      if(this.clinicHolidays.includes(HisDate.toStandardHisFormat(date))){
        const proceed = await alertConfirmation("Selected date is a clinic holiday, do you want to set an appointment?")
        if (!proceed) return false
      }
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const weekDay = weekDays[dayjs(date).day()]
      if(!this.clinicDays.includes(weekDay)){
        const proceed = await alertConfirmation(
          `The selected date ${HisDate.toStandardHisDisplayFormat(date)} is not a clinic day. Do you want to proceed with this date?`
        )
        if (!proceed) return false
      }
      this.appointments = appointments
      return true
    },
    async setDate(date: any) {
      this.startDate = new Date(date);
      const calendar: any = this.$refs.calendar;
      await calendar.move(this.startDate);
      await calendar.focusDate(this.startDate);
    },
    async dayClicked(day: any) {
      !day.isDisabled && (await this.isDateAvalaible(day.id)) && this.setDate(day.id);
    },
  },
  computed: {
    showMedicationRunoutDate(): boolean {
      return typeof this.config?.hideRunoutDate === 'boolean' ? !this.config?.hideRunoutDate : true;
    },
    aDate(): string {
      return HisDate.toStandardHisDisplayFormat(this.startDate);
    },
    rDate(): string {
      return HisDate.toStandardHisDisplayFormat(this.runOutDate);
    },
    cDate(): string {
      return HisDate.toStandardHisFormat(this.startDate);
    },
    attributes() {
      return [
        {
          highlight: true,
          dates: this.aDate
        }
      ]
    },
  },
});
</script>
<style>
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-track {
  display: none;
}

.custom-calendar.vc-container {
  --day-border: 1px solid #b8c2cc;
  --day-border-highlight: 1px solid #b8c2cc;
  --day-width: 80px;
  --day-height: 82px;
  --weekday-bg: #f8fafc;
  --weekday-border: 1px solid #eaeaea;
  border-radius: 0 !important;
  width: 100%;
}
.custom-calendar.vc-container .vc-day-content {
  padding: 50px;
  background: none;
}
.custom-calendar.vc-container .vc-header {
  background-color: #f1f5f8;
  padding: 10px 0;
}
.custom-calendar.vc-container .vc-weeks {
  padding: 0;
}
.custom-calendar.vc-container .vc-weekday {
  background-color: var(--weekday-bg);
  border-bottom: var(--weekday-border);
  border-top: var(--weekday-border);
  padding: 5px;
}
.custom-calendar.vc-container .vc-day {
    padding: 30px 5px 3px 5px;
    text-align: center;
    height: var(--day-height);
    min-width: var(--day-width);
    background-color: white;
  }
.custom-calendar.vc-container .vc-day.weekday-1,
    .custom-calendar.vc-container .vc-day.weekday-7 {
      background-color: #eff8ff;
    }
.custom-calendar.vc-container .vc-day:not(.on-bottom) {
      border-bottom: var(--day-border);
    }
.custom-calendar.vc-container .vc-day:not(.on-bottom).weekday-1 {
        border-bottom: var(--day-border-highlight);
      }
.custom-calendar.vc-container .vc-day:not(.on-right) {
      border-right: var(--day-border);
    }
.custom-calendar.vc-container .vc-day-dots {
    margin-bottom: 5px;
  }
.custom-calendar.vc-container .vc-highlight,
.custom-calendar.vc-container .vc-highlights .vc-day-layer {
  border-radius: 0 !important;
  padding: 0 !important;
  background: #3182ce !important;
  color: #ffffff;
}
.selected{
  font-size: 3vh;
  height: 100%;
  margin-top: 0 !important;
  color: white;
  text-align: center;
}
.appointments {
  position: absolute;
  top: 15px;
  right: 5px;
  color: greenyellow;
}
</style>