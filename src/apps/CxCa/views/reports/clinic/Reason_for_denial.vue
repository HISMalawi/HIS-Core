<template>
    <ion-page>
          <ion-loading :is-open="isLoading" message="Please wait..."/>
          <v2Datatable
              title="Reasons for not screened"
              :subtitle="period"
              :columns="columns"
              :columnData="reportData"
              :rowsPerPage="25"
              :onConfigure="configure"
              :csvQuarter="csvQuarter"
              :headers="csvheaders"
              :onRefresh="generate"
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
  import { CxCaReportService } from '@/apps/CxCa/services/reports/cxca_report_service'
  import DrillPatientIds from '../../../../../components/DrillPatientIds.vue';
  
  
  
  
  const reportData = ref<any>([])
  const startDate = ref('')
  const endDate = ref('')
  const period = ref('')
  const isLoading = ref(false)
  const csvQuarter = ref('')
  
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
              const report = new CxCaReportService()
              report.startDate = startDate.value
              report.endDate = endDate.value
              // waiting for the endpoint  
              try {
                const rawReport = (await report.getClinicReport("REASON FOR NOT SCREENING REPORT"))
                // mapping the response object to the desired template structure
                const newObject = transformToObjectArray(rawReport)
                reportData.value = newObject;
                }catch (e){
                    console.log(e)
                }
           }

           const transformToObjectArray = (originalObject: any) => {
            return Object.keys(originalObject).map((reason) => ({
                reason,
                patients: originalObject[reason],
            }));
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
              'Reason',
              'Total'
          ];
  
          //table headers and data mapping
          const columns: Array<v2ColumnInterface[]> = [
              [
                  {
                      label: "Reason",
                      ref: "data.reason",
                      value: (data: any) => data.reason
                  },
                  {
                      label: "Total",
                      ref: "data.patients.length",
                      secondaryLabel: "Clients diagnosed with",
                      value: (data: any) => data.patients.length,
                      tdClick: ({ column, data }: v2ColumnDataInterface) => drilldown(
                          `${column.secondaryLabel} ${data.reason} `, data.patients
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
          ], 
          (f: any, c: any) => {
              startDate.value = c.start_date
              endDate.value = c.end_date
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