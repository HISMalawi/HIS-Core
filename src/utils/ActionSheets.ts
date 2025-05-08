import TableSheet from "@/components/DataViews/actionsheet/TableActionSheet.vue"
import InfoSheet from "@/components/DataViews/actionsheet/InfoActionSheet.vue"
import RadioSheet from "@/components/DataViews/actionsheet/RadioActionSheet.vue"
import ListSheet from "@/components/DataViews/actionsheet/InfoListActionSheet.vue"
import { modalController } from "@ionic/vue";

/**
 * Ionic 5 has a bug where when you open a modal using modalController.create() it creates duplicate modals on the same div.
 * This issue mostly happens when openning another modal immediately after closing the previous one.
 * This function is a workaround to detect duplicate elements and remove them. 
 * 
 * We query the DOM exponetially every X amount of milliseconds to check for duplicate elements in the modal.
 */
function sanitizeModal() {
    const detectDuplicateModal = (retryCount: number, sleep: number) => {
        setTimeout(() => {
            const modals = document.getElementsByClassName("modal-wrapper")
            if (modals.length) {
                const modal = modals[0]
                const headers = modal.getElementsByTagName('ion-header')
                if (headers.length >= 2) {
                    headers[1].remove()
                } else {
                    if (retryCount < 20) { 
                        detectDuplicateModal(retryCount+1, sleep + 100)
                    }
                }
                const content = modal.getElementsByTagName('ion-content')
                if (content.length >= 2) {
                    content[1].remove()
                }
                const footer = modal.getElementsByTagName('ion-footer')
                if (footer.length >= 2) {
                    if (footer[1].parentElement) footer[1].parentElement.remove()
                }
            } else {
                if (retryCount < 5) { 
                    detectDuplicateModal(retryCount+1, sleep + 100)
                }
            }
        }, sleep)
    }
    detectDuplicateModal(0, 0)
}

export async function tableActionSheet(
    title: string,
    subtitle: string,
    columns: Array<string>,
    rows: Array<string>,
    actionButtons: Array<any>,
    color = '',
    rowColors:  Array<any>=[])
    {
        const modal = await modalController.create({
        component: TableSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            subtitle,
            columns,
            rows,
            rowColors,
            actionButtons,
            color
        }
        })
        await modal.present()
        sanitizeModal()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function listActionSheet(
    title: string,
    subtitle: string,
    list: Array<string>,
    actionButtons: Array<any>,
    color = '')
    {
        const modal = await modalController.create({
        component: ListSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            subtitle,
            actionButtons,
            list,
            color
        }
        })
        await modal.present()
        sanitizeModal()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function infoActionSheet(
    title: string, 
    bodyTitle: string,
    bodyText: string,
    actionButtons: Array<any>,
    color = '')
    {
        const modal = await modalController.create({
        component: InfoSheet,
        backdropDismiss: false,
        cssClass: "action-sheet-modal",
        componentProps: {
            title,
            bodyTitle,
            bodyText,
            actionButtons,
            color
        }
        })
        await modal.present()
        sanitizeModal()
        const { data } = await modal.onDidDismiss()
        return data.action
    }

export async function optionsActionSheet(
    title: string, 
    subtitle: string, 
    list: Array<string>, 
    actionButtons: Array<any>,
    color = 'darkred',
    size = 'action-sheet-modal')
    {
        const modal = await modalController.create({
        component: RadioSheet,
        backdropDismiss: false,
        cssClass: size,
        componentProps: {
            title,
            subtitle,
            color,
            list,
            actionButtons
        }
        })
        await modal.present()
        sanitizeModal()
        const { data } = await modal.onDidDismiss()
        return data
    }
