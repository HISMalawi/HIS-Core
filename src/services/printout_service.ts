import { Service } from "./service";
import { toastWarning } from "@/utils/Alerts";
import { EventChannels } from "@/utils/EventBus";
import EventBus from "@/utils/EventBus";
import { BluetoothSerial } from "@awesome-cordova-plugins/bluetooth-serial";
import { optionsActionSheet } from '@/utils/ActionSheets';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { PrinterDevice, LabelPrinter } from "cap-label-printer-plugin";
import nprogress from "nprogress";
import { delayPromise } from "@/utils/Timers";
import Url from "../utils/Url";
import ApiClient from "./api_client";

const TEST_EPL_COMMAND = `\nN\nq801\nQ329,026\nZT\nB50,180,0,1,5,15,120,N,"Barcode"\nA35,30,0,2,2,2,N,""\nA35,76,0,2,2,2,N,"Test Label Printing"\nA35,122,0,2,2,2,N,"Date: ${dayjs().format('DD/MMM/YYYY')}"\nP1\n`
        
export class PrintoutService extends Service {

    constructor() {
        super()
    }

    async print2(eplCommands: string, image?: string, width?: number, height?: number) {
        let printer = await this.getDefaultPrinter()
        if(isEmpty(printer)) printer = await this.selectDefaultPrinter()
        if(isEmpty(printer)) throw new Error ("No printer device found")
        if(printer?.port === "BT") {
            return this.printToBluetoothDevice(printer, eplCommands)
        }
        return LabelPrinter.printLabel({ 
            address: printer.address, 
            name: printer.name,
            height,
            width,
            eplCommands,
            image 
        });
    }

    private async _print(url: string) {
        const label = await Service.getJson(url)
        if (!label.zpl) {
            throw 'Unable to print Label. Try again later'
        }
        let printer = await this.getDefaultPrinter()
        if(isEmpty(printer)) printer = await this.selectDefaultPrinter()
        if(isEmpty(printer)) throw new Error ("No printer device found")
        if(printer?.port === "BT") {
            return this.printToBluetoothDevice(printer!, label.zpl)
        }
        return LabelPrinter.printLabel({ 
            address: printer.address, 
            name: printer.name,
            eplCommands: label.zpl, 
            url: await ApiClient.expandPath(Url.updateUrlParamString(url, { raw: true }))
        });
    }

    async batchPrintLbls(urls: string[], showPrintImage = true) {
        if(showPrintImage) EventBus.emit(EventChannels.SHOW_MODAL, 'zebra-modal')
        const errors: string[] = []
        for(const url of urls) {
            try {
                await this._print(url)
            } catch (e) {
                console.error(e)
                errors.push(e as any)
            }
        }
        if(showPrintImage) await PrintoutService.delay(2000)
        if (errors.length > 0) {
            // display unique errors only
            await toastWarning(errors.filter((value, index, self) => self.indexOf(value) === index).join(), 3000)
        } 
    }

    async printLbl(url: string, showPrintImage = true) {
        try {
            await delayPromise(250)
            if(showPrintImage) EventBus.emit(EventChannels.SHOW_MODAL, 'zebra-modal')
            await this._print(url)
            if(showPrintImage) await PrintoutService.delay(2000)
        } catch (e) {
            console.error(e)
            toastWarning(e as any)
        }
    }

    async getDefaultPrinter(): Promise<PrinterDevice | undefined> {
        const p = localStorage.getItem('defaultPrinter')
        try {
            return p && JSON.parse(p)
        } catch (error) {
            toastWarning(`${error}` , )
        }
    }

    async getUsbPrinters (): Promise<PrinterDevice[]> {
        try {
            const { devices } = await LabelPrinter.discover()
            return devices
        } catch (error) {
            console.log(error)
        }
        return []
    }

    async getBluetoothPrinters (): Promise<PrinterDevice[]> {
       try {
            const devices: any[] = await BluetoothSerial.list();
            return devices .map((p: any) => ({
                name: `${p.name} (${p.address})`,
                port: "BT",
                address: p.address
            }))
       } catch (error) {
            console.log(error)
       }
       return []
    }

    async getAllPrinters () {
        nprogress.start()
        const uPrinters = await this.getUsbPrinters();
        const bPrinters = await this.getBluetoothPrinters()
        nprogress.done()
        return [...uPrinters, ...bPrinters]
    }

    async selectDefaultPrinter(): Promise<PrinterDevice | undefined> {
        let defualtPrinter: PrinterDevice | undefined  = undefined;

        const printers = await this.getAllPrinters()
        if (printers.length === 0) {
            toastWarning('No printers found. Please connect a printer or make sure a bluetooth printer is paired')
            return
        }
        if(printers.every(p => p.address === "webPrinter")) {
            defualtPrinter = printers[0];
        }
        if(isEmpty(defualtPrinter)){
            const option = await optionsActionSheet(
                "Select Printer",
                "Please, select default printer",
                printers.map(p => p.name || p.address),
                [
                    { name: 'Cancel', slot:'start', color: 'danger' },
                    { name: 'Refresh', slot:'end', color: 'primary' },
                    { name: 'Continue', slot: 'end', role: 'action' }
                ]
            )
    
            if(option.action === 'Cancel') return
            if(option.action === 'Refresh') return this.selectDefaultPrinter()
    
            defualtPrinter = printers.find(p => {
                return p.name === option.selection || 
                    p.address === option.selection
            }) as PrinterDevice
        }
        
        if(defualtPrinter) this.setDefaultPrinter(defualtPrinter)

        return defualtPrinter
    }

    setDefaultPrinter (printer: PrinterDevice) {
        if(!isEmpty(printer)) {
            localStorage.setItem('defaultPrinter', JSON.stringify(printer))
        }
    }

    async printTestLbl(printer: PrinterDevice) {
        try {
            EventBus.emit(EventChannels.SHOW_MODAL, 'zebra-modal')
            if(printer?.port === "BT") {
                return this.printToBluetoothDevice(printer!, TEST_EPL_COMMAND)
            }
            LabelPrinter.printLabel({ address: printer.address, name: printer.name, eplCommands: TEST_EPL_COMMAND  });
        } catch (error) {
            toastWarning(`${error}`)
        }
    }

    printToBluetoothDevice(printer: PrinterDevice, labelData: string) {
        BluetoothSerial.connect(printer?.address || '').subscribe(async () => {
            BluetoothSerial.write(labelData)
                .catch((e) => toastWarning(e))
                .finally(() => BluetoothSerial.disconnect())
        }, e => toastWarning(e))
    }

}