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
                    <tr v-for="(column, index) in columnsMinusOne" :key="index">
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
                    <tr>
                        <td :colspan="7">
                            <span class="his-sm-text">
                                {{ columns[4][0].label }}
                            </span>
                        </td>
                    </tr>
                    <tr v-for="(data, i) in sectionOne" :key="i">
                        <td v-for="(info, k) in data.row || []" :key="k"
                            @click="() => onClickTablecell(info)"
                            :class="{
                                'clickable-cell': info?.column?.tdClick
                            }"
                            >
                            <b class="his-sm-text">
                                {{ info.value }}
                            </b>
                        </td>
                    </tr>
                    <!-- {{ sectionOne }} -->
                    <tr>
                        <td :colspan="7">
                            <span class="his-sm-text">
                                {{ columns[5][0].label }}
                            </span>
                        </td>
                    </tr>
                    <tr v-for="(data, i) in sectionTwo" :key="i">
                        <td v-for="(info, k) in data.row" :key="k"
                            @click="() => onClickTablecell(info)"
                            :class="{
                                'clickable-cell': info?.column?.tdClick
                            }"
                            >
                            <span class="his-sm-text">
                                {{ info.value }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td :colspan="7">
                            <span class="his-sm-text">
                                {{ columns[6][0].label }}
                            </span>
                        </td>
                    </tr>
                    <tr v-for="(data, i) in sectionThree" :key="i">
                        <td v-for="(info, k) in data.row" :key="k"
                            @click="() => onClickTablecell(info)"
                            :class="{
                                'clickable-cell': info?.column?.tdClick
                            }"
                            >
                            <span class="his-sm-text">
                                {{ info.value }}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td :colspan="7">
                            <span class="his-sm-text">
                                {{ columns[7][0].label }}
                            </span>
                        </td>
                    </tr>
                    <tr v-for="(data, i) in sectionTotals" :key="i">
                        <template v-for="(info, k) in data.row" :key="k"
                            @click="() => onClickTablecell(info)"
                            :class="{
                                'clickable-cell': info?.column?.tdClick
                            }"
                            >
                            <td colspan="2">
                                <span class="his-sm-text">
                                    {{ info.column.label }}
                                </span>
                            </td>
                            <td colspan="6">
                                <span class="his-sm-text"
                                    @click="() => onClickTablecell(info)"
                                    :class="{
                                        'clickable-cell': info?.column?.tdClick
                                 }">
                                    {{ info.value }}
                                </span>
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
            type: Array as PropType<Array<any>>,
            default: () => []
        },
        order: {
            type: Array as PropType<Array<any>>,
            default: () => []
        },
        csvSpacing: {
            type: Number
        },
        csvSubHeader: {
            type: Array as PropType<Array<Array<any>>>,
            default: () => []
        }
    },
    setup(props) {
        const route = useRouter()
        const reportData = ref<any>([])
        const columnSorted = ref<string>('')
        const sortOrder = ref<'asc'|'desc'>('desc')
        const columnsMinusOne = computed(() => props.columns.slice(0, 2))

        const sectionOne = computed(() => {
            /**
             * Used to retrieve element of the array (1st time scfeened)
             */
            
            const temp: Array<any> = [] 
            props.columnData[0]?.forEach((record: any)=> {
                    const row = props.columns[1].map((column: v2ColumnInterface) => {
                        let value = ''
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
                        return {
                            column,
                            data: record,
                            value: value,
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


        const sectionTwo = computed(() => {
            /**
             * Used to retrieve element of the array (1st time scfeened)
             */
             const temp: Array<any> = [] 
            props.columnData[1]?.forEach((record: any)=> {
                    const row = props.columns[2].map((column: v2ColumnInterface) => {
                        let value = ''
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
                        return {
                            column,
                            data: record,
                            value: value,
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
        const sectionThree = computed(() => {
            /**
             * Used to retrieve element of the array (1st time scfeened)
             */
            const temp: Array<any> = [] 
            props.columnData[2]?.forEach((record: any)=> {
                    const row = props.columns[3].map((column: v2ColumnInterface) => {
                        let value = ''
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
                        return {
                            column,
                            data: record,
                            value: value,
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

        const sectionTotals = computed(() => {
            /**
             * Used to retrieve element of the array (1st time scfeened)
             */
            const temp: Array<any> = [] 
            props.columnData[3]?.forEach((record: any, i: number)=> {
                const row = props.columns[8 + i].map((column: v2ColumnInterface) => {
                        let value = ''
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
                        return {
                            column,
                            data: record,
                            value: value,
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
                            text-align: center;
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
            const convertDataToIntegerArray = (data: any[]) => {
        

                const result = data.map((subList: any[]) => {
                    return subList
                        .map((obj: { [key: string]: any }) => {
                            return props.order.map(key => {
                                const value = obj[key as unknown as keyof typeof obj];
                                if (Array.isArray(value)) {
                                    return value.length;
                                }
                                return value;
                            }).filter((value) => value !== undefined);
                        })
                        .filter((arr) => arr.length > 0);
                }).filter((subList) => subList.length > 0);

                return result;
            };

            const convertTotalToArray = (totals: any[]): any => {
                return totals.map((totalObj) => {
                    const [key] = Object.keys(totalObj);
                    const value = totalObj[key];
                    const count = Array.isArray(value) ? value.length : 0;
                    const tuple = [key, count];
                    for (let i = 0; i < 5; i++) {
                    tuple.push("");
                    }
                    return tuple;
                });
            };



            const convertedData = convertDataToIntegerArray(props.columnData)
            const convertedTotals = convertTotalToArray(props.columnData[3])
            const rows = convertedData.flat(); 
            
            convertedTotals.forEach((tuple: any) => {
                rows.push(tuple)
            });

            const filename = `${Service.getLocationName()||'Unknown site'}-${props.title}-${props.subtitle}-${Service.getSessionDate()}`

            const addSubHeaders = () => {
                const modifiedArray = [...rows]; // Create a copy of the existing array

                const subHeaderRows = [0, 9, 18, 27]; // Rows where subheaders should be inserted
                const subHeadersLength = props.csvSubHeader.length;

                subHeaderRows.forEach((rowIndex, index) => {
                    const subHeaderRow = props.csvSubHeader[index % subHeadersLength];

                    // Insert subheader row at the specified index
                    modifiedArray.splice(rowIndex, 0, [...subHeaderRow]);
                });

                return modifiedArray;
            };

            toCsv(
                [props.headers],
                [
                    ...addSubHeaders(),
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
                    return {
                        column,
                        data: record,
                        value: value,
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
            columnsMinusOne,
            sync, 
            search, 
            close, 
            arrowUp, 
            arrowDown, 
            document,
            calendar,
            sortOrder,
            sectionOne,
            sectionTwo,
            sectionThree,
            sectionTotals,
            columnSorted
        }
    }
})
</script>
<style scoped>
    th, td {
        width: 4%;
        border-collapse: collapse;
        text-align: center;
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