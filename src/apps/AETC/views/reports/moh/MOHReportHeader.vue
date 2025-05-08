<template>
  <div style="margin: auto; width: 95%; margin-top: 1%;">
    <report-table 
    :columns="columns"
    :rows="rows"
    :config="{tableCssTheme}">
    </report-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ReportTable from "@/components/DataViews/tables/ReportDataTable.vue"
import table, { ColumnInterface, RowInterface } from "@/components/DataViews/tables/ReportDataTable"

export default defineComponent({
    components: { ReportTable },
    props: {
      clinicName: {
        type: String,
        default: ''
      },
      reportparams: {
        type: Object,
        required: true
      },
      totalOPDVisits: {
        type: Number,
        required: true
      },
      reportName: {
        type: String,
        required: true
      },
      periodLabel: {
        type: String,
        required: true
      },
      periodDates: {
        type: String,
        required: true
      },
      rangeLabel: {
        type: String,
        required: true
      },
      range: {
        type: String,
        required: true
      },
    },
    data: function() {
      return {
        tableCssTheme: 'opd-report-theme',
        rows: [] as RowInterface[][],
        columns: [
            [
              table.thTxt(this.reportName, {
                colspan: 2,
                sortable: false,
                exportable: false 
              })
            ]
        ] as ColumnInterface[][],
      }
    },
    mounted() {
      this.initTable()
    },
    watch: {
       totalOPDVisits(newValue, oldValue) {
         this.initTable()
       }
    },
    methods: {
      initTable() {
        const rows: RowInterface[][] = []
        const tableHeaders = [
          {
            name: 'Country:',
            value: 'Malawi',
          },
          {
            name: 'Reporting Facility Name:',
            value: this.clinicName
          },
          {
            name: this.rangeLabel+':',
            value: this.range
          },
          {
            name: this.periodLabel+':',
            value: this.periodDates
          },
          {
            name: 'Total OPD Visits:',
            value: this.totalOPDVisits
          }

        ]
        tableHeaders.forEach(item => {
          if(item.name !== 'undefined:') {
                rows.push([
                    table.td(item.name, {style: {textAlign: 'left'}}),
                    table.td(item.value, {style: {textAlign: 'left'}}),
                ])
          }
        })
        this.rows = rows
      }
    }
  })
  </script>