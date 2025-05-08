import { alertConfirmation } from "@/utils/Alerts"
import { actionSheetController } from "@ionic/vue"
import { isEmpty } from "lodash"

export async function voidWithReason(callback: (role: string) => Promise<void>, customReasons=[] as string[]) {
    const confirm = await alertConfirmation('Are you sure you want to void?')
    if (!confirm) {
      return
    }
    let buttons = [
      {
        text: 'Mistake/ Wrong Entry',
        role: 'Mistake/ Wrong Entry'
      },
      {
        text: 'Duplicate',
        role: 'Duplicate'
      },
      {
        text: 'System Error',
        role: 'System Error'
      },
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ]
    if (!isEmpty(customReasons)) {
      buttons = customReasons.map(
        (r: string) => ({
          text: r, role: r
        }))
      buttons.push({ text: 'Cancel', role: 'Cancel'})
    }
    const actionSheet = await actionSheetController.create({
      header: 'Are you sure you want to void this Encounter?',
      subHeader: 'Please specify reason for voiding this encounter',
      mode: 'ios',
      buttons
    })
    actionSheet.present()
    const { role } = await actionSheet.onDidDismiss();
    if (role != 'cancel') {
        callback(role as string)
    }
}
