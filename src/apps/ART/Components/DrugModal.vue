<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        Stock levels (Consumption rate calculated over a 3 month
        period)
      </ion-title>
      <ion-button color="danger" slot="end" @click="closeModal()" class="ion-margin-end">X</ion-button>
    </ion-toolbar>
  </ion-header>
  <ion-toolbar>
    <ion-segment @ionChange="segmentChanged($event)" :value="segment">
      <ion-segment-button value="paeds">
        <ion-label>Paeds</ion-label>
      </ion-segment-button>
      <ion-segment-button value="adults">
        <ion-label>Adults</ion-label>
      </ion-segment-button>
    </ion-segment>
  </ion-toolbar>
  <ion-content class="ion-padding">
    <ApexChart
      width="100%"
      type="bar"
      :options="options"
      :series="series"
    />
  </ion-content>
</template>
<script lang="ts">
import {
  IonContent,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  modalController,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { StockService } from "../views/ARTStock/stock_service";
import ApexChart from "vue3-apexcharts";

export default defineComponent({
  name: "Modal",
  components: {
    ApexChart,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonSegment,
    IonSegmentButton,
  },
  methods: {
    async closeModal() {
      await modalController.dismiss();
    },
    getDrugs() {
      this.paedDrugs = StockService.getPaedeatricDrugs();
      this.adultDrugs = StockService.getAdultDrugs();
      this.formatDrugs();
    },
    segmentChanged(ev: CustomEvent) {
      this.segment = ev.detail.value;
      this.formatDrugs();
    },
    async formatDrugs() {
      const service = new StockService();
      const drugs = this.segment === "paeds" ? this.paedDrugs : this.adultDrugs;
      const data: any = [];
      this.series[0].data = [...data];
      drugs.forEach(async (element: any) => {
        const stockLevels = await service.getConsumptionRate(element.drugID);
        const stockLevelInMonths = parseInt(
          stockLevels["stock_level_in_months"]
        );

        this.series[0].data.push({
          x: element.shortName,
          y: stockLevelInMonths,
        });
      });
    },
  },
  created() {
    this.getDrugs();
  },
  data() {
    return {
      paedDrugs: [] as any,
      adultDrugs: [] as any,
      segment: "paeds",
      options: {
        chart: {
          id: "vuechart-example",
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
            dataLabels: {
              position: 'top',
            },
            colors: {
              ranges: [
                {
                  from: 0,
                  to: 2,
                  color: "#ff0000",
                },
                {
                  from: 2,
                  to: 4,
                  color: "#66CDAA",
                },
                {
                  from: 4,
                  to: 1000000,
                  color: "#ffff00",
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: true,
          offsetX: 0,
          style: {
            fontSize: '12px',
            colors: ['#656565']
          }
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['#fff']
        },
        tooltip: {
          shared: true,
          intersect: false,
        },
        grid: {
          column: {
            colors: ["#FFFFFF", "#FFFFFF", "green"],
          },
        },
        yaxis: {
          min: 1,
          max: 9,
          fillColor: "#ffff00",
          tickAmount: 1,
        },
        xaxis: {
          fillColor: "#ffff00",
        },
      },
      series: [
        {
          name: "Available",
          data: [] as any,
        },
      ],
    };
  },
});
</script>