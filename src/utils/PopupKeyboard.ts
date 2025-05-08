import { Field, FormOnCancelAction, FormOnFinishAction, SingleFieldFormOnFinishAction } from "@/components/Forms/FieldInterface";
import { modalController } from "@ionic/vue";
import TouchField from "@/components/Forms/SIngleTouchField.vue"
import TouchScreenForm from "@/components/Forms/TouchScreenForm.vue";
import Keypad from "@/components/Keyboard/HisKeypad.vue"

export async function MultiStepPopupForm(fields: Field[], onFinish: FormOnFinishAction, onCancel: FormOnCancelAction | null =null) {
    (await modalController.create({
        component: TouchScreenForm,
        backdropDismiss: false,
        cssClass: "full-modal",
        componentProps: {
            onFinish,
            fields: fields,
            skipSummary: true,
            disableAutoModalDismiss: true,
            cancelAction: () => {
                if (typeof onCancel === 'function') { 
                    onCancel()
                }
                modalController.dismiss()
            } 
        }
    })).present()
}

export async function numericKeypad(onValue: (num: any, toggle?: boolean) => void, params={} as any) {
    const useStrictNumbers = typeof params?.strictNumbers === 'boolean' ? params?.strictNumbers : true
    const modal = await modalController.create({
        component: Keypad,
        backdropDismiss: false,
        cssClass: 'keypad-modal custom-modal-backdrop',
        componentProps: {
            title: params?.title || '',
            preset: params?.preset || '',
            toggleButton: params?.toggleButton,
            strictNumbers: useStrictNumbers,
            customKeyboard: params?.customKeyboard,
            noFloat: typeof params?.noFloat === 'boolean'  ? params.noFloat : false,
            onKeyPress(val: string, toggle: boolean) {
                onValue(useStrictNumbers ? parseInt(val) : val, toggle)
            }
        }
    })
    modal.present()
}

export default async function PopupKeyboard(field: Field, onFinish: SingleFieldFormOnFinishAction, onCloseCallback: any=null) {
    const modal = modalController.create({
        component: TouchField,
        backdropDismiss: false,
        cssClass: "full-modal",
        componentProps: {
            dismissType: 'modal',
            currentField: field,
            onCloseCallback,
            onFinish
        }
    });
    (await modal).present();
    const data = (await modal).onDidDismiss()
    return data
}
