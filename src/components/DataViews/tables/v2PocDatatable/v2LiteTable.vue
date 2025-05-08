<template>
    <div>
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
                    <td v-for="(info, k) in data.row" 
                        :key="k"
                        @click="() => onClickTablecell(info)"
                        :class="{ 'clickable-cell': info?.column?.tdClick}">
                        <span v-html="info.value" class="his-sm-text"/>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <p></p>
    <ion-footer>
        <ion-toolbar color="light">
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
        </ion-toolbar>
    </ion-footer>
</template>
<script lang="ts">
import {
  IonLabel,
  IonIcon,
  IonItem,
  IonToolbar,
  IonButton,
  IonFooter,
} from "@ionic/vue"
import { 
    arrowUp, 
    arrowDown
} from "ionicons/icons"
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { chunk, isEmpty } from "lodash";
import { sort } from "fast-sort";
import { numericKeypad } from "@/utils/PopupKeyboard";
import { v2ColumnInterface } from "./types";

export default defineComponent({
    components: {
        IonToolbar,
        IonItem,
        IonIcon,
        IonLabel,
        IonButton,
        IonFooter,
    },
    props: {
        columns: {
            type: Object as PropType<Array<v2ColumnInterface[]>>,
            required: true
        },
        columnData: {
            type: Array,
            default: () => []
        },
        rowsPerPage: {
            type: Number,
            default: 10
        },
        defaultSortedColumn: {
            type: String
        },
        defaultSortOrder: {
            type: Object as PropType<"desc"|"asc">,
        }
    },
    setup(props) {
        const reportData = ref<any>([])
        const currentPage = ref<number>(0)
        const columnSorted = ref<string>('')
        const sortOrder = ref<'asc'|'desc'>('desc')
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
                        value = column?.defaultValue || '_ERROR_'
                        console.error(e)
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
                columnSorted.value = props.defaultSortedColumn??""
                sortOrder.value = props.defaultSortOrder || 'desc'
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
            close,
            arrowUp,
            arrowDown,
            page,
            canNext,
            totalPages,
            sortOrder,
            canPrev,
            currentPage,
            columnSorted
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