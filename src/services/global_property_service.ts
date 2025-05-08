import { Service } from "./service";

export class GlobalPropertyService extends Service {
    constructor() {
        super()
    }

    static async get(prop: string) {
        try {
            const res = await super.getJson('global_properties', { property: prop })
            if (res && prop in res) return res[prop]
        } catch (e) {
            console.error(e)
        }

    }

    static async isProp(property: string) {
        try {
            const [prop, val] = property.split('=')
            const curVal = await this.get(prop)

            if (curVal) return val === curVal
        } catch (e) {
            console.error(e)
        }
        return false
    }

    static set(prop: string, val: string | number) {
        return super.postJson('global_properties', {
            'property': prop, 'property_value': val 
        })   
    }
}