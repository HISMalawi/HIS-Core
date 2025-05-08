<template>
    <ion-header>
        <ion-toolbar>
            <ion-title class="his-md-text">
                {{ title }} 
                    <br v-if="subtitle"/>
                    <span class="his-sm-text">{{subtitle}}</span>
            </ion-title>
            <ion-buttons slot="end">
                <ion-button v-if="typeof onConfigure === 'function'"
                    @click="onConfigure">
                    <ion-icon size="large" :icon="calendar"></ion-icon>
                </ion-button>
                <ion-button 
                    v-if="typeof onRefresh === 'function'" 
                    @click="onRefresh"
                    color="success" size="large">
                    <ion-icon size="large" :icon="sync"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content scroll-y scroll-x>
        <div id="report-content">
            <table class="art-report-theme">
                <thead class="stick-report-header">
                    <tr v-for="(column, index) in headerRow" :key="index">
                        <th v-for="(item, i) in column" 
                            :key="i"
                            :colspan="item?.span?.thColspan || 1"
                            :rowspan="item?.span?.thRowspan || 1"
                            @click="sortColumn(item.ref)">
                            <ion-item lines="none">
                                <ion-icon
                                    v-if="columnSorted && columnSorted === item.ref"
                                    :icon="sortOrder === 'asc' ? arrowUp : arrowDown">
                                </ion-icon>
                                <ion-label class="ion-text-center" v-if="index < columns.length - 1">
                                    <b>{{ item.label }}</b>
                                </ion-label>
                            </ion-item>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, i) in sectionOne" :key="i">
                        <!-- {{ data.row }} -->
                        <template v-for="(info, k) in data.row || []" :key="k">
                            <td v-if="info.value !='TH' "
                            @click="() => onClickTablecell(info)"
                            :class="{
                                'clickable-cell': info?.column?.tdClick
                            }"
                            :colspan="info.colSpan" 
                            >
                            <b :style="info.styling" class="his-sm-text">
                                {{ info.value }}
                            </b>
                        </td>
                        </template>
                    </tr>
                    
                </tbody>
            </table>
        </div>
    </ion-content>
    <ion-footer>
        <ion-toolbar color="dark">
            <ion-button @click="toCSV()" size="large">
                CSV
            </ion-button>
            <ion-button @click="toPDF()" size="large">
                PDF
            </ion-button>
            <ion-button @click="finish" color="success" size="large" slot="end">
                Finish
            </ion-button>
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts">
import {
  IonLabel,
  IonIcon,
  IonItem,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonButton,
  IonFooter,
  IonContent,
  IonButtons
} from "@ionic/vue"
import { 
    sync,
    search, 
    close, 
    arrowUp, 
    arrowDown, 
    document,
    calendar
} from "ionicons/icons"
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { isEmpty } from "lodash";
import { v2ColumnDataInterface, v2ColumnInterface } from "@/components/DataViews/tables/v2PocDatatable/types";
import { toCsv, toPDFfromHTML } from "@/utils/Export"
import { Service } from "@/services/service";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

export default defineComponent({
    components: {
        IonToolbar,
        IonItem,
        IonIcon,
        IonLabel,
        IonTitle,
        IonHeader,
        IonButton,
        IonFooter,
        IonContent,
        IonButtons,
    },
    props: {
        title: {
            type: String,
            default: 'Report'
        },
        subtitle: {
            type: String,
        },
        columns: {
            type: Object as PropType<Array<v2ColumnInterface[]>>,
            required: true
        },
        columnData: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        },
        onFinish: {
            type: Function
        },
        onRefresh: {
            type: Function
        },
        onConfigure: {
            type: Function
        },
        csvQuarter: {
            type: String
        },
        headers: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        },
        order: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        },
        csvSpacing: {
            type: Number
        },
        csvSubHeader: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        },
        csvData: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        },
    },
    setup(props) {
        const route = useRouter()
        const reportData = ref<any>([])
        const columnSorted = ref<string>('')
        const sortOrder = ref<'asc'|'desc'>('desc')
        const headerRow = computed(() => props.columns.slice(0, 1))



        const sectionOne = computed(() => {
            /**
             * Used to retrieve element of the array (1st time scfeened)
             */

            const temp: Array<any> = [] 
            props.columnData?.forEach((record: any)=> {
                    const row = props.columns[1].map((column: v2ColumnInterface) => {
                        let value = ''
                        let styling = {}
                        let colSpan = 1
                        try {
                            if (isEmpty(record)) {
                                value = "..."
                            }else if (typeof column.value === 'function') {
                                value = column.value(record) as string
                            } else {
                                // Use the ref to map to a value inside the record
                                value = record[column.ref] || ''
                            }
                        } catch (e) {
                            value = '_ERROR_'
                            console.error(e)
                        }
                        if (typeof column.dataStyle === 'function') {
                            styling = column.dataStyle(record)
                        }

                        if (typeof column.colSpan === 'function') {
                            colSpan = column.colSpan(record)
                        }
                        return {
                            column,
                            data: record,
                            value: value,
                            styling,
                            colSpan,
                            [column.ref || 'nada']: value
                        }
                    })
                    
                    temp.push({ 
                        row, 
                        data: record, 
                        searchIndex: [...row, row.map((d: any) => d.value).join(' ')]
                    })
                })
            return temp
        })

        const sortColumn = (column: string) => {
            columnSorted.value = column
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        }
    
        const finish = () => {
            if (typeof props.onFinish === 'function') {
                props.onFinish()
            } else {
                route.push('/')
            }
        }

        /**
         * Event handler when TD on HTML report is clicked
         * @param cell 
         */
        const onClickTablecell = (cell: v2ColumnDataInterface) => {
            try {
                if (typeof cell.column?.tdClick === 'function') {
                    cell.column?.tdClick(cell)
                }   
                return
            } catch (e) {
                console.error(e)
            }
        }

        const getExpandedColumns = () => props.columns.reduce((a: any, c: v2ColumnInterface[]) => a.concat(c), [])
            .filter((col: v2ColumnInterface) => col.value || col.ref)
        
        const toPDF = () => {
            const html: any = window?.document?.getElementById("report-content")
            toPDFfromHTML(`
                <html>
                    <head> 
                        <style> 
                        table {
                            border-collapse: collapse;
                        }
                        th, td {
                            width: 4%;
                            text-align: left;
                            border: solid 1px black;
                        }
                        td {
                            border-bottom: 1px solid rgb(165, 165, 165);
                            padding: 0.6em;
                            font-weight: 500;
                            font-size: .8em;
                        }
                        </style>    
                    </head>
                <body> 
                 ${html.innerHTML}    
                </body>
                </html>
            `)
        }

        const toCSV = () => {
            const filename = `${Service.getLocationName()||'Unknown site'}-${props.title}-${props.subtitle}-${Service.getSessionDate()}`
            toCsv(
                [props.headers],
                [
                    ...props.csvData,
                    [`Date Created: ${dayjs().format('DD/MMM/YYYY HH:MM:ss')}`],
                    [`Quarter: ${props.csvQuarter || props.subtitle}`],
                    [`HIS-Core Version: ${Service.getCoreVersion()}`],
                    [`API Version: ${Service.getApiVersion()}`],
                    [`Site UUID: ${Service.getSiteUUID()}`],
                    [`Generated by: ${Service.getUserName()}`]
                ],
                filename
            )
        }

        /**
         * Create a table header and cell mapping
         * @param data 
         */
        const mapcolumnValues = (data: any) => {
            data.forEach((record: any)=> {
                const row = getExpandedColumns().map((column: v2ColumnInterface) => {
                    let value = ''
                    let styling = {}
                    let colSpan = 1
                    try {
                        if (isEmpty(record)) {
                            value = "..."
                        }else if (typeof column.value === 'function') {
                            value = column.value(record) as string
                        } else {
                            // Use the ref to map to a value inside the record
                            value = record[column.ref] || ''
                        }
                    } catch (e) {
                        value = '_ERROR_'
                        console.error(e)
                    }

                    if (typeof column.dataStyle === 'function') {
                        styling = column.dataStyle(record)
                    }

                    if (typeof column.colSpan === 'function') {
                        colSpan = column.colSpan(record)
                    }
                    return {
                        column,
                        data: record,
                        value: value,
                        styling,
                        colSpan,
                        [column.ref || 'nada']: value
                    }
                })
                reportData.value.push({ 
                    row, 
                    data: record, 
                    searchIndex: [...row, row.map((d: any) => d.value).join(' ')]
                })
            })
        }

        /**
         * Initiates generation of table data through column data prop
         */
        watch(() => props.columnData, (data) => {
            reportData.value = [];
            if (Array.isArray(data)) {
                mapcolumnValues(data)
            }
        }, { immediate: true, deep: true })

        return {
            sortColumn,
            onClickTablecell,
            toPDF,
            toCSV,
            finish,
            headerRow,
            sync, 
            search, 
            close, 
            arrowUp, 
            arrowDown, 
            document,
            calendar,
            sortOrder,
            sectionOne,
            columnSorted
        }
    }
})
</script>
<style scoped>
    th, td {
        width: 4%;
        border-collapse: collapse;
        text-align: left;
    }
    td {
        border-bottom: 1px solid rgb(165, 165, 165);
        padding: 0.6em;
        font-weight: 500;
        font-size: .8em;
    }
    .stick-report-header {
        background: white;
        border-bottom: 2px solid #ccc;
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    tr:nth-child(even) {
        background-color: #f0f0f0;
    }
    .clickable-cell {
        color: #0645AD;
        font-weight: 600;
        font-size: 1em;
    }
</style>