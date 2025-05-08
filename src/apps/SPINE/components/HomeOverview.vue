<template>
  <ion-grid>
    <ion-row>
      <ion-col v-for="stat in patientSummaryStats" :key="stat.label">
        <stat-card
          :label="stat.label"
          :value="stat.value"
          :color="stat.color ?? ''"
        />
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-col>
        <ApexChart 
          width="100%"
          height="350px"
          type="bar"
          :options="options"
          :series="seriesVisits"
        />
      </ion-col>
      <ion-col>
        <table class="his-sm-text">
          <tr>
            <th></th>
            <th>Female</th>
            <th>Male</th>
            <th>Me</th>
            <th>Facility</th>
          </tr>
          <tr v-for="(data, index) in tableRows" :key="index">
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

<script lang="ts" setup>
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import ApexChart from "vue3-apexcharts";
import StatCard from '@/apps/SPINE/components/StatCard.vue'
import { SpineReportService } from "../services/spine_report_service";
import { isEmpty } from "lodash";
import dayjs from "dayjs";

const stats = ref<any>();
const tableRows = computed(() => isEmpty(stats.value) 
  ? [
      { encounter: "Patient Registration", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "HIV tests", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "Influeza data", female: 0, male: 0, me: 0, facility: 0},
      { encounter: "Chronic conditions", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "Patient Diagnosis", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "Prescriptions", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "Dispensations", female: 0, male: 0, me: 0, facility: 0 },
      { encounter: "Discharges", female: 0, male: 0, me: 0, facility: 0 },
    ]
  : stats.value.rows
);
 
const patientSummaryStats = computed(() => [ 
    { label: 'Registered today', value: stats.value?.patient_summary_stats?.top?.registered_today ?? - 1, color: 'lightyellow' },
    { label: 'Returning today', value: stats.value?.patient_summary_stats?.top?.returning_today ?? - 1, color: 'lightyellow' },
    { label: 'Referred today', value: stats.value?.patient_summary_stats?.top?.referred_today ?? - 1, color: 'lightyellow' },
    { label: 'Total', value: getTotalVisits(stats.value?.patient_summary_stats?.top ?? {}) ?? - 1, color: 'yellowgreen' },
  ]
);

function getTotalVisits (data: any) {
  return Object.values(data).reduce((acc: number, curr: any) => acc += curr, 0)
}

const seriesVisits = ref<Array<any>>([]);
const options = ref({
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
      text: 'Number of clients'
    }
  },
  noData: {  
    text: "Loading data. Please wait...",  
    align: 'center',  
    verticalAlign: 'middle',  
    offsetX: 0,  
    offsetY: 0,  
    style: {  
      color: "#000000",  
      fontSize: '30px',  
      fontFamily: "Helvetica"
    }  
  }
});

function buildGraphData (chartData: any ) {
  Object.entries(chartData).forEach(([name, values]: any) => {
    const startDates = [] as Array<any>; 
    const data = [] as Array<any>;
    Object.values(values).forEach(({start_date, count}: any) => {
      startDates.push(dayjs(start_date).format("MMM/YYYY"));
      data.push(count);
    });
    seriesVisits.value.push({ data, name });
    options.value.xaxis.categories = startDates
  })
}

onMounted(async () => {
  const service = new SpineReportService();
  service.startDate = service.date;
  service.endDate = service.date;
  stats.value = await service.getReport("dashboard");
  buildGraphData(stats.value.patient_summary_stats.down);
})
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
@media (min-width: 1280px)  {
  td,
  th {
    text-align: right;
    padding: 0.8em;
  }
}
</style>