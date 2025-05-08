import { optionsActionSheet } from '@/utils/ActionSheets'

export type PopVoidResoanCallback = (selection: string) => Promise<void>

export default async function popVoidReason(callback: PopVoidResoanCallback, size = 'action-sheet-modal') {
    const modal = await optionsActionSheet(
        'Are you sure you want to void record?',
        'Please specify reason for voiding this record',
        [
          'Mistake/ Wrong Entry',
          'Duplicate',
          'System Error' 
        ],
        [
            { name: 'Cancel', slot:'start'},
            { name: 'Void', color: 'danger', slot:'end', role: 'action'}
        ],
        '',
        size
    )
    if (modal.selection && modal.action === 'Void') {
        await callback(modal.selection)
    }
}
