function parameterizeObjToString(obj: Record<string, any>) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&')
}

function updateUrlParamString(url: string, params={}) {
    const [urlPath, urlStrParams] = url.split('?')
    const urlParams = `${urlStrParams??''}`.split('&').reduce((a: any, c: any) => {
        const [key, value] = c.split('=')
        return {...a, [key]: value}
    }, params)
    return `${urlPath}?${parameterizeObjToString(urlParams)}`
}

function removeParams(url:string) {
    return `${url}`.match(/^(.*?)(\?[^#]*)?(\/#.*)?$/)?.[1]
}

function extractParams(url: string) {
    const regex = /[?&]([^=]+)=([^&]*)/g;
    const match = `${url}`.match(regex);
    if (match) {
        return (match).reduce((a: any, str: any) => {
            const [key, val] = str.replace(/[?&]/g,'').split("=")
            return {...a, [key]: val}
        }, {})
    }
    return {}
}

export default {
    extractParams,
    removeParams,
    updateUrlParamString,
    parameterizeObjToString
}