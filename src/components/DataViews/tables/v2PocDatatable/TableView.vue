<template>
    <ion-header>
        <ion-toolbar>
            <ion-thumbnail v-if="iconUrl" slot="start">
                <ion-img :src="iconUrl"></ion-img>
            </ion-thumbnail>
            <ion-title slot="start" class="his-md-text">
                {{ title }} 
                <br v-if="subtitle"/>
                <span class="his-sm-text">{{subtitle}}</span>
            </ion-title>
            <ion-buttons slot="end">
                <ion-button v-if="typeof onConfigure === 'function'"
                    @click="() => onConfigure ? onConfigure() : null">
                    <ion-icon size="large" :icon="funnelOutline"></ion-icon>
                </ion-button>
                <ion-chip
                    v-if="searchTerm"
                    @click="() => { searchTerm = ''; showSearchKeyboard = false}" 
                    class="his-md-text"
                    color="primary">
                    <ion-label>{{ searchTerm ? `Search: ${searchTerm}` : '' }}</ion-label>
                    <ion-icon :icon="close"></ion-icon>
                </ion-chip>
                <ion-button 
                    :color="showSearchKeyboard ? 'primary' : 'dark'"
                    @click="() => showSearchKeyboard = showSearchKeyboard ? false : true" 
                    size="large">
                    <ion-icon size="large" :icon="search"></ion-icon>
                </ion-button>
                <ion-button
                    v-if="typeof onRefresh === 'function'" 
                    @click="() => onRefresh ? onRefresh() : null"
                    color="success" size="large">
                    <ion-icon size="large" :icon="sync"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
        <ion-toolbar color="light" v-if="(headerBadge||[]).length">
            <ion-chip 
                @click="typeof badge.action === 'function' ? badge.action() : null"  
                v-for="(badge, index) in headerBadge" :key="index" 
                :color="badge?.color||'dark'">
                <ion-icon :icon="badge?.icon||search"></ion-icon>
                <ion-label v-html="badge!.text"/>
            </ion-chip>
        </ion-toolbar>
    </ion-header>
    <ion-content scroll-y scroll-x>
        <table style="width: 100%">
            <thead class="stick-report-header">
                <tr v-for="(column, index) in columns" :key="index">
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
                            <ion-label>
                                <b>{{ item.label }}</b>
                            </ion-label>
                        </ion-item>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(data, i) in page" :key="i">
                    <td v-for="(info, k) in data.row" :key="k"
                        @click="() => onClickTablecell(info)"
                        :class="{
                            'clickable-cell': info?.column?.tdClick
                        }"
                        >
                        <span v-html="info.value" class="his-sm-text">
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </ion-content>
    <ion-footer>
        <his-keyboard
            v-if="showSearchKeyboard" 
            :kbConfig="QWERTY" 
            :onKeyPress="filterTable"
        />
        <ion-toolbar color="dark">
            <ion-button @click="toCSV()" size="large">
                CSV
            </ion-button>
            <ion-button @click="toPDF()" size="large">
                PDF
            </ion-button>
            <ion-button v-if="totalPages > 1" @click="first" :disabled="currentPage === 0 || totalPages <= 2" size="large" slot="end">
                First
            </ion-button>
            <ion-button v-if="totalPages > 1" @click="prev" :disabled="!canPrev" color="light" size="large" slot="end">
                Prev
            </ion-button>
            <ion-button v-if="totalPages > 1" @click="selectPage" size="large" slot="end" color="light">
                {{ currentPage }} / {{ totalPages - 1 }}
            </ion-button>
            <ion-button v-if="totalPages > 1" @click="next" :disabled="!canNext" color="light" size="large" slot="end">
                Next
            </ion-button>
            <ion-button v-if="totalPages > 1" @click="last" :disabled="currentPage+1 >= totalPages || totalPages <= 2" size="large" slot="end">
                Last
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
  IonImg,
  IonIcon,
  IonItem,
  IonTitle,
  IonChip,
  IonToolbar,
  IonHeader,
  IonButton,
  IonFooter,
  IonContent,
  IonButtons,
  IonThumbnail
} from "@ionic/vue"
import { 
    sync,
    search, 
    close, 
    arrowUp, 
    arrowDown, 
    funnelOutline,
} from "ionicons/icons"
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { chunk, isEmpty } from "lodash";
import { sort } from "fast-sort";
import { numericKeypad } from "@/utils/PopupKeyboard";
import Fuse from "fuse.js"
import { v2ColumnDataInterface, v2ColumnInterface, v2TableBadge } from "./types";
import { toCsv, toTablePDF } from "@/utils/Export"
import { Service } from "@/services/service";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { removeNonDateCharacters, removeTags } from "@/utils/Strs";
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import { infoActionSheet } from "@/utils/ActionSheets";

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
        IonChip,
        HisKeyboard,
        IonThumbnail,
        IonImg
    },
    props: {
        title: {
            type: String,
            default: 'Report'
        },
        headerBadge: {
            type: Object as PropType<Array<v2TableBadge>>
        },
        iconUrl: {
            type: String
        },
        subtitle: {
            type: String,
        },
        columns: {
            type: Object as PropType<Array<v2ColumnInterface[]>>,
            required: true
        },
        columnData: {
            type: Array,
            default: () => []
        },
        enablePagination: {
            type: Boolean,
            default: true
        },
        rowsPerPage: {
            type: Number,
            default: 10
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
        reportPrefix: {
            type: String,
            default: ""
        },
        defaultSortedColumn: {
            type: String
        },
        defaultSortOrder: {
            type: String as PropType<"desc"|"asc">,
            default: "desc"
        }
    },
    setup(props) {
        const route = useRouter()
        const reportData = ref<any>([])
        const currentPage = ref<number>(0)
        const searchTerm = ref<string>('')
        const columnSorted = ref<string>('')
        const sortOrder = ref<'asc'|'desc'>('desc')
        const showSearchKeyboard = ref(false)

        /**
         * This computed object exist to allow for transformation
         * of "reportData" without mutations when doing
         * things like search or sorting... 
         */
        const pageComputedReportData = computed(() => {
            /**
             * Data transformations for table happen here. i.e. searching or sorting
            */
            let tableData = reportData.value
            if (sortOrder.value && columnSorted.value) {
                tableData = sort(reportData.value)[sortOrder.value]((d: any) => d.sortData[columnSorted.value])
            }
            if (searchTerm.value) {
                const fuse = new Fuse(tableData, {
                    threshold: 0.3,
                    keys: ['searchIndex'],
                    useExtendedSearch: true
                })
                return fuse.search(searchTerm.value, { limit: props.rowsPerPage }).map((i: any) => i.item)
            }
            return tableData
        })

        const totalPages = computed(() => chunk(pageComputedReportData.value, props.rowsPerPage).length)

        const canNext = computed(() => currentPage.value + 2 <= totalPages.value)

        const canPrev = computed(() => currentPage.value > 0)
        /**
         * returns current page data based on page index
         */
        const page = computed(() => {
            /**
             * Paginated data that ends up on the template.
             */
            const paginated = chunk(pageComputedReportData.value, props.rowsPerPage)
            return paginated[currentPage.value] as any
        })

        const sortColumn = (column: string) => {
            columnSorted.value = column
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        }
        /**
         * Launches numeric input to allow the user to skip to any page
         */
        const selectPage = () => numericKeypad((v: string) => {
            const num = parseInt(v)
            if (parseInt(v) <= totalPages.value) currentPage.value = num
        }, { title: 'Select page'})
        

        /**
         * Reset current page to initial
         */
        const first = () => currentPage.value = 0
        /**
         * Goes to the last page
         */
        const last = () => currentPage.value = (totalPages.value -1) || 0
        /**
         * Go to next page relative to the current page
         */
        const next = () => currentPage.value += 1
        /**
         * Go to previous page relateive to the current page
         */
        const prev = () => currentPage.value -= 1

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
        const onClickTablecell = (cell: any) => {
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

        
        /**
         * Check if the current table has encrypted fields
        */
        const hasEncryptedColumns = () => getExpandedColumns().some((column: v2ColumnInterface) => column?.encrypted)

        /**
         * Defines export object
         */ 
        const prepExportObj = (format: 'pdf' | 'csv', skipEncryptedFields=false) => {
            const exportableColumns = getExpandedColumns().filter((column: v2ColumnInterface) => {
                return [
                    // Validate if encrypted fields are not flagged as skippable
                    format === 'pdf' && typeof column.encrypted === 'boolean' 
                        ? column?.encrypted && !skipEncryptedFields 
                        : true,
                    // Ignore encrypted fields for CSV export..
                    format === 'csv' ? !column?.encrypted : true,
                    column.canExport ? column?.canExport[format]: true,
                    typeof column.exportable === 'boolean' ? column.exportable: true
                ].every(Boolean)
            })
            // Generates string headers. The final value will be determined by configuration of column
            const headers = exportableColumns.map((column: v2ColumnInterface) => {
                return column.exportedValue && column.exportedValue.column 
                    ? column.exportedValue.column(column)  
                    : column.secondaryLabel || column.label
            })
            
            /**
             * Exported rows are based on exportable columns
             */
            const columnRefs = exportableColumns.map((column: v2ColumnInterface) => column.ref)
            const rows = reportData.value.reduce((allRows: any, data: any) => {
                const row = data.row.filter(({column}: v2ColumnDataInterface) => {
                    return columnRefs.includes(column.ref)
                }).map((data: v2ColumnDataInterface) => {
                    // Final value will be determined by optional configuration or static value
                    return data.column.exportedValue && data.column.exportedValue.dataValue
                        ? data.column.exportedValue.dataValue(data)
                        : data.value
                })
                return [...allRows, row]
            }, [])

            const filename = `${props.reportPrefix} ${Service.getLocationName() ?? ""} ${removeTags(props.title).replace(props.reportPrefix, "")} ${removeNonDateCharacters(props.csvQuarter ?? props.subtitle ?? "")}`

            return {
                headers,
                rows,
                filename
            }
        }
        
        const toPDF = async () => {
            let encryption = undefined
            if (hasEncryptedColumns()) {
                const option = await infoActionSheet(
                    'Security warning',
                    'PDF may contain private data that will require a password to unlock',
                    'To access private data choose Secure PDF over Regular PDF',
                    [
                        { 
                            name: "Secure PDF",
                            slot: "start",
                            color: "success"
                        },
                        {
                            name: "Regular PDF",
                            slot: "start",
                            color: "success"
                        }
                    ], 'his-danger-color'
                )
                if (option === 'Secure PDF') {
                    const password = Service.getUserName()
                    encryption = {
                        encryption: {
                            userPassword: password,
                            ownerPassword: password,
                            userPermissions: ["print"]
                        }
                    }
                }
            }
            const { headers, rows, filename } = prepExportObj('pdf', encryption ? false : true)
            toTablePDF([headers], rows, filename, true, encryption)
        }

        const toCSV = () => {
            const { headers, rows, filename } = prepExportObj('csv')
            toCsv(
                [headers],
                [
                    ...rows,
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

        const filterTable = (text: string) => {
            searchTerm.value = handleVirtualInput(text, searchTerm.value)
            currentPage.value = 0
        }

        /**
         * Create a table header and cell mapping
         * @param data 
         */
        const mapcolumnValues = (data: any) => {
            data.forEach((record: any)=> {
                const sortData = {...record}
                const row = getExpandedColumns().map((column: v2ColumnInterface) => {
                    let value = ''
                    const refData = record[column.ref]
                    try {
                        if (isEmpty(record)) {
                            value = ""
                        } else if (typeof column.toValue === 'function') {
                            value = `${column.toValue(refData)}`
                        } else if (typeof column.value === 'function') {
                            value = column.value(record) as string
                        } else {
                            // Use the ref to map to a value inside the record
                            value = record[column.ref] || ''
                        }
                    } catch (e) {
                        value = column?.defaultValue ?? '_ERROR_'
                    }
                    sortData[column.ref] = value
                    if (typeof column.sortValue === 'function') {
                        sortData[column.ref] = column.sortValue(refData)
                    }
                    return {
                        column,
                        refData,
                        value,
                        data: record
                    }
                })
                reportData.value.push({ 
                    row, 
                    data: record, 
                    sortData,
                    searchIndex: [...row, row.map((d: any) => d.value).join(' ')]
                })
            })
        }

        /**
         * Initiates generation of table data through column data prop
         */
        watch(() => props.columnData, (data) => {
            reportData.value = [];
            if (!Array.isArray(data) || !data.length) {
                currentPage.value = 0
                searchTerm.value = ''
                columnSorted.value = props.defaultSortedColumn??""
                sortOrder.value = props.defaultSortOrder
                mapcolumnValues(Array.from({length: 0}).map(() => ({})))
                return
            }
            mapcolumnValues(data)
        }, { immediate: true, deep: true })

        return {
            first,
            last,
            next,
            prev,
            selectPage,
            sortColumn,
            onClickTablecell,
            toPDF,
            toCSV,
            finish,
            filterTable,
            sync, 
            search, 
            close, 
            arrowUp, 
            arrowDown, 
            funnelOutline,
            page,
            canNext,
            searchTerm,
            totalPages,
            sortOrder,
            canPrev,
            currentPage,
            columnSorted,
            QWERTY,
            showSearchKeyboard
        }
    }
})
</script>
<style scoped>
    th, td {
        border-collapse: collapse;
        min-width: 160px;
        border: 1px solid rgb(158, 158, 158);
    }
    td {
        font-weight: 500;
        font-size: .8em;
        padding: 0.4em;
    }
    .stick-report-header {
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    tr:nth-child(even) {
        background-color: #f0f0f0;
    }
    .clickable-cell {
        color: #0645AD;
    }
    .his-floating-keyboard {
        bottom: 70px!important;
    }
</style>