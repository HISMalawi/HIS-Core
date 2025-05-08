<template>
  <ion-page>
    <report-template
      :title="title"
      :period="period"
      :rows="rows"
      :fields="fields"
      :columns="columns"
      :showFilters="true"
      :onReportConfiguration="onPeriod"
    >
    </report-template>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  TBDataCleaningToolService,
  TBCleaningIndicator,
} from "../../services/tb_data_cleaning_service";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import { IonPage } from "@ionic/vue";
import { Option } from "@/components/Forms/FieldInterface";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper";
import { Service } from "@/services/service";
import table from "@/components/DataViews/tables/ReportDataTable";
import HisDate from "@/utils/Date";
import { find, isNull } from "lodash";

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    title: "Data cleaning report",
    rows: [] as Array<any>,
    columns: [
      [
        table.thTxt("National ID"),
        table.thTxt("TB Number"),
        table.thTxt("Name"),
        table.thTxt("Gender"),
        table.thTxt("Birthdate"),
        table.thTxt("Residence"),
        table.thTxt("State"),
      ],
    ] as Array<any>,
    defaultIndicator: {} as Option | null,
  }),
  created() {
    (this.fields = [
      ...generateDateFields({
        id: "start_date",
        helpText: "Start",
        required: true,
        minDate: () => "2000-01-01",
        maxDate: () => Service.getSessionDate(),
        computeValue: (date: string) => date,
        estimation: {
          allowUnknown: false,
        },
      }),
      ...generateDateFields({
        id: "end_date",
        helpText: "End",
        required: true,
        minDate: () => "2000-01-01",
        maxDate: () => Service.getSessionDate(),
        computeValue: (date: string) => date,
        estimation: {
          allowUnknown: false,
        },
      }),
    ]),
      (this.defaultIndicator =
        find(this.getIndicatorOptions(), {
          label: this.$route.query["case"] as string,
        } as Option) || null);
  },
  methods: {
    async onPeriod(form: any, config: any) {
      const d = (date: string) => HisDate.toStandardHisDisplayFormat(date);
      this.rows = [];
      const indicator = this.defaultIndicator as any;
      this.title = indicator.label;
      this.columns = indicator.other.columns;
      this.report = new TBDataCleaningToolService();
      this.report.setStartDate(config.start_date);
      this.report.setEndDate(config.end_date);
      this.period = `${d(config.start_date)} - ${d(config.end_date)}`;
      const data = await this.report.getDataToolReport(indicator.value);
      console.log(indicator, data);
      if (!isNull(data)) {
        this.rows = await Promise.all(data.map((d: any) => indicator.other.formatRow(d)));
      }
    },
    mapRow(d: any): Array<any> {
      return [
        table.td(d.identifier || "N/A"),
        table.td(d.tb_number || "N/A"),
        table.tdLink(d.name, () =>
          this.$router.push({ path: `/patient/dashboard/${d.patient_id}`})
        ),
        table.td(d.gender || "N/A"),
        table.td(d.birthdate || "N/A"),
        table.td(d.residence || "N/A"),
        table.td(d.state || "N/A"),
      ];
    },
    getIndicatorOptions(): Array<Option> {
      return [
        {
          label: "without program",
          value: TBCleaningIndicator.WITHOUT_PROGRAM,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "with duplicate tb number",
          value: TBCleaningIndicator.WITH_DUPLICATE_TB_NUMBER,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "with unknown outcome",
          value: TBCleaningIndicator.WITH_UNKNOWN_OUTCOME,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "with dispensation anomalies",
          value: TBCleaningIndicator.WITH_DISPENSATION_ANOMALIES,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "in treatment but completed",
          value: TBCleaningIndicator.IN_TREATMENT_BUT_COMPLETED,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "bad tb number",
          value: TBCleaningIndicator.BAD_TB_NUMBER,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
        {
          label: "without tb number",
          value: TBCleaningIndicator.WITHOUT_TB_NUMBER,
          other: {
            columns: this.columns,
            formatRow: (d: any) => this.mapRow(d),
          },
        },
      ];
    },
  },
});
</script>
