import MwNationIDService from "@/services/national_identifier_service"
import PopupKeyboard from "@/utils/PopupKeyboard";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";
import { infoActionSheet, tableActionSheet } from "@/utils/ActionSheets";
import { isEmpty } from "lodash";
import { toSentenceCase } from "@/utils/Strs";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Patientservice } from "@/services/patient_service";
import PersonField from "@/utils/HisFormHelpers/PersonFieldHelper"
import Store from "@/composables/ApiStore"
import { toastSuccess } from "../utils/Alerts";

async function onScanQr(text: string) {
    const mwService = new MwNationIDService()
    const qrData = mwService.parseQrCode(text)

    if (qrData) {
        toastSuccess(`Detected a ${qrData.docType}...`, 2000)

        if (!(await Store.get('IS_MW_NATIONAL_ID_SCANNER_ENABLED'))) {
            await infoActionSheet(
                qrData.docType,
                'NRB ID verification is currently disabled, please check your system preferences',
                '',
                [
                    {
                        name: "Ok",
                        slot: "end",
                        color: "primary"
                    }
                ]
            )
            return
        }
    } else {
        return
    }

    if (!mwService.hasIdentifierCode()) {
        toastWarning("Missing National ID Code. Please scan again", 3000)
        return
    }

    // Warn user if doc is incomplete during registration process
    if (!mwService.isDocComplete()) {
        const confirmed = await alertConfirmation(`${qrData.docType} scanned is missing key information. Do you want to rescan again?`)
        if (confirmed) return toastSuccess(`Please rescan ${qrData.docType} again!`, 2500)
    }

    const patients = await mwService.findPatientByID()

    if (patients.length === 1) {
        const diffs = mwService.verifyIdentity()
        if (!isEmpty(diffs) && mwService.isDocComplete()) {
            const action = await tableActionSheet(
                `1 Client found with ID ${qrData!.identifier}`,
                `EMR and ${qrData.docType} demographics are not matching!`,
                ['Attribute', qrData.docType, 'EMR'],
                diffs,
                [
                    {
                        name: 'Cancel',
                        slot: 'start',
                        color: 'danger'
                    },
                    {
                        name: 'Override EMR Data',
                        slot: 'start',
                        color: 'primary'
                    }
                ]
            )
            return action === 'Override EMR Data' ? { person: (await mwService.syncWithIdData()), qrData } : undefined
        } else {
            return { qrData, person: patients[0] }
        }
    } else if (isEmpty(patients)) {
        const otherPossibleMatches = await mwService.findByDemographics()
        const launchResultDialog: any = async () => {
            const action = await tableActionSheet(
                `National ID "${mwService.identity.identifier}" not registered in the EMR`,
                !otherPossibleMatches.length 
                    ? `Do you want to register client with the following information?`
                    : `${qrData.docType} information`,
                [ 'ID document attribute', 'ID document value' ],
                [
                    'docType',
                    'given_name', 
                    'family_name', 
                    'gender', 
                    'birthdate', 
                    'identifier'
                ].map((str: string) => [
                    toSentenceCase(str).replaceAll('_', ' '), mwService.identity[str] || "-" 
                ]),
                [
                    {
                        name: 'Cancel',
                        slot: 'start',
                        color: 'danger'
                    },
                    {
                        name: 'Register New',
                        color: 'primary',
                        slot: 'start'
                    },
                    ...(() => {
                        if (otherPossibleMatches.length) return [{
                            name: `Review (${otherPossibleMatches.length}) found`,
                            color: 'success',
                            slot: 'start'
                        }]
                        return []
                    })(),
                ]
            )

            if (/review/i.test(action)) {
                const val = await PopupKeyboard({
                    id: "duplicates",
                    helpText: "Possible matches",
                    type: FieldType.TT_PERSON_RESULT_VIEW,
                    options: () => otherPossibleMatches.map((item: any) => PersonField.getPersonAttributeOptions(item))
                }, () => {})
                if (val.data.value && !val.data.forcedClosed) {
                    if (await alertConfirmation(`Do you want to link selected client to National ID "${qrData.identifier}"?`)) {
                        await (new Patientservice(val.data.value.other.person)).updateMWNationalId(qrData.identifier)
                       return { qrData, person: val.data.value.other.person }
                    } else {
                        return launchResultDialog()
                    }
                } else if (val.data.forcedClosed) {
                    return launchResultDialog()
                }
            }
            if (action === 'Register New') return { qrData }
        }
        return launchResultDialog()
    }
}

export default {
    onScanQr,
    isNrbType: (text: string) => {
        const mwService = new MwNationIDService()
        const qrData = mwService.parseQrCode(text)
        return !isEmpty(qrData)
    }
}
