import { DrugOrderInterface } from "@/interfaces/DrugOrder";
import { Service } from "./service";

export class DrugOrderService extends Service {
    constructor() {
        super()
    }

    static create(orders: DrugOrderInterface) {
        return this.postJson('drug_orders', orders)
    }

    static updateDispensationOrders(orders: any) {
        return this.postJson('dispensations', {
            'program_id': this.getProgramID(),
            dispensations: orders.map((order: any) => ({
                'date': this.getSessionDate(),
                'drug_order_id': order['order_id'],
                'quantity': order['quantity']
            }))
        })
    }

    static getDrugOrderHistory(patientID: number) {
        return this.getJson('drug_orders', { 'patient_id': patientID })
    }

    static getDrugOrders(patientID: number) {
        return this.getJson('drug_orders', {
            'patient_id': patientID,
            'date': this.getSessionDate(),
            'program_id': this.getProgramID()
        })
    }

    static getAllDrugOrders(patientID: number, pageSize=1000) {
        return this.getJson('drug_orders', {
            'patient_id': patientID,
            'program_id': Service.getProgramID(),
            'page_size': pageSize
        })
    }

    static getLastDrugsReceived(patientID: number) {
        return this.getJson(`patients/${patientID}/last_drugs_received`, {
            'date': this.getSessionDate(),
            'program_id': this.getProgramID()
        })
    }

    static getDrugDosages(patientID: number, drugID: number, date=this.getSessionDate()) {
        const params = { 'drug_id': drugID, 'date': date }
        return this.getJson(`programs/${this.getProgramID()}/patients/${patientID}/drug_doses`, params)
    }

    static getOrderByPatient(patientId: number, params: any) {
        return this.getJson('/drug_orders', {
            'patient_id': patientId,
            'program_id': this.getProgramID(),
            ...params
        })
    }

}