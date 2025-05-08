<template>
  <ion-grid>
    <ion-row>
      <ion-col size-lg="6" size-sm="12">
        <h5 class="his-md-text">Total visits / incomplete visits: last 5 days</h5>
        <ApexChart width="100%" height="390px" type="bar" :options="options" :series="series" />
      </ion-col>
      <ion-col size-lg="6" size-sm="12">
        <span class="his-md-text">Encounters created today</span>
        <table class="his-sm-text">
          <tr>
            <th></th>
            <th>Female</th>
            <th>Male</th>
            <th>Me</th>
            <th>Facility</th>
          </tr>
          <tr v-for="(data, index) in rows" :key="index">
            <td class="encounter-td">{{ data.encounter }}</td>
            <td class="other-td">{{ data.female }}</td>
            <td class="other-td">{{ data.male }}</td>
            <td class="other-td">{{ data.me }}</td>
            <td class="other-td">{{ data.facility }}</td>
          </tr>
        </table>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { defineComponent } from "vue";
import dayjs from "dayjs";
import ApexChart from "vue3-apexcharts";
import { PatientReportService } from "../services/reports/patient_report_service";
import HisDate, { STANDARD_DATE_FORMAT } from "@/utils/Date";
import { EncounterReportService } from "../services/reports/encounter_report_service";

export default defineComponent({
  data: function () {
    return {
      sessionDate: PatientReportService.getSessionDate(),
      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: ["", "", "", "", ""],
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          title: {
            text: 'Number of clients',
            align: 'left'
          }
        },
      },
      series: [
        {
          name: "Total visits",
          data: [0, 0, 0, 0, 0],
          color: "#7cb5ec"
        },
        {
          name: "Total incomplete visits",
          data: [0, 0, 0, 0, 0],
          color: "#434348"
        },
      ],
      rows: [] as any,
      encounters: [
        { "HIV clinic registration": 9 },
        { "HIV reception": 51 },
        { "Vitals": 6 },
        { "HIV staging": 52 },
        { "HIV clinic consultation": 53 },
        { "ART adherence": 68 },
        { "Treatment": 25 },
        { "Dispensing": 54 },
        { "Appointments": 7 },
      ],
    };
  },
  components: {
    IonGrid,
    IonRow,
    IonCol,
    ApexChart
  },
  created() {
    this.rows = this.encounters.map(
      (enc) => ({
        encounter: Object.keys(enc)[0],
        female: '',
        male: '',
        me: '',
        facility: ''
    }))
  },
  mounted() {
    this.getVisits();
    this.getEncounters();
  },
  methods: {
    getVisits: async function () {
      const reportService = new PatientReportService();
      reportService.setStartDate(HisDate.subtract(this.sessionDate, 'days', 5).format(STANDARD_DATE_FORMAT));
      reportService.setEndDate(HisDate.subtract(this.sessionDate, 'days', 1).format(STANDARD_DATE_FORMAT));
      const data = await reportService.getVisitStats();
      const incomplete: number[] = [];
      const complete: number[] = [];
      const formattedDays: any[] = [];
      Object.entries(data).forEach(([date, {incomplete: i, complete: c}]: any) => {
        formattedDays.push(dayjs(date).format('dddd'))
        incomplete.push(i)
        complete.push(i + c);
      });
      this.series[0].data = [...complete];
      this.series[1].data = [...incomplete];
      this.options = {
        ...this.options,
        ...{
          xaxis: {
            categories: [...formattedDays],
          },
        },
      };
    },
    async getEncounters () {
      try {
        const encounterService = new EncounterReportService();
        const encounter_types = this.encounters.map((x) => Object.values(x)[0])
        const userData = await encounterService.getEncounterStats({ encounter_types })
        const facilityData = await encounterService.getEncounterStats({ encounter_types, all: true })
        this.rows = this.encounters.map(encounter => {
          const [ name, id ] = Object.entries(encounter)[0];
          return {
            encounter: name,
            female: facilityData[id]["F"],
            male: facilityData[id]["M"],
            me: userData[id]["F"] + userData[id]["M"],
            facility: facilityData[id]["F"] + facilityData[id]["M"],
          };
        });
      } catch (error) {
        console.error(error)
      }
    },
  },
});
</script>

<style scoped>
ion-grid {
  color: #333333;
}

.encounter-td {
  text-align: left;
  border: 1px solid #dddddd;
}

.other-td {
  text-align: right;
  font-weight: bold;
  border: 1px solid #dddddd;
  min-width: 60px;

}

table {
  border-collapse: collapse;
  width: 100%;
  height: 49vh;
}

td,
th {
  padding: 0.3em;
  text-align: right;
}

tr:nth-child(even) {
  background-color: #f1efef;
}

@media (min-width: 1280px) {

  td,
  th {
    text-align: right;
    padding: 0.8em;
  }
}
</style>