<template>
  <ion-page>
    <report-template
      :title="`TB MDR Case Finding Report`"
      :period="`Period`"
      :rows="rows"
      :fields="reportConfig"
      :columns="columns"
      reportPrefix="NTP"
      :config="{
        showIndex: true,
      }"
      :onReportConfiguration="generate"
    >
    </report-template>
  </ion-page>
</template>
<script lang="ts">
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import { defineComponent, ref } from "vue";
import { IonPage, modalController } from "@ionic/vue";
import { toastWarning } from "@/utils/Alerts";
import { FieldType } from "@/components/Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import { TBReportService } from "@/apps/ART/services/reports/tb_report_service";
import table from "@/components/DataViews/tables/ReportDataTable";
import { ColumnInterface } from "@/components/DataViews/tables/ReportDataTable";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import TBDrilldown from "@/apps/TB/components/TBDrilldown.vue";

export default defineComponent({
  mixins: [ReportMixin],
  components: {
    IonPage,
    ReportTemplate,
  },
  data: () => ({
    rows: [] as any,
    columns: ref<Array<ColumnInterface>[]>([[]]),
    subtitle: ref("-"),
    data: ref<any[]>([]),
    yearValue: ref<string>(""),
    quarterValue: ref<number>(1),
    indicatorsValue: ref<string[]>([]),
    footerText: ref<string>("Select All"),
    reportIndicators: [
      {
        label: "Patients aged fourteen and below",
        value: "patients_aged_fourteen_and_below",
      },
      {
        label: "Patients aged fourteen and above",
        value: "patients_aged_fourteen_and_above",
      },
      { label: "New DR cases", value: "new_dr_cases" },
      {
        label: "Previously treated with firstline drugs",
        value: "previously_treated_with_firstline_drugs",
      },
      {
        label: "Previously treated for TB Drug Resistance",
        value: "previously_treated_for_tb_drug_resistance",
      },
      {
        label: "Patients on Individualised regimen",
        value: "patients_on_individualised_regimen",
      },
      {
        label: "Patients on Short regimen",
        value: "patients_on_short_regimen",
      },
      {
        label: "Patients on Standardised regimen",
        value: "patients_on_standardised_regimen",
      },
      { label: "DR Male patients", value: "dr_male_patients" },
      { label: "DR Female patients", value: "dr_female_patients" },
      { label: "DR HIV Positive patients", value: "dr_hiv_positive_patients" },
      { label: "DR HIV Negative patients", value: "dr_hiv_negative_patients" },
      { label: "DR patients on ART", value: "dr_patients_on_art" },
      { label: "DR patients not on ART", value: "dr_patients_not_on_art" },
    ],
    reportConfig: [] as any,
    age_groups: ["0-4", "5-14", "15-24", "25-34", "35-44", "45-54", "55-64", "65+"],
  }),
  mounted() {
    this.init();
  },
  methods: {
    init(): void {
      this.reportConfig = [
        {
          id: "year",
          helpText: "Year",
          type: FieldType.TT_NUMBER,
          validation: (val: Option) => Validation.required(val),
          computedValue: (v: Option) => v.value,
        },
        {
          id: "quater",
          helpText: "Quater",
          type: FieldType.TT_SELECT,
          requireNext: false,
          options: () => [
            { label: "First", value: 1 },
            { label: "Second", value: 2 },
            { label: "Third", value: 3 },
            { label: "Fourth", value: 4 },
          ],
          validation: (val: Option) => Validation.required(val),
          computedValue: (v: Option) => v.value,
        },
        {
          id: "indicators",
          helpText: "Indicators",
          type: FieldType.TT_MULTIPLE_SELECT,
          options: () => this.reportIndicators as Array<Option>,
          validation: (val: Option) => Validation.required(val),
          computedValue: (v: Option[]) => v.map((d) => d.value),
          config: {
            footerBtns: [
              {
                name: this.footerText,
                slot: "end",
                onClickComponentEvents: {
                  refreshOptions: () =>
                    this.footerText === "Select All"
                      ? this.selectAll()
                      : this.deSelectAll(),
                },
                onClick: () => "None",
              },
            ],
          },
        },
      ];
      this.columns = this.buildColumns();
    },

    async generate(config: any) {
      try {
        this.rows = [];
        this.indicatorsValue = config.indicators.map((i: any) => i.value);
        this.yearValue = config.year.value;
        this.quarterValue = config.quater.value;

        const service = new TBReportService();
        this.data = await service.getMDRTBCaseFindingReport(
          this.yearValue,
          this.quarterValue,
          this.indicatorsValue
        );

        this.populateData();

        modalController.getTop().then((t) => t && modalController.dismiss());
      } catch (e) {
        console.error(e);
        toastWarning("Unable to generate report");
      }
    },
    populateData() {
      this.data.forEach((d: any) => {
        const row = [
          table.td(
            this.reportIndicators.find(
              (e) => e.value == this.indicatorsValue.find((i) => i === d.indicator)
            )?.label as any
          ),
          this.toDrillColumn(d.indicator, d.data.clinical.male),
          this.toDrillColumn(d.indicator, d.data.clinical.female),
          this.toDrillColumn(d.indicator, d.data.mdr_confirmed.male),
          this.toDrillColumn(d.indicator, d.data.mdr_confirmed.female),
          this.toDrillColumn(d.indicator, d.data.rif_confirmed.male),
          this.toDrillColumn(d.indicator, d.data.rif_confirmed.female),
          this.toDrillColumn(d.indicator, d.data.total.male),
          this.toDrillColumn(d.indicator, d.data.total.female),
        ];
        this.rows.push(row);
      });
    },
    toDrillColumn(indicator: string, value: string) {
      return table.tdLink(value.length, () => {
        this.drilldown({
          indicator: indicator,
          ids: value,
        });
      });
    },
    async drilldown(props: any) {
      (
        await modalController.create({
          component: TBDrilldown,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: {
            title: props.indicator,
            patientIdentifiers: props.ids,
            subtitle: `Period: ${this.period} Q${this.quarterValue}`,
            onFinish: () =>
              modalController.getTop().then((v) => v && modalController.dismiss()),
          },
        })
      ).present();
    },
    buildColumns(): Array<ColumnInterface[]> {
      const headers = ["Clinical", "Confirmed", "Confirmed RR", "Totals"];
      const columns = [
        [
          table.thTxt("", {
            sortable: false,
            exportable: false,
          }),
          table.thTxt("DR RR/TB Cases detected and enrolled", {
            sortable: false,
            exportable: false,
          }),
        ],
      ];
      headers.forEach((header) => {
        columns[0].push(
          table.thTxt(header, { colspan: 2, sortable: false, exportable: false })
        );
      });

      // second row
      columns[1] = [];
      columns[1].push(table.thTxt("", { sortable: false, exportable: false }));
      headers.forEach(() => {
        columns[1].push(
          ...[
            table.thTxt("Male", { sortable: false, exportable: false }),
            table.thTxt("Female", { sortable: false, exportable: false }),
          ]
        );
      });

      return columns;
    },
    deSelectAll(): any {
      const indicators = this.reportIndicators;
      this.footerText = "Select All";
      return indicators.map((l) => {
        return { ...l, isChecked: false };
      });
    },
    selectAll(): any {
      const indicators = this.reportIndicators;
      this.footerText = "Deselect All";
      return indicators.map((l) => {
        return { ...l, isChecked: true };
      });
    },
  },
});
</script>
