<template>
  <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="AETC Diagnosis Report"
            :subtitle="period"
            :columns="columns"
            :columnData="reportData"
            :rowsPerPage="25"
            :onConfigure="configure"
            :csvQuarter="csvQuarter"
            :headers="csvheaders"
            :onRefresh="() => generate()"
        />
    </ion-page>
</template>

<script lang='ts'>
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonLoading, modalController } from "@ionic/vue"
import  v2Datatable from "@/apps/AETC/views/reports/clinic/TableView.vue"
import { v2ColumnDataInterface, v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import { AETCReportService } from "@/apps/AETC/services/aetc_report_service"
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"

const reportData = ref<any>([])
const startDate = ref('')
const endDate = ref('')
const period = ref('')
const isLoading = ref(false)
const csvQuarter = ref('')
const ageGroup = ref('')

export default defineComponent({ 
    components: { 
        IonPage,
        IonLoading,
        v2Datatable,
    },

    setup() {
        /**
         * Generates report by start date and end date
         */
         const generate = async () => {
            const report = new AETCReportService()
            report.startDate = startDate.value
            report.endDate = endDate.value
            report.ageGroup = ageGroup.value

            try {
                const rawReport = (await report.getClinicReport("diagnosis_report"))
                reportData.value = rawReport;
            }catch (e){
                console.log(e)
            }
         }

         const drilldown = async (title: string, patientIdentifiers: number[]) => {
            if (patientIdentifiers.length <= 0) {return;}
            (await modalController.create({
                component: DrillPatientIds,
                backdropDismiss: false,
                cssClass: 'large-modal',
                componentProps: {
                    title,
                    subtitle: period,
                    patientIdentifiers,
                    onFinish: () => modalController.getTop().then(v => v && modalController.dismiss())
                }
            })).present()
        }

        //csv headers
        const csvheaders = [
            'Diagnosis',
            'Total'
        ];

        //table headers and data mapping
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "Diagnosis",
                    ref: "data.diagnosis",
                    value: (data: any) => data.diagnosis
                },
                {
                    label: "Total",
                    ref: "data.data.length",
                    secondaryLabel: "Clients diagnosed with",
                    value: (data: any) => data.data.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.diagnosis} `, data.data
                    )
                },
            ]
        ]

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
            {
                id: "start_date",
                helpText: "Start Date",
                type: FieldType.TT_FULL_DATE,
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => v.value
            },
            {
                id: "end_date",
                helpText: "End Date",
                type: FieldType.TT_FULL_DATE,
                validation: (val: Option) => Validation.required(val),
                computedValue: (v: Option) => v.value
            },
            {
                id: "age_group",
                helpText: "Select Age Group(s)",
                type: FieldType.TT_MULTIPLE_SELECT,
                config: {
                    showKeyboard: false
                },
                computedValue: (v: Option[]) => v.map(d => d.value),
                validation(value: any): null | Array<string> {
                    return !value ? ["Value is required"] : null;
                },
                options:()=> ([
                    {
                        label: "< 6 months",
                        value: "< 6 months"
                    },
                    {
                        label: "6 months to < 1 yr",
                        value: "6 months to < 1 yr"
                    },
                    {
                        label: "1 to < 5",
                        value: "1 to < 5"
                    },
                    {
                        label: "5 to 14",
                        value: "5 to 14",
                    },
                    {
                        label: "> 14 to < 20",
                        value: "> 14 to < 20",
                    },
                    {
                        label: "20 to 30",
                        value: "20 to 30",
                    },
                    {
                        label: ">30 to <40",
                        value: ">30 to <40",
                    },
                    {
                        label: "40 to <50",
                        value: "40 to <50",
                    },
                    {
                        label: "ALL",
                        value: "all",
                    },
                ]),
            },    
        ], 
        (f: any, c: any) => {
            startDate.value = c.start_date
            endDate.value = c.end_date
            //convert to passable string
            ageGroup.value = `[${c.age_group.map((option: any) => `"${option}"`).join(', ')}]`;
            period.value = `Period (${toDate(startDate.value)} to ${toDate(endDate.value)})`
            modalController.dismiss()
            csvQuarter.value = `${toDate(startDate.value)} to ${toDate(endDate.value)}`            

            generate()
        })

        /**
         * Initialization code when the report is empty!
         */
         onMounted(() => !reportData.value.length && configure())



         return  {
            columns,
            isLoading,
            reportData,
            period,
            csvQuarter,
            csvheaders,
            generate,
            configure
         }
    }
})

</script>
