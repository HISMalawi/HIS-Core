<template>
  <ion-grid>
    <ion-row>
      <ion-col v-for="stat in patientSummaryStats" :key="stat.label">
        <opd-stat-card
          :label="stat.label"
          :value="stat.value"
          :color="stat.color ?? ''"
        />
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-card class="custom-card">
    <ion-grid class="no-padding">
      <ion-row class="table-header">
        <ion-col size="3" class="table-cell">Task Type</ion-col>
        <ion-col size="3" class="table-cell">Me</ion-col>
        <ion-col size="3" class="table-cell">Facility</ion-col>
        <ion-col size="3" class="table-cell">Today</ion-col>
      </ion-row>
      <ion-row v-for="(row, index) in tableData" :key="index" :class="index % 2 === 0 ? 'even-row' : 'odd-row'">
        <ion-col size="3" class="table-cell">{{ row[0] }}</ion-col>
        <ion-col size="3" class="table-cell">{{ row[1] }}</ion-col>
        <ion-col size="3" class="table-cell">{{ row[2] }}</ion-col>
        <ion-col size="3" class="table-cell">{{ row[3] }}</ion-col>
      </ion-row>
    </ion-grid>
  </ion-card>
</template>

<script lang="ts">
import { IonGrid, IonRow, IonCol, IonCard } from "@ionic/vue";
import { defineComponent } from "vue";
import ApiClient from "@/services/api_client";
import dayjs from "dayjs";
import OpdStatCard from '@/apps/AETC/components/OpdStatCard.vue';
import { ProgramService } from "@/services/program_service"

export default defineComponent({
  data: function () {
    return {
      dayjs,
      sessionDate: "",
      patientSummaryStats: [
        { label: 'Registered today', value: -1, color: 'lightyellow' },
        { label: 'Returning today', value: -1, color: 'lightyellow' },
        { label: 'Referred today', value: -1, color: 'lightyellow' },
        { label: 'Total', value: -1, color: 'yellowgreen' },
      ],
      seriesVisits: [] as any,
      optionsVisits: {} as any,
      optionsSyndromic: {} as any,
      seriesSyndromic: [] as any,

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
      },
      series: [] as any,
      tableData: [] as any,
    };
  },
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    OpdStatCard
  },
  mounted() {
    this.sessionDate = ProgramService.getSessionDate()
    this.getHomeDashboardStats();
  },
  methods: {
    getHomeDashboardStats: async function(){
      const response = await ApiClient.get(
        `dashboard_stats?date=${this.sessionDate}&program_id=30`
      );

      if(response && response.status == 200) {
        const data = await response.json();
        const convertedArray = this.transformData(data.bottom);
        //assign to table data
        this.tableData = convertedArray
        // getting top dashboard details
        this.patientSummaryStats = this.getTodaysPatientVisits(data.top)
      }
    },

    getTodaysPatientVisits(data: any) {
      const keys = Object.keys(data)
      let total = 0
      const visits: Array<any> = []

      keys.forEach(key => {
        visits.push({
          label: this.capitalizeFirstLetter(key.replace('_', ' ')),
          value: data[key],
          color: 'lightyellow'
        })

        total += data[key]
      })

      visits.push({
        label: 'Total',
        value: total,
        color: 'yellowgreen'
      })

      return visits
    },

    capitalizeFirstLetter(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },

    // Method to change data structure to desired format
    transformData(data: Array<any>): Array<Array<string>> {
      return data.map(item => [
        item.name,
        item.me.toString(),
        item.facility.toString(),
        item.total.toString(),
      ]);
    },
  },
});
</script>

<style scoped>
.table-cell {
  font-size: 12px; /* Adjust the font size as desired */
  padding: 12px 16px; /* Adjust the padding as desired */
}
.no-padding {
  padding: 0 !important;
}

.custom-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-header {
  background-color: #333333; /* Dark gray */
  color: white;
}

.even-row {
  background-color: #f1f1f1; /* Light gray */
}

.odd-row {
  background-color: white;
}
</style>