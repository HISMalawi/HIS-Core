import { loadingController } from "@ionic/vue"
import v2Datatable from "@/components/DataViews/tables/v2PocDatatable/TableView.vue"
import { modalController } from "@ionic/vue"
import ArtDrilldown from "@/apps/ART/Components/ArtDrilldown.vue";
import router from "@/router";
import { toastDanger } from "./Alerts";

export interface ArtDrilldownParams {
    title: string;
    subtitle?: string;
    patientIdentifiers: number[];
}

export function addIndexes(list: any[]) {
    return list.map((l, i) => ({...l, index: i+1}))
}

export function addArvColumn(ref="arv_number", label="ARV#") {
    return { 
        ref,
        label,
        sortValue: (val: any) => {
            const match: any = `${val}`.match(/\w{2,5}-arv-(?<arvDigit>\d*)/i)
            return parseInt(match?.groups?.["arvDigit"] || "-1")
        }
    }
}

export function addViewPatientColumn(ref="patient_id", url="/patient/dashboard/") {
    return {
        ref,
        label: "Actions",
        exportable: false,
        toValue: () => "View",
        tdClick: ({refData}: any) => router.push(`${url}${refData}`) 
    }
}

export async function showV2TableModal(props: any) {
    if ((props.columnData??[]).length) {
        (await modalController.create({
            component: v2Datatable,
            backdropDismiss: false,
            cssClass: 'large-modal',
            componentProps: {
                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss()),
                ...props
            }
        })).present()
    }
}

export async function showArtDrilldown(params: ArtDrilldownParams) {
    if(params.patientIdentifiers.length) {
        (await modalController.create({
            component: ArtDrilldown,
            backdropDismiss: false,
            cssClass: 'large-modal',
            componentProps: {
                onFinish: () => modalController.getTop().then(v => v && modalController.dismiss()),
                ...params
            }
        })).present();
    }
}

/**
 * Wraps report generation code with loading management and error handling
 * @param callback 
 */
export async function wrapGeneration(callback: any, showLoader=true) {
    if (showLoader) {
        (await loadingController.create({ 
            message: "Please wait...", 
            backdropDismiss: false
        })).present()
    }
    try {
        const res = await callback()
        loadingController.getTop().then(v => v ? loadingController.dismiss() : null)
        return res
    } catch (e) {
        console.error(e)
        toastDanger("Unable to generate report")
    }
    loadingController.getTop().then(v => v ? loadingController.dismiss() : null)
}
