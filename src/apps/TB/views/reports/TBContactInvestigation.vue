<template>
  <ion-page>
    <v2Datatable
      title="TB Contact Investigations Report"
      :subtitle="subtitle"
      :columnData="data"
      :columns="columns"
      :on-finish="onFinish"
      :on-refresh="generate"
      :on-configure="configure"
      :rowsPerPage="20"
      report-prefix="NTP"
    />
  </ion-page>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { IonPage, loadingController, modalController } from "@ionic/vue";
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue";
import { v2ColumnInterface } from "@/components/DataViews/tables/v2PocDatatable/types";
import router from "@/router";
import { toastWarning } from "@/utils/Alerts";
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import { TBReportService } from "@/apps/ART/services/reports/tb_report_service";
import TBDrilldown from "@/apps/TB/components/TBDrilldown.vue";

export default defineComponent({
  components: {
    IonPage,
    v2Datatable,
  },
  setup() {
    const subtitle = ref("-");
    const data = ref<any[]>([]);
    const yearValue = ref<string>("");
    const quarterValue = ref<number>(1);
    const indicatorsValue = ref<string[]>([]);
    const footerText = ref<string>("Select All");
    const toDrillColumn = (label: string, ref: string) => {
      return {
        label,
        ref,
        toValue: (data: any) => data.length,
        tdClick: (row: any) => drilldown(row),
      };
    };
    const drilldown = async (props: any) => {
      (console.log(props),
      await modalController.create({
        component: TBDrilldown,
        backdropDismiss: false,
        cssClass: "large-modal",
        componentProps: {
          title: props.column.label,
          patientIdentifiers: props.refData,
          subtitle: `Period: ${yearValue.value} Q${quarterValue.value}`,
          onFinish: () =>
            modalController.getTop().then((v) => v && modalController.dismiss()),
        },
      })).present();
    };
    const reportIndicators = ref<Option[]>([
      {
        label: "Number of Pulmonary TB Cases",
        value: "number_of_pulmonary_tb_cases",
      },
      {
        label: "Number of Index TB Cases",
        value: "number_of_index_tb_cases",
      },
      {
        label: "Number of HH Contacts Registered",
        value: "number_of_hh_contacts_registered",
      },
      {
        label: "Number of HH Contacts Screened for TB",
        value: "number_of_hh_contacts_screened_for_tb",
      },
      {
        label: "Number of HH Contacts with Presumptive TB",
        value: "number_of_hh_contacts_with_presumptive_tb",
      },
      {
        label: "Number of Under Fives among HH Contacts",
        value: "number_of_under_fives_among_hh_contacts",
      },
      {
        label: "Number of Under Fives among HH Contacts",
        value: "number_of_under_fives_among_hh_contacts",
      },
      {
        label: "Number of Under Fives among HH Contacts",
        value: "number_of_under_fives_among_hh_contacts",
      },
      {
        label: "Number of Eligible Under Fives on IPT",
        value: "number_of_eligible_under_fives_on_ipt",
      },
    ]);
    const columns: Array<v2ColumnInterface[]> = [
      [
        {
          label: "Indicator",
          ref: "indicator",
          value: (data: any) =>
            `${reportIndicators.value.find((r) => r.value === data.indicator)?.label}`,
        },
        toDrillColumn("Total", "total"),
      ],
    ];

    const generate = async () => {
      (
        await loadingController.create({
          backdropDismiss: false,
          message: "Generating report, Please wait...",
        })
      ).present();
      try {
        const report_service = new TBReportService();
        const results = await report_service.getTBContacts(
          yearValue.value,
          quarterValue.value,
          indicatorsValue.value
        );
        data.value = results.map((r: any) => {
          return {
            indicator: r.indicator,
            total: r.total,
          };
        });
      } catch (e) {
        console.error(e);
        toastWarning("Unable to generate report");
      }
      loadingController.getTop().then((t) => t && loadingController.dismiss());
    };

    /**
     * Loads a dialogue to allow users to configure start and end date
     */
    const configure = () =>
      MultiStepPopupForm(
        [
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
            options: () => reportIndicators.value as Array<Option>,
            validation: (val: Option) => Validation.required(val),
            computedValue: (v: Option[]) => v.map((d) => d.value),
            config: {
              footerBtns: [
                {
                  name: footerText,
                  slot: "end",
                  onClickComponentEvents: {
                    refreshOptions: () => {
                      if (footerText.value === "Select All") {
                        reportIndicators.value = selectAll();
                        return reportIndicators;
                      } else {
                        reportIndicators.value = deSelectAll();
                        return reportIndicators;
                      }
                    },
                  },
                  onClick: () => "None",
                },
              ],
            },
          },
        ],
        async (f: any, computedData: any) => {
          const { year, quater, indicators } = computedData;
          yearValue.value = year;
          quarterValue.value = quater;
          indicatorsValue.value = indicators;
          subtitle.value = `Period: ${year} Q${quater}`;
          modalController.dismiss();
          generate();
        },
        () => void 0
      );

    onMounted(() => {
      configure();
    });

    watch(reportIndicators, (val) => {
      if (val.every((v: any) => v.isChecked)) {
        footerText.value = "Deselect All";
      } else {
        footerText.value = "Select All";
      }
    });

    const onFinish = () => router.push("/");

    const deSelectAll = () => {
      const indicators = reportIndicators.value;
      return indicators.map((l) => {
        return { ...l, isChecked: false };
      });
    };

    const selectAll = () => {
      const indicators = reportIndicators.value;
      return indicators.map((l) => {
        return { ...l, isChecked: true };
      });
    };

    return {
      data,
      columns,
      subtitle,
      configure,
      generate,
      onFinish,
    };
  },
});
</script>
