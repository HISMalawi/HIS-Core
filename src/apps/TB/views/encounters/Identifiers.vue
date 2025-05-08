<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true" />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { IonPage } from '@ionic/vue';
import { Field } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import { ref } from 'vue'
import popVoidReason from '@/utils/ActionSheetHelpers/VoidReason';
import HisApp from "@/apps/app_lib"
import { toDate } from '@/utils/Strs';
import { PatientIdentifierService } from '@/services/patient_identifier_service';
import Store from "@/composables/ApiStore"
import { alertConfirmation } from '@/utils/Alerts';

const fields = ref<Field[]>([]);
const app: any = HisApp.getActiveApp()

const { patientDashboardUrl, goToNextTask } = useEncounter((providerId, patientId, patient) => {
    const identifiersField = () => {
        let context: any = {}
        const ids: any = []
        return {
            id: "ids",
            helpText: "Patient Identifiers",
            type: FieldType.TT_TABLE_VIEWER,
            onload: (c: any) => context = c,
            init: async () => {
                for(const idName in app.programPatientIdentifiers) {
                    const data = app.programPatientIdentifiers[idName]
                    patient.patient.patient_identifiers.forEach((id) => {
                        if (id.type.patient_identifier_type_id === data.id) {
                            ids.push({
                                type: idName,
                                idName: id.identifier,
                                created: toDate(id.date_created),
                                id: id.patient_identifier_id,
                                reassign: async () => {
                                    if (typeof data.reassignAction === 'function' &&
                                        (await alertConfirmation(`Are you sure you want to modify ${idName} ${id.identifier}`))) {
                                            data.reassignAction(
                                                patientId, 
                                                id.patient_identifier_id, 
                                                id.identifier,
                                                idName
                                            )
                                        } 
                                }
                            })
                        }
                    })
                }
                return true
            },
            options: () => {
                const rows = ids.map((r: any) => {
                    return [
                        r.type,
                        r.idName,
                        r.created,
                        {
                            name: "Void",
                            type: "button",
                            color: "danger",
                            action: () => popVoidReason(async (reason: string) => {
                                await PatientIdentifierService.voidIdentifier(r.id, reason)
                                Store.invalidate('ACTIVE_PATIENT')
                                context.rows = context.rows.filter((row: any) => row[row.length-1].id != r.id)
                            })
                        },
                        {
                            id: r.id,
                            name: "Reassign",
                            type: "button",
                            action: () => r.reassign()
                        }
                    ]
                })
                return [{
                    label: "", 
                    value: "", 
                    other: {
                        columns: ["Identifier", "Type", "Date Created", "Void", "Reassign"],
                        rows
                    }
                }]
            }
        }
    }
    fields.value = [
        identifiersField(),
    ]
});

function onFinish() {
    goToNextTask();
}
</script>
  