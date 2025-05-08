<template>
  <div class="my-table" style="margin: auto; width: 95%; margin-top: 3%; margin-bottom: 3%;">
    <report-table 
    :columns="columns"
    :rows="rows"
    :config="{tableCssTheme}">
    </report-table>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { defineComponent } from 'vue'
import { IDSRReportService } from "@/apps/OPD/services/idsr_service"
import { Service } from "@/services/service"
import dayjs from 'dayjs';
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
  components: { ReportTable },
  data: function(){
    return {
      conditions: [] as any,
      lessThanFiveYears: " < 5 yrs ",
      greaterAndEqualFiveYears: " >= 5 yrs ",
      total: ' Total ',
      tableCssTheme: 'opd-report-theme',
      rows: [] as RowInterface[][],
      columns: [
      [
        table.thTxt('', {
          colspan: 2,
          sortable: false,
          exportable: false 
        }),
        table.thTxt('Out-patient Cases', {
          colspan: 3,
          sortable: false,
          exportable: false 
        }),
      ],
      [
        table.thTxt(''),
        table.thTxt('Diseases/Events/Conditions'),
        table.thTxt('< 5 yrs'),
        table.thTxt('>= 5 yrs'),
        table.thTxt('Total'),
      ]
    ] as ColumnInterface[][],
    }
  },
  props: ['params', 'epiweek', 'quarter','onDrillDown'],
  methods: {
   renderResults() {
     const report = new IDSRReportService()
     const Conditions = report.renderResults(this.params)
     if(Conditions.length){
      this.conditions = Conditions
      this.rows = this.buildRows(Conditions)
     }
   },
   onDownload() {
     const report = new IDSRReportService()
     let {CSVString} = report.getCSVString(this.conditions)
     CSVString += `
          Date Created: ${dayjs().format('DD/MMM/YYYY HH:MM:ss')}
          His-Core Version: ${Service.getCoreVersion()}
          API Version: ${Service.getApiVersion()}
          Report Period: ${this.epiweek}
          Site: ${Service.getLocationName()}
          Site UUID: ${Service.getSiteUUID()}`
          ;
      const csvData = new Blob([CSVString], { type: "text/csv;charset=utf-8;" });
      //IE11 & Edge
      const reportTitle = `${Service.getLocationName()} Weekly IDSR report ${this.quarter}`;
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(csvData, 'exportFilename');
      } else {
        //In FF link must be added to DOM to be clicked
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(csvData);
        link.setAttribute("download", `${reportTitle}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
   },
   buildRows(data: any): RowInterface[][] {
     const rows: RowInterface[][] = []
     data.forEach((condition: { 
       id: number;
       name: string;
       lessThanFiveYears: number;
       greaterThanEqualFiveYears: number;
       total: number;
       lessThanFiveYearsPatientIds: any;
       greaterThanEqualFiveYearsPatientIds: any;
       totalPatientIds: any;
       }) => {
        rows.push([
          table.td(condition.id, {style: {textAlign: 'left'}}),
          table.td(condition.name, {style: {textAlign: 'left'}}),
          this.buildRow(this.lessThanFiveYears+'('+condition.name+')', condition.lessThanFiveYears, condition.lessThanFiveYearsPatientIds),
          this.buildRow(this.greaterAndEqualFiveYears+'('+condition.name+')', condition.greaterThanEqualFiveYears, condition.greaterThanEqualFiveYearsPatientIds),
          this.buildRow(this.total+'('+condition.name+')', condition.total, condition.totalPatientIds)
        ])
     })
     return rows
   },
   buildRow(name: string, count: any, patientIds: any) {
    if (typeof(count) == 'string') {
      return table.td('')
    }
    if (!(count > 0)) {
      return table.td(0)
     } else {
      return table.tdLink(
      count,
      async () =>  this.onDrillDown(name, patientIds)
      )
     }
   }
  },
  watch: {
    params: {
      immediate: true,
      handler() {
        this.renderResults();
      }
    }
  }
})
</script>
