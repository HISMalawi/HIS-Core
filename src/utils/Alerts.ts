import { toastController, modalController } from "@ionic/vue";
import ConfimationSheet from "@/components/DataViews/actionsheet/ConfirmationSheet.vue"
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
import SummaryModal from "@/apps/OPD/components/RegistrationSummaryModal.vue";

interface AlertConfirmationOtions {
  header?: string;
  confirmBtnLabel?: string;
  cancelBtnLabel?: string;
}

async function toast(message: string, color="primary", duration=2000) {
    const toast = await toastController.create({
      message: message,
      position: "top",
      animated: true,
      duration: duration,
      color: color,
      cssClass: 'his-md-text',
      keyboardClose: true,
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    return toast.present();
}

export function toastInfo(message: string, duration=2000) {
  return toast(message, 'primary', duration)
}

export function toastWarning(message: string, duration=2000) {
  return toast(message, 'warning', duration)
}

export function toastSuccess(message: string, duration=1000) {
  return toast(message, 'success', duration)
}

export function toastDanger(message: string, duration=2000) {
  return toast(message, 'danger', duration)
}

export function createAlert(message: string, header= '' as string, btns = [] as Array<NavBtnInterface>) {
  return modalController.create({
    component: ConfimationSheet,
    backdropDismiss: false,
    cssClass: "small-modal custom-modal-backdrop",
    componentProps: {
      subtitle: header,
      body: message,
      actionButtons: btns
    }
})
}

export async function alertConfirmation(message: string, options = {} as AlertConfirmationOtions) {
  const alert = await createAlert(message, options.header || 'Confirmation', [
    {
      name: options.cancelBtnLabel || 'No',
      size: 'large',
      slot: 'start',
      color: 'danger',
      visible: true,
      role: 'Cancel',
      onClick: ({role}: any) => modalController.dismiss(role)
    },
    {
        name: options.confirmBtnLabel || 'Yes',
        size: 'large',
        slot: 'end',
        color: 'success',
        visible: true,
        role: 'Confirm',
        onClick: ({role}: any) => modalController.dismiss(role)
    }
  ])
  alert.present()
  const { data } = await alert.onDidDismiss()
  return data === 'Confirm' 
}

export async function infoAlert(message: string, header="Information") 
{
  const alert = await createAlert(message, header, [
    {
      name: "OK",
      size: 'large',
      slot: 'end',
      color: 'success',
      visible: true,
      role: 'Confirm',
      onClick: () => modalController.dismiss()
    }
  ]) 
  alert.present() 
}

export async function showSummaryModal(data: any) {
  const modal = await modalController.create({
    component: SummaryModal,
    backdropDismiss: true,
    cssClass: 'action-sheet-modal',
    componentProps: {
      list: data
    } 
  })
  modal.present()
}