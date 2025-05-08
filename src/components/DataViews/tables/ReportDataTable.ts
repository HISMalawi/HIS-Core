import HisDate from "@/utils/Date"
import { removeTags, toNumString } from "@/utils/Strs";
import { sort } from 'fast-sort';
import { isEmpty } from "lodash";

export interface TableInterface {
    showIndex?: boolean;
    skeletonTextRows?: number;
    tableCssTheme?: string;
}

export type AsyncTableRowHandler = () => Promise<Array<any>> | Array<any>
export type TableRowParser = (data: any) => Promise<Array<any>> | Array<any>
export type ArraySortFunction = (arr: Array<any>) => Array<any>
export type TableEventHandler = () => Promise<any> | any
export interface ColumnInterface {
    th: string | number | Date;
    type: 'string' | 'date' | 'number';
    value?: string;
    colspan?: number;
    sortable?: boolean;
    ascSort?: ArraySortFunction;
    descSort?: ArraySortFunction;
    csvExportable?: boolean;
    pdfExportable?: boolean;
    exportable?: boolean;
    style?: Record<string, any>;
    cssClass?: string;
}
export interface EventInterface {
    obj: 'button' | 'link' | 'cell';
    color?: string;
    click: TableEventHandler;
}
export interface RowInterface {
    td: string | number | Date;
    value?: string | number | Date;
    style?: Record<string, any>;
    cssClass?: string;
    sortValue?: 'number' | 'string';
    event?: EventInterface;
}
export function prepareCSVValue(value: string | number | Date) {
    if(typeof value !== 'string') return value
    return removeTags(value).replace(/,/gi, ' ').trim()
}
export function toExportableFormat(columns: Array<ColumnInterface[]>, rows: Array<RowInterface[]>, mode='' as 'csvMode' | 'pdfMode' | 'ignorePDFColumnexport') {
    const strRows: Array<any> = []
    const strCols: Array<any> = []
    const isExportable = (column: any) => {
        if (mode === 'csvMode' && 'csvExportable' in column) {
            return column.csvExportable || false
        }
        if (mode === 'pdfMode' && 'pdfExportable' in column) {
            return column.pdfExportable != undefined ? column.pdfExportable : true
        }
        if (mode === 'ignorePDFColumnexport' && 'pdfExportable' in column && column.pdfExportable) {
            return false
        }
        if ('exportable' in column) {
            return column.exportable || false
        }
    }
    for(const index  in rows) {
        const exportableRow: any = []
        rows[index].forEach((r, i) => {
            /*
                Last column of columns is the preferred source of reference
                for checking if a row cell is exportable
            */
            const column = columns[columns.length-1][i]
            if (isExportable(column)) {
                exportableRow.push(r.value ? prepareCSVValue(r.value) : prepareCSVValue(r.td))
            }
        })
        strRows.push(exportableRow)
    }
    for(const index  in columns) {
        const exportableColumns: any = []
        columns[index].forEach((c) => {
            if (isExportable(c)) {
                exportableColumns.push(c.value ? prepareCSVValue(c.value) : prepareCSVValue(c.th))
            } 
        })
        if (!isEmpty(exportableColumns)) {
            strCols.push(exportableColumns)
        }
    }
    return {columns: strCols, rows: strRows}
}
function configCell(conf: any) {
    const attributes: any  = {
        th: () => {
            return conf.th ? conf.th : ''
        },
        td: () => {
            return conf.td ? conf.td : ''
        },
        value: () => {
            return conf.value ? conf.value : ''
        },
        sortValue: () => {
            return conf.sortValue ? conf.sortValue : 0
        },
        type() {
            return conf.type ? conf.type : 'string'
        },
        exportable() {
            return 'exportable' in conf ? conf.exportable : true
        },
        csvExportable() {
            return 'csvExportable' in conf ? conf.csvExportable : true
        },
        pdfExportable() {
            return 'pdfExportable' in conf ? conf.pdfExportable : undefined
        },
        sortable() {
            return 'sortable' in conf ? conf.sortable : true
        },
        colspan() {
            return conf.colspan ? conf.colspan : 0
        },
        cssClass() {
            return conf.cssClass ? conf.cssClass : 0
        },
        style(){
            return conf.style ? conf.style : 0
        },
        ascSort() {
            if (!conf.ascSort) {
                return (index: number, rows: Array<RowInterface[]>) => {
                    return sort(rows).asc(r => r[index]?.sortValue || r[index]?.td)
                }
            }
            return conf.ascSort
        },
        descSort(){
            if (!conf.descSort) {
                return (index: number, rows: Array<RowInterface[]>) => {
                    return sort(rows).desc(r => r[index]?.sortValue || r[index]?.td)
                }
            }
            return conf.descSort
        }
    }
    const finalConf: any = {}
    for(const attr in attributes) {
        finalConf[attr] = attributes[attr]()  
    }
    return finalConf
}

function thTxt(th: string | number | Date, params={} as any): ColumnInterface {
    const data = params
    data.th = th
    data.type = 'string'
    return configCell(data)
}

function thDate(th: string | number | Date, params={} as any): ColumnInterface  {
    const data = params
    data.th = th
    data.type = 'date'
    return configCell(data)
}

function thNum(th: string | number | Date, params={} as any): ColumnInterface {
    const data = params
    data.th = th
    data.type = 'number'
    return configCell(data)
}

function tdNum(td: string | number, params={} as any): RowInterface {
    const data = {...params}
    data.td = toNumString(td)
    data.sortValue = parseInt(`${td}`)
    data.style = {
        textAlign: "right",
        paddingRight: ".5rem",
        ...data.style,
    }
    return configCell(data)
}

function tdDate(td: string, params={} as any): RowInterface {
    const data = params
    data.td = td ? HisDate.toStandardHisDisplayFormat(td) : ''
    return configCell(data)
}

function td(td: string | number | Date, params={}): RowInterface {
    return  { td, ...params }
}

function tdLink(td: string | number | Date, click: TableEventHandler, params={}): RowInterface {
    return {
        td,
        event: {
            click,
            obj: 'link'
        },
        ...params
    }
}

function tdBtn(td: string | number | Date, click: TableEventHandler, params={} as any, color=''): RowInterface {
    const data = {
        td,
        event: {
            click,
            color: color,
            obj: 'button'
        }
    }
    if (params.event) {
        data.event = { ...data.event, ...params.event}
        delete params.event
    }
    return Object.assign(data, params)
}
export default {
    thTxt,
    thNum,
    thDate,
    tdNum,
    td,
    tdBtn,
    tdDate,
    tdLink,
}