<template>
    <table class="report-table" :class="config.tableCssTheme || ''">
        <thead class='stick-report-header' v-if="tableColumns">
            <tr v-for="(columns, colIndex) in tableColumns" :key="colIndex">
                <th v-for="(column, columnIndex) in columns" 
                    :key="columnIndex"
                    :colspan="column.colspan || 0"
                    @click="sort(columnIndex, column)"
                    :style="column.style" 
                    :class="column.cssClass">
                    {{column.th}}
                    <ion-icon
                        v-if="sortedIndex === columnIndex && column.sortable && colIndex+1 === tableColumns.length"
                        :icon="sortOrder==='ascSort' ? arrowUp : arrowDown"
                    ></ion-icon>
                </th>
            </tr>
        </thead>
        <!-- Skeleton Rows -->
        <tbody v-if="isLoading"> 
            <tr v-for="(skeletonRow, skeletonIndex) in skeletonRows" :key="skeletonIndex">
                <td :colspan="columnLength">
                    <ion-skeleton-text animated style="width: 100%; height: 30px;"></ion-skeleton-text>
                </td>
            </tr>
        </tbody>
        <!-- End skeleton rows --->
        <tbody v-if="!noData">
            <tr v-for="(row, rowIndex) in activeRows" :key="rowIndex">
                <td v-for="(item, itemIndex) in row" :key="itemIndex"
                    :colspan="item.colspan || 0"
                    :class="item.cssClass" 
                    :style="item.style"
                    > 
                    <div v-if="item.event"> 
                        <a href="#" class="his-sm-text" :style="item.style" :class="item.cssClass"
                            v-if="item?.event?.obj === 'link'"
                            @click.prevent="item.event.click()">
                            {{ item.td }}
                        </a>
                        <ion-button
                            :color="item?.event?.color || ''"
                            :class="item.cssClass"
                            :style="item.style"
                            :disabled="item?.event?.disabled != undefined
                                ? item.event.disabled === true
                                : false"
                            v-if="item.event.obj === 'button'"
                            @click="item.event.click()">
                            {{ item.td }}
                        </ion-button>
                    </div>
                    <div v-else> 
                        <span class="his-sm-text" v-html="item.td"></span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    <h1 v-if="noData" class="no-data-section vertically-align"> 
        <span v-if="errorMessage"> 
            {{ errorMessage }}
        </span> 
        <span v-else> 
            No data available in table
        </span>
    </h1>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { arrowUp, arrowDown, caretBack, caretForward } from "ionicons/icons";
import table, { AsyncTableRowHandler, TableRowParser } from "@/components/DataViews/tables/ReportDataTable"
import { isEmpty } from "lodash";
import { chunk } from "lodash"
import { delayPromise } from "@/utils/Timers"
import { toastDanger } from "@/utils/Alerts";
import {
    ColumnInterface,
    RowInterface,
    TableInterface
} from "@/components/DataViews/tables/ReportDataTable"
import { 
    IonButton, 
    IonIcon, 
    IonSkeletonText,
} from "@ionic/vue"
export default defineComponent({
  emits: ['onActiveRows', 'onActiveColumns', 'onPagination', 'onIsLoading', 'onTableRows'],
  components: {
    IonButton, 
    IonIcon, 
    IonSkeletonText
  },
  props: {
    config: {
        type: Object as PropType<TableInterface>,
        default: () => ({})
    },
    columns: {
      type: Array as PropType<Array<ColumnInterface[]>>,
      required: true
    },
    rows: {
      type: Array as PropType<Array<any[]>>,
      default: () => []
    },
    newPage: {
        type: Number
    },
    rowsPerPage: {
        type: Number
    },
    asyncRows: {
        type: Function as PropType<AsyncTableRowHandler>
    },
    asyncRowParser: {
        type: Function as PropType<TableRowParser>
    },
    rowParser: {
        type: Function as PropType<TableRowParser>
    },
    searchFilter: {
        type: String
    },
    showFilters: {
        type: Boolean,
        default: false
    },
    paginated: {
        type: Boolean,
        default: false
    },
  },
  data: () => ({
    arrowUp: arrowUp,
    arrowDown: arrowDown,
    caretBack, 
    caretForward,
    sortedIndex: -1 as number,
    sortOrder: 'descSort' as 'ascSort' | 'descSort',
    tableColumns: [] as Array<ColumnInterface[]>,
    tableRows: [] as Array<RowInterface[]>,
    paginatedRows: [] as Array<any>,
    activeRows: [] as Array<any>,
    currentPage: 0,
    itemsPerPage: 20 as number,
    isLoading: false as boolean,
    errorMessage: '' as string
  }),
  watch: {
    isLoading: {
        handler(isLoading: boolean) {
           if (typeof isLoading === 'boolean') this.$emit('onIsLoading', isLoading)
        },
        immediate: true
    },
    newPage: {
        handler(newPage: number) {
            if (typeof newPage === 'number') this.onChangePage(newPage)
        },
        immediate: true
    },
    rowsPerPage: {
        handler(perPage: number) {
            if (typeof perPage === 'number') this.itemsPerPage = perPage
        },
        immediate: true
    },
    async itemsPerPage(perPage: number) {
        if (!isEmpty(this.tableRows)) {
            this.currentPage = 0
            await delayPromise(100)
            this.paginateTableRows(perPage)
            await this.setPage(this.currentPage)
        }
    },
    tableRows: {
        handler(tableRows: any) {
            if (!isEmpty(tableRows)) this.$emit('onTableRows', tableRows)
        },
        immediate: true,
        deep: true
    },
    searchFilter(searchTerm: string) {
        if (!searchTerm) {
            this.paginated ? this.setPage(this.currentPage) : this.activeRows = this.tableRows
        } else {
            this.activeRows = this.searchDataSet(searchTerm, this.tableRows)
        }
    },
    activeRows: {
        handler(rows: any) {
            this.$emit('onActiveRows', rows)
        },
        immediate: true,
        deep: true
    },
    columns: {
        handler(columns: Array<ColumnInterface[]>) {
            if (isEmpty(columns)) return

            if (this.showIndex()) {
                const tcolumns: Array<any[]> = [...this.columns]
                const lastColIndex = this.columns.length-1
                tcolumns[lastColIndex] = [table.thNum("#"), ...tcolumns[lastColIndex]]
                this.tableColumns = tcolumns
            } else {
                this.tableColumns = columns
            }
            this.$emit('onActiveColumns', this.tableColumns)
        },
        immediate: true,
        deep: true
    },
    asyncRows: {
        async handler(func: any) {
            this.errorMessage = ''
            if (typeof func === 'function') {
                this.isLoading = true
                try {
                    this.tableRows = this.addColumnIndexes(await func())
                    if (this.paginated) {
                        this.paginateTableRows()
                        await this.setPage(0)
                    } else {
                        this.activeRows = this.tableRows
                    }
                } catch (e) {
                    this.errorMessage = `${e}`
                    toastDanger(`${e}`)
                    console.error(e)
                }
                this.isLoading = false
            }
        },
        immediate: true,
        deep: true
    },
    rows: {
        async handler(rows: Array<any[]>) {
            this.errorMessage = ''
            if (!rows || isEmpty(rows)) {
                this.activeRows = []
                this.tableRows = []
                return
            } 
            this.tableRows = this.addColumnIndexes(rows)
            if (this.paginated) {
                this.paginateTableRows()
                await this.setPage(0)
            } else {
                this.activeRows = this.tableRows
            }
        },
        immediate: true,
        deep: true
    }
  },
  methods: {
    showIndex() {
        return this.config && 'showIndex' in this.config
            ?  this.config.showIndex
            : false
    },
    addColumnIndexes(rows: Array<any>) {
        return this.showIndex()
            ?
            rows.map((r, i) => {
                const row = [table.td(i + 1)]
                return Array.isArray(r) ? row.concat(r) : [...row, r]
            })
            : 
            rows
    },
    paginateTableRows(perPage=0) {
        this.paginatedRows = chunk(this.tableRows ,perPage ? perPage : this.itemsPerPage)
        this.$emit('onPagination', this.paginatedRows)
    },
    async setPage(index: number) {
        this.activeRows = []
        const pageRows: any = this.paginatedRows[index]
        if (!pageRows) return
        try {
            if (typeof this.asyncRowParser === 'function') {
                this.activeRows = pageRows
                for (const i in pageRows) {
                    this.activeRows[i as any] = await this.asyncRowParser(pageRows[i])
                }
            } else {
               this.isLoading = true
               this.activeRows = typeof this.rowParser === 'function'
                    ? await this.rowParser(pageRows)
                    : pageRows
            }
        } catch (e) {
            toastDanger(`${e}`)
            this.errorMessage = `${e}`
            console.error(e)
        }
        this.isLoading = false
    },
    async sort(index: number, column: any ) {
        // Do not sort rows which have a parser function because not all values
        // will be available for sorting upfront. The only value we can guarantee for 
        // sorting is the first index or index === 0 value if Show Index is available
        if (this.showIndex() && typeof this.rowParser === 'function' && index != 0) return

        if (index === this.sortedIndex) {
            this.sortOrder = this.sortOrder === 'ascSort' ? 'descSort' : 'ascSort'
        } else {
            this.sortOrder = 'ascSort'
        }
        this.sortedIndex = index
        if (this.sortOrder in column) {
            if (this.paginated) {
                this.tableRows = column[this.sortOrder](index, this.tableRows)
                this.paginateTableRows()
                await this.setPage(this.currentPage)
            } else {
                this.activeRows = column[this.sortOrder](index, this.tableRows)
            }
        }
    },
    searchDataSet(searchTerm: string, dataset: Array<any>) {
        return dataset.filter((r: any) => {
            const rowText = JSON.stringify(r).match(/"td":"(.*?)"/g)?.join(' ').replace(/"td":|"/g, '')
            return rowText?.match(new RegExp(searchTerm, 'i')) || false
        })
    },
    async onChangePage(page: number) {
        this.currentPage = page
        await this.setPage(page)
    }
  },
  computed: {
    noData(): boolean {
        return !this.isLoading && isEmpty(this.activeRows)
    },
    columnLength(): number {
        try {
            return this.tableColumns[0].length
        } catch (e) {
            console.warn(e)
            return 5
        }
    },
    skeletonRows(): Array<number> {
        const rows = []
        const totalRows = this.config.skeletonTextRows 
            ? this.config.skeletonTextRows
            : 10
        for(let i=0; i < totalRows; ++i) {
            rows.push(i)
        }
        return rows
    }
  }
})
</script>

<style scoped>
    .no-data-section {
        text-align: center;
        font-weight: bold;
        font-size: 1em;
        color: rgb(133, 133, 133);
    }
    a {
        text-decoration: none;
        font-weight: 600;
        font-size: 1em;
    }
    .report-table-top {
        padding: 1rem;
        position: relative;
        width: 100%;
    }
    .report-table {
        width: 100%;
        position: relative;
        text-align: left;
        font-size: 0.8em;
    }
    .stick-report-header {
        background: white;
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    table {
        width: 100%;
        border-collapse: unset;
    }
    th {
        background: #3880ff;
        color: white;
        padding: 0.5em;
        font-size: 1.2em;
    }
    th, td {
        width: 3%;
        border-collapse: collapse;
        text-align: center;
    }
    td {
        border-bottom: 1px solid rgb(165, 165, 165);
        padding: 0.5em;
        font-weight: 500;
        font-size: 1.3em;
    }
    tr:nth-child(even) {
        background-color: #f0f0f0;
    }
</style>
