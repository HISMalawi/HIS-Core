<template>
  <view-port>
    <div class="view-port-content-calendar">
      <ion-grid>
        <ion-row>
          <ion-col size-md="8" size-sm="12">
            <DatePicker 
              is-expanded
              color="blue"
              ref="calendar"
              modelValue=""
              :min-date="minDate"
              :max-date="maxDate"
              :attributes="[
                {
                  highlight: true,
                  dates: [date]
                }
              ]"
              disable-page-swipe
              class="custom-calendar"
            >
              <template v-slot:day-content="{ day }">
                <div
                  v-bind:class="{
                    'selected': day.id === date,
                    'date-disabled': day.isDisabled
                  }"
                  class="his-lg-text"
                  @click="!day.isDisabled && select(day.id)"
                >
                  <span><b>{{ day.day }}</b></span>
                  <sup v-if="dateSupValues[day.id]" 
                    :style="`color: ${day.id === date ? 'white' : '#5eff7f'}`"
                    class="sup-value his-md-text">
                    <b>{{ dateSupValues[day.id] }}</b>
                  </sup>
                </div>
              </template>
            </DatePicker>
          </ion-col>
          <ion-col size-md="4" size-sm="12" class="his-card-calendar">
            <ion-list>
              <ion-item class="his-sm-text" v-for="(item, index) in (dateInfoItems[date] || [])" :key="index"> 
                <ion-label class="ion-text-wrap">
                  <b>{{item.label}}</b>
                  <p/>
                  <span>{{item.value}}</span>
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
import { IonGrid, IonCol, IonRow, IonList, IonItem, IonLabel } from "@ionic/vue";
import { DatePicker } from "v-calendar";
import HisDate from "@/utils/Date"
import FieldMixinVue from "./FieldMixin.vue";
import { Option } from "@/components/Forms/FieldInterface"

export default defineComponent({
  components: { 
    DatePicker, 
    ViewPort, 
    IonGrid, 
    IonCol, 
    IonRow,
    IonLabel,
    IonList, 
    IonItem 
  },
  mixins: [FieldMixinVue],
  data: () => ({
    date: '',
    prevDate: '',
    minDate: undefined as string | undefined,
    maxDate: undefined as string | undefined,
    dateInfoItems: {} as Record<string, Option[]>,
    dateSupValues: {} as Record<string, number | string>
  }),
  async created() {
    if (!this.date && typeof this.defaultValue === 'function') {
      this.select((await this.defaultValue()))
    }
    if (typeof this.config.minDate === 'function') {
      this.minDate = this.config.minDate(this.fdata)
    }
    if (typeof this.config.maxDate === 'function') {
      this.maxDate = this.config.maxDate(this.fdata)
    }
  },
  methods: {
    focusDate(date: string) {
      const calendar: any = this.$refs.calendar
      calendar.move(date)
    },
    async select(date: string) {
      this.prevDate = this.date
      this.date = HisDate.toStandardHisFormat(date)
      if (typeof this.onValue === 'function') {
        if (!(await this.onValue(this.date, this))) {
          if (this.prevDate)  {
            this.date = this.prevDate
            this.focusDate(this.date)
          } else {
            this.date = ''
            this.$emit('onValue', null)
          }
          return
        } 
      }
      this.$emit('onValue', this.date)
      this.focusDate(this.date)
      if (typeof this.config.infoItems === 'function') {
        if (!this.dateInfoItems[this.date]) {
          this.dateInfoItems[this.date] = await this.config.infoItems(this.date, this.fdata) || []
        }
      }
      if (typeof this.config.supValue === 'function') {
        if (!this.dateSupValues[this.date]) {
          this.dateSupValues[this.date] = await this.config.supValue(this.date, this.fdata)
        }
      }
    }
  },
  mounted() {
    this.$emit('onFieldActivated', this)
  },
  activated(){
    this.$emit('onFieldActivated', this)
  }
})
</script>
<style>
.view-port-content-calendar {
  overflow-x: auto;
  background: #fff;
  height: 100%;
}
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-track {
  display: none;
}
.his-card-calendar {
  border: 1px solid #cccbcb;
    background: var(--his-card-primary-color);
    padding: var(--his-card-primary-padding);
    border-radius: var(--his-card-primary-border-radius);
    -webkit-box-shadow: var(--his-card-primary-shadow-webkit);
    -moz-box-shadow: var(--his-card-primary-shadow-moz);
    box-shadow: var(--his-card-primary-shadow);
  height: 74vh !important;
  overflow-y: auto;
}
.custom-calendar.vc-container {
  --day-border: 1px solid #414142;
  --day-border-highlight: 1px solid #93979b;
  --day-width: 8vw;
  --day-height: 11vh;
  --weekday-bg: #f8fafc;
  --weekday-border: 1px solid #eaeaea;
  border-radius: 0 !important;
  width: 100%;
}
.custom-calendar.vc-container .vc-header {
  background-color: #f1f5f8;
  padding: 0.4rem;
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
    padding: 2em 0.8em 0.8em 0.8em;
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
.selected{
  font-size: 3vh;
  height: 100%;
  margin-top: 0 !important;
  color: white;
  text-align: center;
}
.sup-value {
  position: absolute;
  top: 15px;
  right: 5px;
  color: white;
}
.date-disabled {
  color: #ccc;
}
.vc-nav-popover-container {
  width: 300px !important;
  font-size: 20px !important;
  text-align: center;
}
.vc-nav-title {
  padding: 14px 8px !important;
}
.vc-nav-arrow {
  border-width: 15px !important;
}
.vc-nav-item {
  width: inherit !important;
  padding: 14px 0px !important;
  border: 2px solid rgba(255, 255, 255, 0.1) !important;
}
.vc-nav-item:hover {
  border: 2px solid rgba(255, 255, 255, 1) !important;
  transition: all 0.5s ease-in-out;
}
</style>

