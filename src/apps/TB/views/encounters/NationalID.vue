<template>
    <ion-page>
      <his-standard-form 
        :cancelDestinationPath="patientDashboardUrl" 
        :onFinishAction="onFinish"
        :fields="fields"
        :skipSummary="true"
      />
    </ion-page>
  </template>
  
<script lang="ts" setup>
import { IonPage } from '@ionic/vue';
import { ref } from 'vue'
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import useEncounter from "@/composables/useEncounter";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Patientservice } from '@/services/patient_service';
import Store from "@/composables/ApiStore"
import { IdentifierService } from '@/services/identifier_service';
import { TbIdentifierType } from '../../meta/constants';
import { isEmpty } from 'lodash';
import { toastWarning } from '@/utils/Alerts';
import { useRoute } from 'vue-router';
import { NID_CONFIG } from '@/components/Keyboard/HisKbConfigurations';

const fields = ref<Field[]>([]);
const patientData = ref<Patientservice>()
const route = useRoute()

const hasMwID = () => !/unknown/i.test(patientData.value!.getMWNationalID())

const { goToNextTask, patientDashboardUrl } = useEncounter((i, p, patient) => {
    patientData.value = patient
    fields.value = [
        {
            id: "currentNationalID",
            helpText: "Current national identifier:",
            type: FieldType.TT_TEXT_BANNER,
            condition: () => !route.query.reassign && hasMwID(),
            options: () => {
                const id = `<b>${patient.getMWNationalID()}</b>`
                return [{ label: id, value: id }]
            } 
        },
        {
            id: 'patientIdentifier',
            helpText: 'Malawi National ID',
            type: FieldType.TT_TEXT,
            defaultValue: () => hasMwID() ? patient.getMWNationalID(): '',
            validation: (v: Option) => Validation.validateSeries([
                () => Validation.required(v),
                () => Validation.isMWNationalID(v)
            ]),
            config: {
                customKeyboard: NID_CONFIG
            }
        }
    ]
});

async function onFinish(f: any) {
    const idValue = `${f.patientIdentifier.value}`
    const idService = new IdentifierService()
    idService.identifierType = TbIdentifierType.MW
    if (!isEmpty((await idService.getPatientsByIdentifier(idValue)))) return toastWarning(
        "ID was already assigned", 15000
    )
    if (route.query.reassign) {
        const id = parseInt(`${route.query.reassign}`)
        await patientData.value!.changeMwNationalId(id, f.patientIdentifier.value)
    } else {
        await patientData.value!.updateMWNationalId(f.patientIdentifier.value)
    }
    Store.invalidate('ACTIVE_PATIENT')
    goToNextTask();
}
</script>
