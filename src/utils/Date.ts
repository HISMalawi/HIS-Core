import dayjs from "dayjs";

export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD'
const DISPLAY_DATE_FORMAT = 'DD/MMM/YYYY'

function calculateAge(birthdate:any, currentdate:any) {
    const birthDate = new Date(birthdate);
    const currentDate = new Date(currentdate);
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
}
function sessionDate() {
    return sessionStorage.getItem('sessionDate') || dayjs().format(STANDARD_DATE_FORMAT)
}

function currentDisplayDate() {
    return dayjs().format(DISPLAY_DATE_FORMAT)
}

function currentDate() {
    return dayjs().format(STANDARD_DATE_FORMAT)
}

function dateDiffInDays(date1: string, date2: string) {
    return dayjs(date1).diff(date2, 'days')
}

function getAgeInYears(date: string | Date): number {
    return dayjs().diff(date, 'years');
}

function toStandardHisTimeFormat(date: string | Date) {
    return dayjs(date).format('HH:mm')
}

function toStandardHisDisplayFormat(date: string | Date): string {
    const fdate = dayjs(date).format(DISPLAY_DATE_FORMAT)
    if (fdate.match(/invalid/i)) return ''
    return fdate
}

function toStandardHisFormat(date: string | Date): string {
    const fdate = dayjs(date).format(STANDARD_DATE_FORMAT)
    if (fdate.match(/invalid/i)) return ''
    return fdate
}

function estimateDateFromAge(age: number): string {
    const date = dayjs(sessionDate()).subtract(age, 'years')
    return date.format(STANDARD_DATE_FORMAT)
}

function getYearFromAge(age: number) {
    return dayjs(sessionDate()).subtract(age, 'years').year()
}

function getYear(date: string) {
    return dayjs(date).year()
}
function getMonth(date: string) {
    return dayjs(date).format('MMM')
}
function getDay(date: string) {
    return dayjs(date).date()
}
function add(date: string, unit: any, value: number) {
    return dayjs(date).add(value, unit);
}
function subtract(date: string, unit: any, value: number) {
    return dayjs(date).subtract(value, unit);
}

function getCurrentYear() { return dayjs().year() }

function getDateBeforeByDays(date: string, days: number) {
    const dateObj = new Date(date)
    dateObj.setDate(dateObj.getDate() - days)
    return toStandardHisFormat(dateObj)
}

/**
 * Get Year of specified age in years
 * @param age
 * @returns 
 */
function getYearOfAge(ageInYears: number): number {
    const [year] = estimateDateFromAge(ageInYears).split('-')
    return parseInt(year)
}

function stitchDate(year: number | string, month=-1 as number | string, day=-1 as number | string) {
    let fmonth = month.toString()
    let fday = day.toString()
    let fyear = year
    const unknown = (d: number | string) => d.toString().match(/Unknown/i) 

    if (parseInt(fyear.toString()) < 1900) {
        fyear = '1900'
    }

    if (!month || unknown(month)) {
        fmonth = '07'
    }

    if (!day || unknown(day)) {
        fday = '15'
    }

    return toStandardHisFormat(`${fyear}-${fmonth}-${fday}`)
}

export default {
    currentDate,
    getYearOfAge,
    getYear,
    dateDiffInDays,
    getAgeInYears,
    toStandardHisTimeFormat,
    toStandardHisDisplayFormat,
    currentDisplayDate,
    stitchDate,
    toStandardHisFormat,
    estimateDateFromAge,
    getYearFromAge,
    getCurrentYear,
    getDateBeforeByDays,
    getMonth,
    getDay,
    add,
    subtract,
    calculateAge
}