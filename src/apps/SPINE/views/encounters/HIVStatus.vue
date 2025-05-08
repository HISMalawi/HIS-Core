<template>
  <ion-page>
    <his-standard-form 
      :cancelDestinationPath="patientDashboardUrl" 
      :fields="fields" 
      :onFinishAction="onSubmit"
      skipSummary
    />
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from '@/components/Forms/validations/StandardValidations';
import { Field, Option } from '@/components/Forms/FieldInterface';
import { FieldType } from '@/components/Forms/BaseFormElements';
import { getFacilities } from '@/utils/HisFormHelpers/LocationFieldOptions';
import { EstimationFieldType, generateDateFields } from '@/utils/HisFormHelpers/MultiFieldDateHelper';
import { toastWarning } from '@/utils/Alerts';
import { HIVStatusService } from '../../services/hiv_status_service';
import useEncounter from '@/composables/useEncounter';
import { mapStrToOptions, resolveObs, yesNoUnknownOptions } from '@/utils/HisFormHelpers/commons';
import { IonPage } from '@ionic/vue';
import { Patientservice } from '@/services/patient_service';

let hivService: HIVStatusService;
const fields = ref<Array<Field>>([]);

const { patientDashboardUrl, goToNextTask } = useEncounter((providerId, patientId, patient) => {
  hivService = new HIVStatusService(patientId, providerId);
  fields.value = [
    getHIVStatusField(),
    ...getHivTestDateField(patient),
    getTestLocationField(),
    getCPTStartedField(),
    getOnARTField(),
    ...getArtStartDateField(patient),
    ...getArtDefaultDateField(patient),
    getCurrentArtLocationField(),
    getARTAdviceField(),
  ];
});

async function onSubmit(_formData: any, computedData: any){
  const encounter = await hivService.createEncounter()
  if (!encounter) return toastWarning('Unable to create encounter') 
  const data = await resolveObs({...computedData})
  const obs = await hivService.saveObservationList(data)
  if (!obs) return toastWarning('Unable to save observations')
  goToNextTask()     
}

function getARTAdviceField(): Field {
  return {
    id: "advised_to_visit_art",
    helpText: "Advised to visit ART",
    type: FieldType.TT_SELECT,
    options: yesNoUnknownOptions,
    condition: (f: any) => f.received_arvs.value !== "Yes",
    computedValue: (o: Option) => ({
      obs: hivService.buildValueCoded("Advised to visit ART", o.value)
    })
  }
}

function getCurrentArtLocationField(): Field {
  return {
    id: 'art_clinic_location',
    helpText: 'ART clinic location',
    type: FieldType.TT_SELECT,
    computedValue: (v: Option) => ({ obs: hivService.buildValueText('ART clinic location', v.label) }),
    validation: (val: any) => Validation.required(val),
    condition: (f: any) => /Yes|Defaulter/i.test(f.received_arvs.value),
    options: (_: any, filter='') => getFacilities(filter),
    config: {
        showKeyboard: true,
        isFilterDataViaApi: true
    }
  }
}

function getArtStartDateField(patient: Patientservice): Array<Field> {
  return generateDateFields({
    id: 'date_started_art',
    helpText: 'Started ART',
    required: true,
    condition: (f: any) => f.received_arvs.value === 'Yes',
    minDate: () => `${patient?.getBirthdate() ?? ''}`,
    maxDate: () => hivService.getDate(),
    estimation: {
        allowUnknown: true,
        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
    },
    computeValue: (date: string, isEstimate: boolean) => hivService.buildDateObs('Date ART started', date, isEstimate) 
  })
}

function getArtDefaultDateField(patient: Patientservice): Array<Field> {
  return generateDateFields({
    id: 'date_defualted_art',
    helpText: 'ART Default',
    required: true,
    condition: (f: any) => f.received_arvs.value === 'Defaulter',
    minDate: () => `${patient?.getBirthdate() ?? ''}`,
    maxDate: () => hivService.getDate(),
    estimation: {
        allowUnknown: true,
        estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
    },
    computeValue: (date: string, isEstimate: boolean) => hivService.buildDateObs('ART default date', date, isEstimate) 
  })
}

function getCPTStartedField(): Field {
  return {
    id: "cpt_started",
    helpText: "CPT Started",
    type: FieldType.TT_SELECT,
    options: yesNoUnknownOptions,
    condition: (f: any) => f.hiv_status.value === "Reactive",
    computedValue: (o: Option) => ({
      obs: hivService.buildValueCoded("CPT Started", o.value)
    })
  }
}

function getOnARTField(): Field {
  return {
    id: 'received_arvs',
    helpText: 'Started ART?',
    type: FieldType.TT_SELECT,
    computedValue: ({value}: Option) => ({ obs: hivService.buildValueCoded('ART Started', value) }),
    validation: (v: any) => Validation.required(v),
    options: () => mapStrToOptions([
      "Yes",
      "No",
      "Defaulter",
      "Unknown"
    ]),
    condition: (f: any) => f.hiv_status.value === "Reactive"
  }
}

function getHIVStatusField(): Field {
  return {
    id: 'hiv_status',
    helpText: 'HIV status',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    computedValue: (v: Option) => ({ obs: hivService.buildValueText('HIV status', v.label) }),
    options: () => mapStrToOptions([
      "Reactive",
      "Non-reactive",
      "Unknown"
    ])
  }
}

function getHivTestDateField(patient: Patientservice) {
  return generateDateFields({
    id: 'hiv_test_date',
    helpText: 'HIV Test',
    required: true,
    minDate: () => `${patient?.getBirthdate() ?? ''}`,
    maxDate: () => HIVStatusService.getSessionDate(),
    condition: (fields: any) => fields.hiv_status.value !== 'Unknown',
    summaryLabel: 'HIV test date',
    estimation: {
      allowUnknown: true,
      estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
    },
    computeValue: (date: string, isEstimate: boolean) => hivService.buildDateObs('HIV test date', date, isEstimate)
  })
}

function getTestLocationField(): Field {
  return {
    id: 'test_location',
    helpText: 'HIV test location',
    type: FieldType.TT_SELECT,
    validation: (value: any) => Validation.required(value),
    defaultValue: () => HIVStatusService.getLocationName(),
    computedValue: ({ label }: Option) => ({ obs: hivService.buildValueText('HIV test location', label) }),
    condition: (fields: any) => fields.hiv_status.value !== 'Unknown',
    options: (_: any, filter='') => getFacilities(filter),
    config: {
      showKeyboard: true,
      isFilterDataViaApi: true
    }
  }
}
</script>

