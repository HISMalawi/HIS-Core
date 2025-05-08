import { Service } from "@/services/service";

export interface AncDrugSetDrugs {
    drug: number;
    drug_name?: string;
    quantity: number;
    duration?: number;
    frequency: string;
}

export interface NewDrugSet {
    id?: number;
    datetime?: string;
    name: string;
    description: string;
    drugs: AncDrugSetDrugs[];
}

export class AncDrugSetService extends Service {
    static saveDrugSet(drugSet: NewDrugSet) {
        const data  = {...drugSet}
        data['datetime'] = Service.getSessionDate()
        return this.postJson('/drug_sets', drugSet)
    }

    static voidDrugSet(setID: number) {
        return this.void(`/drug_sets/${setID}`, { date: this.getSessionDate()})
    }

    static async getDrugSets() {
        const data = await this.getJson('drug_sets')
        if (data) {
            return Object.keys(data['set_names'])
                .reduce((sets: Array<any>, setKey: string) => {
                    const name = data['set_names'][setKey]
                    const description = data['set_descriptions'][setKey]
                    const drugs = data['drug_sets'][setKey]
                    sets.push({
                        id: parseInt(setKey),
                        name,
                        description,
                        drugs: Object.keys(drugs).reduce(
                            (a: any, k: string) => [
                                ...a, { 
                                    'id': parseInt(k), ...drugs[k],
                                    'drug_name': drugs[k].drug_name,
                                    'duration': parseInt(drugs[k].duration),
                                    'frequency': drugs[k].frequency,
                                    'units': drugs[k].units,
                                }], []
                        )
                    })
                    return sets
                }, [])
        }
        return []
    }
}