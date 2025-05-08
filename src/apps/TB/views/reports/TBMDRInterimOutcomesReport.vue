<template>
  <ion-page>
    <report-template
      title="MDR Interim Outcomes"
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
import {Option } from "@/components/Forms/FieldInterface";
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
      { label: "Culture positive", value: "culture_positive"},
      { label: "Culture negative", value: "culture_negative"},
      { label: "Culture and smear not done", value: "culture_and_smear_not_done"},
      { label: "Transfer out", value: "transfer_out"},
      { label: "Died", value: "died"},
      { label: "Lost to follow up", value: "lost_to_follow_up"},
      
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
    },

    async generate(config: any) {
      try {
        this.rows = [];
        this.columns = this.buildColumns(config.indicators.map((i: any) => i.label));
        this.indicatorsValue = config.indicators.map((i: any) => i.value);
        this.yearValue = config.year.value;
        this.quarterValue = config.quater.value;

        const service = new TBReportService();
        this.data = await service.getTBDRInterimOutcomesReport(
          this.yearValue,
          this.quarterValue,
          this.indicatorsValue
        );

        this.pushGenderAggregatedHeaders();

        this.populateRows();

        this.addTotals();

        modalController.getTop().then((t) => t && modalController.dismiss());
      } catch (e) {
        console.error(e);
        toastWarning("Unable to generate report");
      }
    },
    addTotals() {
      let totalsArray = this.data.flatMap((indicator: any) => {
        const maleIDs = Object.values(indicator).reduce((acc, ageGroup: any) => {
          if (ageGroup && ageGroup.male && ageGroup.male.length > 0) {
            return ageGroup.male;
          }
          return acc;
        }, []);

        const femaleIDs = Object.values(indicator).reduce((acc, ageGroup: any) => {
          if (ageGroup && ageGroup.female && ageGroup.female.length > 0) {
            return ageGroup.female;
          }
          return acc;
        }, []);

        return [maleIDs, femaleIDs];
      });
      totalsArray = totalsArray.map((v: any) =>
        this.toDrillColumn("total", { total: v, indicator: "" })
      );
      //push a black td at index 0 of the totals
      totalsArray.unshift(table.td("Totals"));
      this.rows.push(totalsArray);
    },
    populateRows() {
      // map data elements/rows to the table
      this.rows = this.age_groups.map((age: string) => {
        const row = [];
        row.push(table.td(age));
        this.data.forEach((indicator: any) => {
          const data = indicator[age];
          row.push(data ? this.toDrillColumn("male", data) : table.td(0));
          row.push(data ? this.toDrillColumn("female", data) : table.td(0));
        });

        return row;
      }) as any;
    },
    pushGenderAggregatedHeaders() {
      //  add M and F indicators to the table
      this.columns[1] = [];
      this.columns[1].push(table.thTxt("", { sortable: false, exportable: false }));
      for (let i = 0; i < this.indicatorsValue.length; i++) {
        this.columns[1].push(
          ...[
            table.thTxt("M", { sortable: false, exportable: false }),
            table.thTxt("F", { sortable: false, exportable: false }),
          ]
        );
      }
    },
    toDrillColumn(key: string, data: { [key: string]: any }) {
      return data[key].length == 0
        ? table.td(0)
        : table.tdLink(data[key].length, () => {
            this.drilldown({
              indicator: data.indicator,
              ids: [data[key]],
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
    buildColumns(indicators: string[]): Array<ColumnInterface[]> {
      const columns = [
        [
          table.thTxt("", {
            sortable: false,
            exportable: false,
          }),
          table.thTxt("Age Category", {
            sortable: false,
            exportable: false,
          }),
        ],
      ];
      indicators.forEach((indicator) => {
        columns[0].push(
          table.thTxt(indicator, {
            colspan: 2,
            sortable: false,
            exportable: true,
          })
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