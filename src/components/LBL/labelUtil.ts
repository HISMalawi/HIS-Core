import { PrintoutService } from "@/services/printout_service";
import { toastWarning } from "@/utils/Alerts";
import { modalController } from "@ionic/vue";
import { isEmpty } from "lodash";
import { ref } from "vue";
import url from "@/utils/Url"
import EventBus from "@/utils/EventBus";
import { EventChannels } from "@/utils/EventBus";
import { Service } from "@/services/service";
import { LabelPrinter } from "cap-label-printer-plugin";
import { delayPromise } from "../../utils/Timers";
import Url from "../../utils/Url";
import ApiClient from "../../services/api_client";

interface PrintLabelParams {
    scaleWidth?: number;
    scaleHeight?: number;
    useImage?: boolean;
    lblUrl?: string;
    copies?: number;
    onGenerateProps?: () => Promise<Record<string, any>>;
}

const isLoading = ref(false)

/**
 * Configure and retrieve default printer
 * @returns 
 */
async function configurePrinter() {
    const service = new PrintoutService()
    let printer = await service.getDefaultPrinter()
    if(isEmpty(printer)) printer = await service.selectDefaultPrinter()
    if(isEmpty(printer)) throw new Error ("No printer device found")
    return printer
}

/**
 * Print LBL using backend url
 * @param printer 
 * @param url 
 */
async function printLbl(printer: any, url: string) {
    const finalUrl = Url.updateUrlParamString(url, { raw: true });
    EventBus.emit(EventChannels.SHOW_MODAL, 'zebra-modal')

    console.time(url)
    const eplCommands = await Service.getText(finalUrl)

    if (!eplCommands) throw 'Unable to print Label. Try again later'
    if(printer?.port === "BT") {
        const service = new PrintoutService()
        return service.printToBluetoothDevice(printer!, eplCommands)
    }
    LabelPrinter.printLabel({
        eplCommands,
        name: printer.name,
        address: printer.address,
        url: await ApiClient.expandPath(finalUrl)
    })
    console.timeEnd(url)
    await delayPromise(2000)
}

/**
 * Generate label image for the printer
 * @param component 
 * @param componentProps 
 * @param width 
 * @param height 
 */
async function printLabelImage(printer: any, component: any, params: PrintLabelParams) {
    if (isLoading.value) return
    isLoading.value = true
    let componentProps: Record<string, any> = {}
    try {
        if (typeof params.onGenerateProps === 'function') {
            componentProps = await params.onGenerateProps()
        } else if (typeof params.lblUrl === 'string') {
            componentProps = await PrintoutService.getJson(
                url.removeParams(params.lblUrl), 
                url.extractParams(params.lblUrl)
            )
        }
        const modal = await modalController.create({
            id: "printout",
            component,
            backdropDismiss: false,
            cssClass: "small-modal",
            componentProps: {
                ...(componentProps?.data ?? componentProps),
                imageOut: async (images: string[]) => {
                    try {
                        const copies = params.copies ?? 1
                        const url = await ApiClient.expandPath(params.lblUrl)
                        for (let i = 0; i < copies; ++i) {
                            const res = images.map((image: string) => LabelPrinter.printLabel({
                                address: printer.address,
                                name: printer.name,
                                eplCommands: componentProps.zpl ?? "",
                                height: 352,
                                width: 562,
                                url: url ?? '',
                                image: typeof params.useImage === 'boolean' 
                                    ? params.useImage ? image : undefined 
                                    : image
                            }))
                            await Promise.all(res)
                        }
                    } catch (e) {
                        console.error(e)
                        toastWarning("Error printing label!")
                    }
                    setTimeout(() => modalController.getTop().then((e) => e && modal.dismiss()), 1000) 
                    isLoading.value = false
                }
            }
        });
        await modal.present()
    } catch (e) {
        console.error(e)
        isLoading.value = false
        modalController.getTop().then(v => v ? modalController.dismiss() : null)
        toastWarning("An error occurred while generating label")
    }
}

/**
 * Print a label component
 * @param labelComponent 
 * @param params 
 * @returns 
 */
export async function printLabel(labelComponent: any, params: PrintLabelParams) {
    const printer = await configurePrinter()
    if (/zebra/i.test(printer.name) || /Browser/i.test(printer.address) || printer.port === "BT") {
       return printLbl(printer, params.lblUrl)
    }
    return printLabelImage(printer, labelComponent, params)
}
