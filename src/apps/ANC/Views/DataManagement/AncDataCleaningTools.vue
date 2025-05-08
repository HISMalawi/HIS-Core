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

<script lang='ts'>
import { defineComponent } from "vue";
import {
  AncDataCleaningToolService,
  AncCleaningIndicator,
} from "@/apps/ANC/Services/anc_datacleaning_service";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue";
import ReportTemplate from "@/apps/ART/views/reports/TableReportTemplate.vue";
import table from "@/components/DataViews/tables/ReportDataTable";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { IonPage } from "@ionic/vue";
import { Service } from "@/services/service";
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import HisDate from "@/utils/Date"
import { find } from "lodash";

export default defineComponent({
  mixins: [ReportMixin],
  components: { ReportTemplate, IonPage },
  data: () => ({
    title: "Data cleaning report",
    rows: [] as Array<any>,
    columns: [] as Array<any>,
    defaultIndicator: {} as Option | null
  }),
  created() {
    this.fields = [
        {
            id: "indicator",
            helpText: "Select indicator",
            type: FieldType.TT_SELECT,
            requireNext: false,
            condition: () => !this.defaultIndicator,
            defaultOutput: () =>  this.defaultIndicator as Option,
            validation: (val: Option) => Validation.required(val),
            options: () => this.getIndicatorOptions()
        },
        ...generateDateFields({
            id: 'start_date',
            helpText: 'Start',
            required: true,
            minDate: () => '2000-01-01',
            maxDate: () => Service.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date 
        }),
        ...generateDateFields({
            id: 'end_date',
            helpText: 'End',
            required: true,
            minDate: (_: any, c: any) => c.start_date,
            maxDate: () => Service.getSessionDate(),
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date
        })
    ]
    this.defaultIndicator = find(this.getIndicatorOptions(), {
        value: this.$route.query['cleaning_tool'] as string
    }) as Option || null
  },
  methods: {
    async onPeriod(form: any, config: any) {
      const d = (date: string) => HisDate.toStandardHisDisplayFormat(date)
      this.rows = []
      this.title = form.indicator.label
      const indicator = form.indicator
      this.columns = indicator.other.columns
      this.report = new AncDataCleaningToolService()
      this.report.setStartDate(config.start_date)
      this.report.setEndDate(config.end_date)
      this.period = `${d(config.start_date)} - ${d(config.end_date)}`
      const data = await this.report.getDataToolReport(indicator.value)
      if (data) {
        this.rows = await Promise.all(data.map((d: any) => indicator.other.formatRow(d)))
      }
    },
    showPatientBtn(patientID: number) {
        return table.tdBtn("View", () => this.$router.push('/patient/dashboard/' + patientID))
    },
    getIndicatorOptions() {
        return [
            {
                label: "Males with ANC Encounters",
                value: AncCleaningIndicator.MALES_WITH_ANC_ENCOUNTERS,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("First name"),
                            table.thTxt("Last name"),
                            table.thTxt("Total Encounters"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.identifier),
                        table.td(d.given_name),
                        table.td(d.family_name),
                        table.td(d.total_encounters),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            },
            {
                label: "Encounters after death",
                value: AncCleaningIndicator.ENCOUNTERS_AFTER_DEATH,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("First name"),
                            table.thTxt("Last name"),
                            table.thTxt("Date of death"),
                            table.thTxt("Recent encounter date"),
                            table.thTxt("Count"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.identifier),
                        table.td(d.given_name),
                        table.td(d.family_name),
                        table.tdDate(d.patient_died_date),
                        table.tdDate(d.minimum_encounter_datetime),
                        table.td(d.total_encounters),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            },
            {
                label: "Incomplete visits",
                value: AncCleaningIndicator.INCOMPLETE_VISITS,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("Name"),
                            table.thTxt("Visit date"),
                            table.thTxt("Incomplete count"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.n_id),
                        table.td(d.name),
                        table.td(d.visit_date),
                        table.td(d.visit_no),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            },
            {
                label: 'Duplicate encounters',
                value: AncCleaningIndicator.DUPLICATE_ENCOUNTERS,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("Given name"),
                            table.thTxt("Family name"),
                            table.thTxt("Name"),
                            table.thTxt("Total"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.identifier),
                        table.td(d.given_name),
                        table.td(d.family_name),
                        table.td(d.name),
                        table.td(d.total),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            },
            {
                label: 'Missing HIV Status',
                value: AncCleaningIndicator.MISSING_HIV_STATUS,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("Given name"),
                            table.thTxt("Family name"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.identifier),
                        table.td(d.given_name),
                        table.td(d.family_name),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            },
            {
                label: 'Missing Last Menstrual Period (LMP)',
                value: AncCleaningIndicator.MISSING_LMP,
                other: {
                    columns: [
                        [
                            table.thTxt("National ID"),
                            table.thTxt("Given name"),
                            table.thTxt("Family name"),
                            table.thTxt("Action")
                        ]
                    ],
                    formatRow: (d: any) => [
                        table.td(d.identifier),
                        table.td(d.given_name),
                        table.td(d.family_name),
                        this.showPatientBtn(d.patient_id)
                    ]
                }
            }
        ]
    }
  }
})
</script>
