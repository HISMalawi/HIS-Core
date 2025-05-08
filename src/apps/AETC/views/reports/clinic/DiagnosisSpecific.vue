<template>
  <ion-page>
        <ion-loading :is-open="isLoading" message="Please wait..."/>
        <v2Datatable
            title="Diagnosis Specific Report"
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
import { toDate } from '@/utils/Strs';
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Option } from '@/components/Forms/FieldInterface'
import Validation from "@/components/Forms/validations/StandardValidations"
import { PatientDiagnosisService } from "@/apps/OPD/services/patient_diagnosis_service"
import { AETCReportService } from '@/apps/AETC/services/aetc_report_service';
import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';




const reportData = ref<any>([])
const startDate = ref('')
const endDate = ref('')
const period = ref('')
const isLoading = ref(false)
const csvQuarter = ref('')
const multipleDiagnosis = ref('')

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
            report.multipleDiagnosis = multipleDiagnosis.value

            try {
                const rawReport = (await report.getClinicReport("diagnosis_specific_report"))
                reportData.value = rawReport;
            }catch (e){
                console.log(e)
            }
         }

        const mapToOption = (listOptions: Array<string>): Array<Option> => {
            return listOptions.map((item: any) => ({ label: item.name, value: item.name })) 
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
            'Address',
            'Total'
        ];

        //table headers and data mapping
        const columns: Array<v2ColumnInterface[]> = [
            [
                {
                    label: "Address",
                    ref: "data.address",
                    value: (data: any) => data.address
                },
                {
                    label: "Total",
                    ref: "data.patient_ids.length",
                    secondaryLabel: "Clients diagnosed with",
                    value: (data: any) => data.patient_ids.length,
                    tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                        `${column.secondaryLabel} ${data.address} `, data.patient_ids
                    )
                },
            ]
        ]

        /**
         * Loads a dialogue to allow users to configure start and end date
         */
         const configure = () => MultiStepPopupForm([
            {
                id: 'multiple_diagnosis',
                helpText: 'Select diagnosis',
                type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
                validation: (data: any) => Validation.required(data),
                options: async (_:any, filter='', page=1, limit=10) => mapToOption(
                    await PatientDiagnosisService.getDiagnosis(filter, page, limit)
                ),
                computedValue: (v: Option[]) => v.map(d => d.value),
                config: {
                    isFilterDataViaApi: true,
                    showKeyboard: true,
                }
            },
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
        ], 
        (f: any, c: any) => {
            startDate.value = c.start_date
            endDate.value = c.end_date
            //convert to passable string
            multipleDiagnosis.value = `[${c.multiple_diagnosis.map((option: any) => `"${option}"`).join(', ')}]`;

            console.log("Here we are", multipleDiagnosis.value)

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
