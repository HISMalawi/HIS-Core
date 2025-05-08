import { printLabel } from "@/components/LBL/labelUtil"
import LabOrderLbl from "./LabOrderLbl.vue"
import LocationLbl from "./LocationLbl.vue";
import NpidLbl from "./NpidLbl.vue";
import { modalController } from "@ionic/vue";
import PrintOrderOptions from "../../components/PrintOrderOptions.vue";
import { delayPromise } from "../../utils/Timers";

export async function printLabOrderBatch(orderIDs: number[]) {
    const modal =  await modalController.create({
        backdropDismiss: false,
        component: PrintOrderOptions,
        componentProps: {
            onClose: async (canPrint: boolean, smallSize: boolean, copies: number ) => {
                modalController.dismiss()
                if (!canPrint) return
                for (const orderID of orderIDs) {
                    await printLabel(LabOrderLbl, {
                        copies,
                        useImage: false,
                        lblUrl:`lab/labels/order?order_id=${orderID}&number_of_copies=${copies}&use_small_specimen_label=${smallSize}` 
                    });
                    await delayPromise(100)
                }
            }
        }
    })
    await modal.present()
    await modal.onWillDismiss()
}

export async function printLabOrderLbl(orderID: number) {
    const modal =  await modalController.create({
        backdropDismiss: false,
        component: PrintOrderOptions,
        componentProps: {
            onClose: async (canPrint: boolean, smallSize: boolean, copies: number ) => {
                modalController.dismiss()
                if (!canPrint) return
                printLabel(LabOrderLbl, {
                    copies,
                    useImage: false,
                    lblUrl:`lab/labels/order?order_id=${orderID}&number_of_copies=${copies}&use_small_specimen_label=${smallSize}` 
                })
            }
        }
    })
    await modal.present()
    await modal.onWillDismiss()
}

export async function printLocationLbl(locationID: number) {
    return printLabel(LocationLbl, {
        scaleHeight: 280, 
        useImage: false,
        lblUrl: `labels/location?location_id=${locationID}` 
    })
}

export async function printNpidLbl(patientID: number, generateQrCode=false) {
    return printLabel(NpidLbl, {
        scaleHeight: 280,
        useImage: false,
        lblUrl: `patients/${patientID}/labels/national_health_id?qr_code=${generateQrCode}`
    })
}
