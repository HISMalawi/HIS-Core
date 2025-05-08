import { FieldType } from "@/components/Forms/BaseFormElements"
import { Service } from "@/services/service"
import { generateDateFields } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import { Option } from '@/components/Forms/FieldInterface'
import { toDate } from "@/utils/Strs"
import { MultiStepPopupForm } from "@/utils/PopupKeyboard"
import { toastDanger } from "@/utils/Alerts"
import { modalController } from "@ionic/vue"
import { reactive } from "vue"
import StandardValidations from "@/components/Forms/validations/StandardValidations"
import App from "@/apps/app_lib"
import Store from "@/composables/ApiStore"
import Validation from "@/components/Forms/validations/StandardValidations"

export enum DatePeriodInputType {
    MULTI_FIELD_DATE = 'Multipage date fields',
    CALENDAR_FIELD = 'Calendar',
    SINGLE_DATE_INPUT_FIELD = 'Single page date'
}

export enum HtsReportPreference {
    PERIOD_INPUT_TYPE = 'hts_report_date_period_type'
}

export const ReportPreferences = reactive({
    datePeriodInputType: localStorage.getItem(HtsReportPreference.PERIOD_INPUT_TYPE) || DatePeriodInputType.SINGLE_DATE_INPUT_FIELD
} as any)

export function DateSelectionPreference() {
    MultiStepPopupForm([
        {
            id: 'date_field_type',
            helpText: 'Date input preference',
            type: FieldType.TT_SELECT,
            defaultValue: () => ReportPreferences.datePeriodInputType,
            options: () => {
                return [
                    { label: 'Calendar', value: DatePeriodInputType.CALENDAR_FIELD },
                    { label: 'Single page date', value: DatePeriodInputType.SINGLE_DATE_INPUT_FIELD},
                    { label: 'Multipage date fields', value: DatePeriodInputType.MULTI_FIELD_DATE },
                ]
            }
        }
    ],
    (f: any) => {
        ReportPreferences.datePeriodInputType = f.date_field_type.value
        localStorage.setItem(HtsReportPreference.PERIOD_INPUT_TYPE, ReportPreferences.datePeriodInputType)
        modalController.dismiss()
    })
}

export function DateSelection(params: any) {
    MultiStepPopupForm([
        ...generateDateFields({
            id: 'start_date',
            helpText: 'Start',
            required: true,
            minDate: () => params?.minDate ?? '',
            maxDate: () => params?.maxDate ?? Service.getSessionDate(),
            condition: () => (ReportPreferences.datePeriodInputType === DatePeriodInputType.MULTI_FIELD_DATE) as boolean,
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date 
        }),
        ...generateDateFields({
            id: 'end_date',
            helpText: 'End',
            required: true,
            minDate: (_: any, c: any) => c.start_date,
            maxDate: () => params?.maxDate ?? Service.getSessionDate(),
            condition: () => (ReportPreferences.datePeriodInputType === DatePeriodInputType.MULTI_FIELD_DATE) as boolean,
            estimation: {
                allowUnknown: false
            },
            computeValue: (date: string) => date
        }),
        {
            id: 'alt_start_date',
            proxyID: 'start_date',
            helpText: 'Start Date',
            type: FieldType.TT_FULL_DATE,
            validation: (v: Option) => {
                if (!v) return ['Date is required']

                const maxDate = params.maxDate || Service.getSessionDate()
                if (params.minDate && new Date(v.value) < new Date(params.minDate)) {
                    return [`${toDate(`${v.value}`)} is less than minimum date of ${toDate(params.minDate)}`]
                }
                if (maxDate && new Date(v.value) > new Date(maxDate)) {
                    return [`${toDate(`${v.value}`)} is greater than max date of ${toDate(maxDate)}`]
                }
                return null
            },
            computedValue: (v: Option) => v.value,
            condition: () => ReportPreferences.datePeriodInputType === DatePeriodInputType.SINGLE_DATE_INPUT_FIELD
        },
        {
            id: 'alt_end_date',
            proxyID: 'end_date',
            helpText: 'End Date',
            type: FieldType.TT_FULL_DATE,
            defaultValue: (f: any) => f.start_date.value,
            validation: (v: Option, f: any) => {
                if (!v) return ['Date is required']

                const maxDate = params.maxDate || Service.getSessionDate()
                if (f.start_date.value && new Date(v.value) < new Date(f.start_date.value)) {
                    return [`${toDate(`${v.value}`)} is less than minimum date of ${toDate(f.start_date.value)}`]
                }
                if (maxDate && new Date(v.value) > new Date(maxDate)) {
                    return [`${toDate(`${v.value}`)} is greater than max date of ${toDate(maxDate)}`]
                }
                return null
            },
            computedValue: (v: Option) => v.label,
            condition: () => ReportPreferences.datePeriodInputType === DatePeriodInputType.SINGLE_DATE_INPUT_FIELD
        },
        {
            id: 'calendar_start_date',
            proxyID: 'start_date',
            helpText: 'Start Date',
            type: FieldType.TT_DATE_PICKER,
            computedValue: (v: Option) => v,
            condition: () => ReportPreferences.datePeriodInputType === DatePeriodInputType.CALENDAR_FIELD,
            validation: (v: Option) => StandardValidations.required(v),
            config: {
                minDate: () => params.minDate || null,
                maxDate: () => params.maxDate || Service.getSessionDate(),
                infoItems: (date: string, f: any) => {
                    return [
                        { label: 'Start Date', value: toDate(date) || '-' },
                        { label: 'End Date', value: toDate(f.end_date) || '-'}
                    ]
                },
                persistInfoItems: false
            }
        },
        {
            id: 'calendar_end_date',
            proxyID: 'end_date',
            helpText: 'End Date',
            type: FieldType.TT_DATE_PICKER,
            validation: (v: Option) => StandardValidations.required(v),
            defaultValue: (f: any) => f?.start_date?.value,
            computedValue: (v: Option) => v,
            condition: () => ReportPreferences.datePeriodInputType === DatePeriodInputType.CALENDAR_FIELD,
            config: {
                minDate: (f: any) => f.start_date.value,
                maxDate: () => params.maxDate || Service.getSessionDate(),
                infoItems: (date: string, f: any) => {
                    return [
                        { label: 'Start Date', value: toDate(f.start_date) || '-' },
                        { label: 'End Date', value: toDate(date)}
                    ]
                },
                persistInfoItems: false
            }
        },
        (() => {
            let isMilitarySite = false
            return {
                id: 'occupation',
                helpText: "Report Group",
                type: FieldType.TT_SELECT,
                init: async () => {
                    isMilitarySite = await Store.get('IS_MILITARY_SITE')
                    return true
                },
                computedValue: (v: Option) => v.value, 
                condition: () => App.getActiveApp()?.applicationName === 'ART' && isMilitarySite,
                validation: (val: Option) => Validation.required(val),
                options: () => {
                    return [
                        { label: 'All', value: 'All'},
                        { label: 'Military', value: 'Military'},
                        { label: 'Civilian', value: 'Civilian'},
                    ]
                }
            }
        })(), ...(Array.isArray(params.fields) ? params.fields : [])
    ], 
    async (f: any, c: any) => {
        modalController.dismiss()
        try {
            if (typeof params.defaultOnFinish === 'function') {
                return await params.defaultOnFinish(f, c)
            }
            const period = `${toDate(c.start_date)} to ${toDate(c.end_date)}`
            await params.onFinish(c.start_date, c.end_date, period, c.occupation)
        } catch (e) {
            toastDanger("An error has occurred")
        }
    })
}