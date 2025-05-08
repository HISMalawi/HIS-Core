import { AppEncounterService } from "@/services/app_encounter_service";
import { OrderService } from "@/services/order_service";
import { printLabOrderLbl } from "@/views/Labels";

export class PatientLabService extends AppEncounterService  {
    constructor(patientID: number) {
        super(patientID, 57)
    }

    getOrders(status: 'drawn' | 'ordered') {
        return OrderService.getOrders(this.patientID, { status })
    }

    voidOrder(orderID: number, reason: string) {
        return OrderService.void(`lab/orders/${orderID}`,{reason})
    }

    updateOrderSpecimen(orderID: number, specimenID: number) {
        return OrderService.putJson(`lab/orders/${orderID}`,
            {specimen: { 'concept_id': specimenID } }
        )
    }

    printSpecimenLabel(orderID: number) {
        return printLabOrderLbl(orderID)
    }
    
    async placeOrder(params: any) {
        let orders: any = []
        const encounter: any = await this.createEncounter()

        if (!encounter) throw 'Unable to create encounter'

        const payload: any = {
            'encounter_id': encounter.encounter_id,
            'date': this.date,
            ...params
        }
        if (!payload.requesting_clinician) {
            payload['requesting_clinician'] = OrderService.getUserName()
        }
        if (params.combine_tests) {
            orders = [ payload ]
        } else {
            orders = payload.tests.map((test: any) => {
                const data ={...payload}
                data.tests = [test]
                return data
            })
        }
        return OrderService.postJson('lab/orders', {orders})
    }

    static async getSpecimensForTests(tests: any) {
        const specimens: any = await Promise.all(
            tests.map((t: any) => OrderService.getSpecimens(t.name))
        )
        return this.getCommonSpecimens(specimens)
    }

    private static getCommonSpecimens(specimenList: Array<any>) {
        const commonIndexes: any = {}
        const common: any = []
        specimenList.forEach(specimens => {
            specimens.forEach(({name, ...rest}: any) => {
                const s = {name, ...rest}
                if (!commonIndexes[name]) {
                    commonIndexes[name] = [s]
                } else {
                    commonIndexes[name].push(s)
                }
            })
        })
        for(const i in commonIndexes) {
            if (commonIndexes[i].length >= specimenList.length) {
                common.push(commonIndexes[i][0])
            }
        }
        return common
    }
}
