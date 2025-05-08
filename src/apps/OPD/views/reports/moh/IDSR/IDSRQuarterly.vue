<template>
  <ion-loading :is-open="isLoading" message="Please wait..."> </ion-loading>
  <his-standard-form
    v-if="!reportReady"
    @onFinish="onPeriod"
    :skipSummary="true"
    :fields="fields"
  >
  </his-standard-form>
  <ion-page v-if="reportReady">
    <ion-content>
      <div id="report-content">
        <idsr-h
          :key="componentKey"
          :reportName="reportName"
          :rangeLabel="rangeLabel"
          :range="range"
          ref="header"
          :periodLabel="periodLabel"
          :periodDates="periodDates"
          :clinicName="clinicName"
          :totalOPDVisits="TotalOPDVisits"
        ></idsr-h>
        <div class="my-table">
          <report-table
            :columns="columns"
            :rows="rows"
            :config="{ tableCssTheme }"
          >
          </report-table>
        </div>
      </div>
    </ion-content>
    <his-footer :btns="btns"></his-footer>
  </ion-page>
  <div id="print"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HisFooter from "@/components/HisDynamicNavFooter.vue";
import { IonPage, IonContent, IonLoading } from "@ionic/vue";
import { Field } from "@/components/Forms/FieldInterface";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixinVue from "../../ReportMixin.vue";
import { IDSRReportService } from "@/apps/OPD/services/idsr_service";
import IdsrH from "@/apps/OPD/views/reports/moh/MOHReportHeader.vue";
import HisDate from "@/utils/Date";
import { Service } from "@/services/service";
import useFacility from "@/composables/useFacility";
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import { toCsv } from "@/utils/Export";
import { toastWarning } from "@/utils/Alerts";

export default defineComponent({
  mixins: [ReportMixinVue],
  components: {
    IonLoading,
    IdsrH,
    HisStandardForm,
    HisFooter,
    IonPage,
    IonContent,
    ReportTable,
  },
  data: () => ({
    formData: {} as any,
    componentKey: 0 as number,
    computedFormData: {} as any,
    btns: [] as Array<any>,
    isLoading: false as boolean,
    fields: [] as Array<Field>,
    reportID: -1 as any,
    periodLabel: "Quarter Periods",
    reportTitle: "",
    periodDates: "" as string,
    reportName: "QUARTERLY DISEASE SURVEILLANCE REPORT",
    rangeLabel: "Quarter",
    range: "" as string,
    TotalOPDVisits: 0 as number,
    reportReady: false as boolean,
    tableCssTheme: 'opd-report-theme',
    rows: [] as RowInterface[][],
    columns: [
      [
        table.thTxt('', { colspan: 2, sortable: false }),
        table.thTxt('Out-patient Cases', { colspan: 3, sortable: false }),
        table.thTxt('In-patient Cases', { colspan: 3, sortable: false }),
        table.thTxt('In-patient Cases Death', { colspan: 3, sortable: false }),
        table.thTxt('Laboratory Findings', { colspan: 6, sortable: false }),
      ],
      [
        table.thTxt('', { colspan: 2, sortable: false }),
        table.thTxt('', { colspan: 3, sortable: false }),
        table.thTxt('', { colspan: 3, sortable: false }),
        table.thTxt('', { colspan: 3, sortable: false }),
        table.thTxt('No. of Tested Cases', { colspan: 3, sortable: false }),
        table.thTxt('No. of Positive Cases', { colspan: 3, sortable: false }),
      ],
      [
        table.thTxt('Diseases/Events/Conditions', { colspan: 2 }),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
      ]
    ] as ColumnInterface[][],
  }),
  computed: {
    clinicName() {
      return useFacility().facilityName.value;
    },
  },
  created() {
    this.btns = this.getBtns();
    this.fields = this.getDateDurationFields(true);
  },
  methods: {
    async onPeriod(form: any, cForm: any, regenerate = false) {
      this.componentKey += 1;
      this.formData = form;
      this.computedFormData = cForm;
      this.reportReady = true;
      this.isLoading = true;
      this.report = new IDSRReportService();
      this.report.setRegenerate(regenerate);
      this.report.setStartDate(
        HisDate.toStandardHisFormat(form.quarter.other.start)
      );
      this.report.setEndDate(
        HisDate.toStandardHisFormat(form.quarter.other.end)
      );
      this.periodDates = this.report.getReportPeriod();
      this.range = form.quarter.label.split(" ")[0];
      this.reportTitle = `MOH ${Service.getLocationName()} Quarterly IDSR ${
        this.periodDates
      }`;
      try {
        const idsr = await this.report.requestIDSRQuarterly();
        const visits = await this.report.getAttendance();
        if (idsr && visits) {
          this.reportID = "data";
          this.TotalOPDVisits = visits.length;
          this.rows = this.buildRows(idsr);
        }
      } catch (error) {
        console.log(error);
        toastWarning("An error occurred while fetching the report data");
      } finally {
        this.isLoading = false;
      }
    },
    buildDrillColumn(ids: Array<number>, conditionName: string) {
      if(ids.length > 0) {
        return table.tdLink(ids.length, () => this.onDrillDown(conditionName, ids));
      }
      return table.td(0);
    },
    buildRows(conditions: any) {
      const rows = [] as RowInterface[][];
      Object.entries(conditions).forEach(([condition, data]: any, index) => {
        rows.push([
          table.td(index + 1),
          table.td(condition, { style: { textAlign: 'left' }}),
          this.buildDrillColumn(data["<5 yrs"].outpatient_cases, `${condition} < 5 yrs Out-patient Cases`),
          this.buildDrillColumn(data[">=5 yrs"].outpatient_cases, `${condition} >= 5 yrs Out-patient Cases`),
          this.buildDrillColumn(data["<5 yrs"].outpatient_cases.concat(data[">=5 yrs"].outpatient_cases), `${condition} Total Out-patient Cases`),
          this.buildDrillColumn(data["<5 yrs"].inpatient_cases, `${condition} < 5 yrs In-patient Cases`),
          this.buildDrillColumn(data[">=5 yrs"].inpatient_cases, `${condition} >= 5 yrs In-patient Cases`),
          this.buildDrillColumn(data["<5 yrs"].inpatient_cases.concat(data[">=5 yrs"].inpatient_cases), `${condition} Total In-patient Cases`),
          this.buildDrillColumn(data["<5 yrs"].inpatient_cases_death, `${condition} < 5 yrs In-patient Cases Death`),
          this.buildDrillColumn(data[">=5 yrs"].inpatient_cases_death, `${condition} >= 5 yrs In-patient Cases Death`),
          this.buildDrillColumn(data["<5 yrs"].inpatient_cases_death.concat(data[">=5 yrs"].inpatient_cases_death), `${condition} Total In-patient Cases Death`),
          this.buildDrillColumn(data["<5 yrs"].tested_malaria, `${condition} < 5 yrs Tested Malaria`),
          this.buildDrillColumn(data[">=5 yrs"].tested_malaria, `${condition} >= 5 yrs Tested Malaria`),
          this.buildDrillColumn(data["<5 yrs"].tested_malaria.concat(data[">=5 yrs"].tested_malaria), `${condition} Total Tested Malaria`),
          this.buildDrillColumn(data["<5 yrs"].tested_positive_malaria, `${condition} < 5 yrs Tested Positive Malaria`),
          this.buildDrillColumn(data[">=5 yrs"].tested_positive_malaria, `${condition} >= 5 yrs Tested Positive Malaria`),
          this.buildDrillColumn(data["<5 yrs"].tested_positive_malaria.concat(data[">=5 yrs"].tested_positive_malaria), `${condition} Total Tested Positive Malaria`)
        ]);
      });
      return rows;
    },
    getBtns() {
      return [
        {
          name: "CSV",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: async () => {
            const headers = [[
              "No.",
              "Diseases/Events/Conditions",
              "< 5 yrs Out-patient Cases",
              ">= 5 yrs Out-patient Cases",
              "Total Out-patient Cases",
              "< 5 yrs In-patient Cases",
              ">= 5 yrs In-patient Cases",
              "Total In-patient Cases",
              "< 5 yrs In-patient Cases Death",
              ">= 5 yrs In-patient Cases Death",
              "Total In-patient Cases Death",
              "< 5 yrs Tested Malaria",
              ">= 5 yrs Tested Malaria",
              "Total Tested Malaria",
              "< 5 yrs Tested Positive Malaria",
              ">= 5 yrs Tested Positive Malaria",
              "Total Tested Positive Malaria",
            ]];
            const csvRows = this.rows.map(row => row.map(cell => cell.td));
            toCsv(headers, csvRows, this.reportTitle);
          },
        },
        {
          name: "PDF",
          size: "large",
          slot: "start",
          color: "primary",
          visible: true,
          onClick: () => this.exportToCustomPDF(this.reportTitle),
        },
        {
          name: "Back",
          size: "large",
          slot: "end",
          color: "warning",
          visible: true,
          onClick: () => (this.reportReady = false),
        },
        {
          name: "Refresh",
          size: "large",
          slot: "end",
          color: "warning",
          visible: true,
          onClick: async () =>
            await this.onPeriod(this.formData, this.computedFormData, true),
        },
        {
          name: "Finish",
          size: "large",
          slot: "end",
          color: "success",
          visible: true,
          onClick: () => this.$router.push({ path: "/" }),
        },
      ];
    },
  },
});
</script>

<style scoped>
.my-table {
  margin: auto;
  width: 95%;
  margin-top: 3%;
  margin-bottom: 3%;
}
</style>
