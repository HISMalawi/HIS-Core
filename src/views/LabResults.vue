<template>
  <his-standard-form
    :key="hisFormKey"
    :fields="fields"
    :skipSummary="true"
    @onFinish="goToPatientDashboard"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { Field } from "@/components/Forms/FieldInterface";

import useEncounter from "@/composables/useEncounter";
import useLabResultsManager from "@/composables/useLabResultsManager";

const fields = ref([] as Array<Field>);
const hisFormKey = ref(Math.random());

const { goToPatientDashboard } = useEncounter(async (providerId, patientId) => {
  const { getLabFields } = useLabResultsManager(patientId, providerId, hisFormKey);
  fields.value = getLabFields();

});
</script>
