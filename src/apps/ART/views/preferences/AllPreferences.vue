<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title> 
          <span v-html="title"></span> 
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="report-content">
        <report-table
          :rows="rows"
          :columns="columns">
        </report-table>
      </div>
    </ion-content>
    <his-footer :btns="btns" color="dark"></his-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import { 
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  loadingController, 
} from "@ionic/vue"
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
import ART_PROP from "../../art_global_props";
import HisDate from "@/utils/Date";

const maxWidth = {
  style: {
    wordWrap: 'break-word',
    maxWidth: '130px',
  }
}

export default defineComponent({
  components: {  
    IonHeader,
    ReportTable, 
    HisFooter, 
    IonPage, 
    IonContent, 
    IonToolbar,
  },
  data: () => ({
    title: "Systems settings",
    btns: [] as Array<NavBtnInterface>,
    rows: [] as Array<RowInterface[]>,
    columns: [
      [
        table.thTxt('Property'),
        table.thTxt('Value', maxWidth),
      ]
    ] as Array<ColumnInterface[]>
  }),
  async created() {
    const loader = await loadingController.create({})
    loader.present()
    this.btns.push({
      name: "finish",
      color: 'success',
      slot: 'end',
      visible: true,
      size: 'large',
      onClick: () => this.$router.push('/')
    })
    this.rows = await this.buildRows()
    loader.dismiss()
  },
  methods: {
    async getClinicHolidays() {
      const holidays: string = await ART_PROP.clinicHolidays()
      return holidays && holidays.split(',')
                                 .map(day => HisDate.toStandardHisDisplayFormat(day))
                                 .join(', ')
    },
    async buildRows() {
      const fillingNumberLimit = await ART_PROP.filingNumberLimit()
      const fillingNumberPrefix = await ART_PROP.filingNumberPrefix()
      const htnAgeLimit = await ART_PROP.htnAgeThreshold()
      const adultClinicDays = await ART_PROP.adultClinicDays()
      const paedsClinicDays = await ART_PROP.peadsClinicDays()
      const clinicHolidays = await this.getClinicHolidays()
      const htnSystolic = await ART_PROP.systolicThreshold()
      const htnDiastolic = await ART_PROP.diastolicThreshold()
      
      return [
        [
          table.td('Cervical cancer screening activated'),
          table.td((await ART_PROP.cervicalCancerScreeningEnabled()) ? "Yes" : "No")
        ],
        [
          table.td('Drug management activated'),
          table.td((await ART_PROP.drugManagementEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('Viral load activated'),
          table.td((await ART_PROP.VLEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('Extended Lab activated'),
          table.td((await ART_PROP.extendedLabEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('3HP auto select activated'),
          table.td((await ART_PROP.threeHPAutoSelectEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('Ask pills at home'),
          table.td((await ART_PROP.askPillsRemaining()) ? "Yes" : "No" )
        ],
        [
          table.td('Appointment limit'),
          table.td((await ART_PROP.appointmentLimit()))
        ],
        [
          table.td('Adult clinic days'),
          table.td(adultClinicDays ? adultClinicDays : "Not set")
        ],
        [
          table.td('Paeds clinic days'),
          table.td(paedsClinicDays ? paedsClinicDays : "Not set")
        ],
        [
          table.td('Clinic holidays'),
          table.td(clinicHolidays ? clinicHolidays : "Not set", maxWidth)
        ],
        [
          table.td('HTN screening activated'),
          table.td((await ART_PROP.htnEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('HTN screening age'),
          table.td(htnAgeLimit ? htnAgeLimit : "Not set")
        ],
        [
          table.td('Systolic blood pressure'),
          table.td(htnSystolic ? htnSystolic : "Not Set")
        ],
        [
          table.td('Diastolic blood pressure'),
          table.td(htnDiastolic ? htnDiastolic : "Not Set")
        ],
        [
          table.td('Filling number limit'),
          table.td(fillingNumberLimit ? fillingNumberLimit : "Not set")
        ],
        [
          table.td('Use filling number'),
          table.td((await ART_PROP.filingNumbersEnabled()) ? "Yes" : "No" )
        ],
        [
          table.td('Filling number prefix'),
          table.td(fillingNumberPrefix ? fillingNumberPrefix : "Not set")
        ],
        [
          table.td('Fast track activated'),
          table.td((await ART_PROP.fastTrackEnabled()) ? "Yes" : "No" )
        ],
      ]
    },
  }
})
</script>
<style scoped>
.report-content {
  margin: auto;
  width: 99.9%;
  height: 99%;
  overflow: auto;
}
a {
  text-decoration: none;
  font-weight: 600;
  font-size: 1em;
}
</style>
