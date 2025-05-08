import { Order } from '@/interfaces/order';
import { Service } from '@/services/service'
import HisDate from "@/utils/Date"
import { ConceptService } from './concept_service';
import { ObservationService } from './observation_service';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import artProps from '@/apps/ART/art_global_props';

export class OrderService extends Service {
    constructor() {
        super()
    }

    static create(data: any) {
        return super.postJson('/lab/orders', data)     
    }
    static getOrders(patientID: number, params = {}) {
        return super.getJson('/lab/orders', {
            'patient_id': patientID,
            ...params
        });
    }

    static async getOrdersIncludingGivenResultStatus(patientID: number, params={}) {
        const data = (await this.getOrders(patientID, params)).map(async (order: Order) => {
            const remappedOrder: any = { ...order, 'result_given': false }
            const obsResultID = order.tests.filter(order => order.result != null)
                .map((tests: any) => tests.result)
                .reduce((results: any, result: any) => [...results, ...result], [])
                .reduce((_: any, result: any) => result.id, null)
            try {
                remappedOrder['result_given'] = !obsResultID ? 'N/A'
                    : await (await ObservationService.get(obsResultID as number))
                        .children.reduce(async (status: string, obs: any) => {
                            return (await ConceptService.getConceptID('Result Given to Client')) === obs.concept_id
                            && (await ConceptService.getConceptName(obs.value_coded)) === 'Yes'
                                ? 'Yes'
                                : status
                        }, 'No')
            } catch (e) {
                console.error(e)
            }
            return remappedOrder
        })
        return await Promise.all(data)
    }

    static getTestTypes() {
        return super.getJson('/lab/test_types')
    }

    static getTestTypesBySpecimen(specimenType='') {
        return super.getJson('/lab/test_types', {
            'specimen_type': specimenType
        });
    }

    static getSpecimens(testName: string) {
        return super.getJson('/lab/specimen_types', { 'test_type': testName });
    }

    static getVLResults (order: Order) {
        return order.tests
            .filter(t => t.name.match(/viral load/i) && !isEmpty(t.result))
            .map(t => t.result)
            .flat()
            .sort((a, b) => a.date.getTime() - b.date.getTime())
    }

    static getOrdersWithResults(orders: Order[]) {
        return orders.filter(order => {
            try {
                const result = order.tests[0].result;
                if (!Array.isArray(result)) return false
                return order.tests.length > 0 && order.tests[0].result.length > 0;
            } catch (error) {
                console.log(error);
            }

        });
    }

    static async getLatestMalariaTestResult(patientID: number, date = this.getSessionDate()) {
        const orders: Order[] = await this.getOrders(patientID)
        const minDate = dayjs(date).subtract(7, 'day')
        const malariaOrders = orders.filter(order => {
            for (const test of order.tests) {
                if(
                    !isEmpty(test.result) && 
                    test.name.match(/Malaria/i) && 
                    dayjs(order.order_date).isAfter(minDate)
                ) return true
            }
            return false
        });
        if(malariaOrders.length > 0) {
            const isNegative = malariaOrders[0].tests.some(test => {
                return test.result.some(result => {
                    return result.value.toString().match(/negative|no/i)
                })
            })
            return isNegative ? 'Negative' : 'Positive'
        } 
        return "No"
    }

    static isDBSResult(specimen: string) {
        return specimen.match(/DBS/i)
    }

    static isValidVLResult(specimen: string, modifier: string, value: string){
        if (this.isDBSResult(specimen)){
            return (modifier.match(/</) && value.match(/ldl|400|550|839/i)) ||
            (modifier.match(/=/) && (parseFloat(value) >= 400)) ||
            (modifier !== '>')
        }
        return (modifier.match(/</) && value.match(/ldl|20|40|150/i)) || 
            (modifier.match(/=/) && (parseFloat(value) >= 20))
    }

    static detectHighVl(value: any,value_modifier: any) {
        
        if(value_modifier === '=' && parseFloat(value) >= 1000) return true

        if((value_modifier  === '<' || value_modifier  === '&lt') 
            && parseFloat(value) > 1000
        )  return true

        if((value_modifier  === '>' || value_modifier  === '&gt') 
            && (parseFloat(value) >= 1000 || `${value}`.toUpperCase().replace(/\s+/g, '') == 'LDL')
        )  return true

        return false
    }

    static isHighViralLoadResult(result: any) {
        if(result.indicator?.name !== "HIV viral load") return false;
        return OrderService.detectHighVl(result.value, result.value_modifier)
    }

    static formatLabs(orders: any) {
        const formatted = [];
        for (let x = 0; x < orders.length; x++) {
            const accessionNumber = orders[x].accession_number;
            const testStatus = (orders[x].specimen.name == "Unknown" ? "N/A" : orders[x].specimen.name);
            const dateOrdered = orders[x].order_date;
            const tests = orders[x].tests;

            for (let i = 0; i < tests.length; i++) {
                const results = (tests[i].result ? tests[i].result : []);
                const resultsArr = [];
                const resultIds = [];
                let resultDate = '';

                for (let r = 0; r < results.length; r++) {
                    resultDate = (results[r].date === null ? "" : `${results[r].date}`);
                    const name = results[r].indicator.name;
                    const value = results[r].value;
                    const valueModifier = results[r].value_modifier.replace('&lt;', '<').replace('&gt;', '>');
                    resultsArr.push(name + "   " + valueModifier + value);
                    resultIds.push(results[r].id)
                }
                formatted.push({
                    'encounter_id': orders[x].encounter_id,
                    'order_id': orders[x].order_id,
                    'result_given': orders[x]['result_given'] || 'N/A',
                    'accession_number': accessionNumber,
                    'test_name': tests[i].name,
                    delivery_mode: orders[x].delivery_mode,
                    specimen: testStatus,
                    ordered: dateOrdered ? HisDate.toStandardHisFormat(dateOrdered) : '',
                    result: resultsArr,
                    resultIds,
                    released: resultDate ? HisDate.toStandardHisFormat(resultDate) : '',
                })

            }
        }
        return formatted;
    }
    static async accessionNumExists(accession: string) {
        const res = await Service.getJson('lab/accession_number', { accession_number: accession })
        return res && res.exists
    }
    static async buildLabOrders(encounter: any, orders: any) {
        const targetLab = (await artProps.targetLab()) || super.getLocationName()
        return orders.map((data: any) => {
            const testReason = ConceptService.getCachedConceptID(data.reason, true);
            const payload: any = {
                'accession_number': data.accessionNumber,
                'encounter_id': encounter.encounter_id,
                'tests': [{ 'concept_id': data.concept_id }],
                'reason_for_test_id': testReason,
                'target_lab': targetLab,
                'date': HisDate.toStandardHisFormat(super.getSessionDate()),
                'requesting_clinician': super.getUserName(),
            }
            if (data.specimenConcept) {
                payload['specimen'] = {
                    'concept_id': data.specimenConcept
                }
            }
            return payload
        })
    }
    static saveOrdersArray(encounterId: number, orders: Array<Order>) {
        return this.create({
            'encounter_id': encounterId,
            orders: orders
        })
    }
}