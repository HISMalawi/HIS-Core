import {isEmpty, isPlainObject} from "lodash"
import { Option } from '@/components/Forms/FieldInterface';
import { toDate } from '@/utils/Strs';

function validateSeries(conditions: Array<any>){
    try {
        for(const i in conditions) {
            const condition = conditions[i]()

            if (condition) return condition
        }
    } catch (e) {
        return [e]
    }
}

function required(value: any): null | Array<string> {
    return isEmpty(value) ? ['Value is required'] : null
}

function isFloatingPointNumber(val: any): null | string[] {
    return isPlainObject(val) && !/^[-+]?[0-9]*\.?[0-9]+$/.test(`${val?.value}`)
        ? ['Not a valid number']
        : null
}

function isMWPhoneNumber(val: any) {
    //Regex source: https://gist.github.com/kwalter94/1861f1f0fa192382a75a445ad70f07ec
    const validation = /^(\+?265|0)(((8[89]|9[89])\d{7})|(1\d{6})|(2\d{8})|(31\d{8}))$/
    return !val || !val.value.match(validation) ? ['Not a valid phone number']: null
}

function isMWNationalID(nationalId: Option): null | Array<string> {
    const nationalIDRegex = /^\w{8}$/
    return isEmpty(nationalId) || !nationalId.value.toString().match(nationalIDRegex) 
        ? ['Not a valid Malawi National ID Code'] 
        : null
}

function isIPAddress(val: any) {
    const validation = /\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/
    return !val || !val.value.match(validation) ? ['Not a valid IP address']: null
}
function isName(value: any): null | Array<string> {
    const validation = /^(?=.{2,100}$)[a-zA-Z]+(?:['\- ][a-zA-Z]+)*$/
    return !value || !value.label.match(validation) ? ['Invalid name Input']: null
}

function isNumber(val: any): null | Array<string> {
    return isNaN(parseInt(val.value)) ? ['Value must be a number'] : null
}

function hasLengthRangeOf(val: any, min: number, max: number): null | Array<string> {
    const len = val ? val.label.length : 0
    return len >= min && len <= max ? null : [`Value length not within range of ${min} - ${max}`] 
}

function dateRangeOf(v: Option, min: string, max: string) {
    const value = new Date(v.value)
    const minDate = new Date(min)
    const maxDate = new Date(max)
    return value >= minDate && value <= maxDate ? null: [`${toDate(`${v.value}`)} not within range of ${toDate(min)} - ${toDate(max)}`]
}

function rangeOf(val: any, min: number, max: number): null | Array<string> {
    const value = parseInt(val.label)
    return value >= min && value <= max ? null: [`${value} not within range of ${min} - ${max}`]
}
function neitherOr(val: any): null | Array<string> {
    const allNo = val.filter((arr: any) => {
        const val = arr.value || arr.other.value
        return val === 'No'
    });
    if(allNo.length == val.length) {
        return ['All values can not be no']
    }
    return null;
}
function anyEmpty(val: any): null | Array<string> {
    const error = ['all must be selected']

    if (!val) return error

    const allNo = val.filter((i: any) => i.value === '')
    return allNo.length > 0 ? error : null
}
function notTheSame(val: any, comparison: string): null | Array<string> {
    return val === comparison ? ['Values can not be the same'] : null;
}
export default {
    dateRangeOf,
    isFloatingPointNumber,
    validateSeries,
    required,
    isMWPhoneNumber,
    isName,
    isNumber,
    hasLengthRangeOf,
    rangeOf,
    neitherOr,
    anyEmpty,
    notTheSame,
    isIPAddress,
    isMWNationalID
}