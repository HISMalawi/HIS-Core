import dayjs from "dayjs";

/**
 * Check for null values and Empty spaces
 * Best used for testing single words
 */
export function isValueEmpty(value: string) {
    try {
        return `${value}`.match(/(^\s*$|undefined|null)/i)
            ? true
            : false
    }catch(e) {
        return true
    }
}

/**
 * Checks null values and Unknown and None values
 * Best used for testing single words
 * @param value 
 * @returns 
 */
export function isUnknownOrEmpty(value: string) {
    return`${value}`.match(/(^\s*$|Unknown|None|undefined|null)/i)
        ? true
        : false
}

export function formatUnderScoreNames(name: string) {
    return `${name||''}`.split('_').join(' ')
}

export function removeTags(text: string) {
    return `${text}`.replace(/<[^>]+>/g, "")
}
export function getNumberOrdinal(n: number) {
    const s = ["th", "st", "nd", "rd"],
        v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

export function AppendleadingZero(num: number) {
    return num < 10 ? `0${num}` : num
}

export function toDate(date: string | Date) {
    const dataMatch = `${date}`.match(/\b(\d{2,4}[-/]\d{2}[-/]\d{2,4})|\b(\d{2}\s\w{3}\s\d{4})\b/i)
    if (dataMatch) {
        return dayjs(dataMatch[0]).format('DD/MMM/YYYY')
    }
    return date
}

export function toNumString(num: number | string) {
    let val = num
    if (typeof val === 'string' && val !='') {
        val = parseInt(val)
    }
    if (typeof val === 'number') {
        return val.toLocaleString()
    }
    return num
}

export function toSentenceCase (str: string) {
    return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatGender(gender: string) {
    const upCaseGender = `${gender}`.toUpperCase()
    if (upCaseGender === 'M' || upCaseGender === 'MALE') {
        return 'Male'
    }
    if (upCaseGender === 'F' || upCaseGender === 'FEMALE') {
        return 'Female'
    }
    if (/fbf|fnp|fp/i.test(gender)) {
        return upCaseGender
    }
    return gender
}

export function removeNonDateCharacters(dates: string) {
    const datePattern = /(\d{2}\/[A-Za-z]{3}\/\d{4})/g;  // DD/MMM/YYYY
    const dateMatches = dates.match(datePattern);  
    return dateMatches ? dateMatches.join(' ') : '';
}

export function isDateString(date: any) {
    const val = `${date}`
    return /^(?:(\d{4})[-\/](\d{2})[-\/](\d{2})|(\d{2})[-\/](\d{2})[-\/](\d{4}))$/i.test(val)
}