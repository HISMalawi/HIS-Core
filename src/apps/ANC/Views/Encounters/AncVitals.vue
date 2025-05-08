<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="patientDashboardUrl"
  >
  </his-standard-form>
</template> 
<script lang="ts" setup>
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { find, isEmpty } from "lodash";
import { Patientservice } from "@/services/patient_service";
import { infoActionSheet } from "@/utils/ActionSheets";
import { alertConfirmation } from "@/utils/Alerts";
import { computed, ref } from "vue";
import useEncounter from "@/composables/useEncounter";

const age = ref(0);
const recentHeight = ref(-1);
const recentWeight = ref(-1);
const recentWeightObsID = ref(-1);
const fields = ref<Array<Field>>([]);
let vitalsService: VitalsService;

const { patientDashboardUrl, goToNextTask } = useEncounter(onConfigure);

const weightOption: Option = {
  label: "Weight",
  value: "",
  other: {
    modifier: "KG",
    icon: "weight",
    required: true,
  },
}

const bpOption: Option = {
  label: "BP", 
  value: "", 
  other: {
    modifier: "mmHG", 
    icon: "bp"
  } 
}

const ageOption = computed(() => ({
  label: "Age",
  value: age.value,
  other: {
    doNotSave: true,
    modifier: "Years old", 
    icon: "", 
    visible: false 
  }
}));

const heightOption = computed(() => {
  const disableHeight = recentHeight.value > 0 && age.value > 18;
  return {
    label: "Height",
    value: `${disableHeight ? recentHeight.value : ''}`,
    other: {
      modifier: "CM",
      icon: "height",
      recentHeight: recentHeight.value,
      visible: !disableHeight
    }
  }
});

async function onConfigure (providerId: number, patientId: number, patient: Patientservice) {
  vitalsService = new VitalsService(patientId, providerId);
  const lastWeight = await VitalsService.getFirstObs(patientId, "Weight");
  recentWeight.value = parseFloat(`${ lastWeight?.value_numeric ?? 0}`);
  recentWeightObsID.value = parseInt(`${ lastWeight?.obs_id ?? -1 }`)
  age.value = patient.getAge();
  recentHeight.value = await patient.getRecentHeight();
  fields.value.push(getVitalsField())
}

function validateVitals(vitals: any) {
  const l = checkRequiredVitals(vitals);
  if (l.length > 0) {
    return l.map((val) => {
      return [`${val.label} can not be empty`];
    });
  }
  const v = sanitizeVitals(vitals);
  return vitalsService.validateAll(v);
}
    
function sanitizeVitals(vitals: Array<Option>) {
  return vitals.filter((element) => {
    if (element.label === "Height" && element.other.required == false) {
      return false;
    }
    return element.value !== "" && element.label !== "Age";
  })
}

function checkRequiredVitals(vitals: Array<Option>) {
  return vitals.filter((element) => {
    return element.value === "" && element.other.required === true;
  });
}

function onUpdateAlertStatus (params: Option[]) {
  const bp = find(params, { label: 'BP' })
  if (bp && bp.value != '') {
    const [sys, dis] = `${bp.value}`.split('/').map(v => parseInt(v))
    if (sys >= 140 && dis >= 90) {
      return {
        status: 'Client is at risk of pre-eclampsia, refer for urine protein test.',
        color: 'brown'
      }
    }
    if (sys < 120 || sys > 140) {
      return {
        status: 'Systolic reading is out of normal range',
        color: 'brown'
      }
    }
    if (dis < 80 || dis > 90) {
      return {
        status: 'Diastolic reading is out of normal range',
        color: 'brown'
      }
    }
    if ((sys >= 130 && sys <= 139) && (dis >= 80 && dis <= 89)) {
      return {
        status: 'Prehypertension',
        color: 'brown'
      }
    }
  }
  return { status: '', color: ''}
}

async function getFinalWeight(weightOption: Option): Promise<number> {
  const enteredWeight = weightOption.value as number;
  const weightChange = enteredWeight - recentWeight.value;
  const changePercentage = (Math.abs(weightChange) / recentWeight.value || 1) * 100;

  if (changePercentage > 30) {
    const prevWeightBtnTxt = `Use ${recentWeight.value} Kg`
    const newWeightBtnTxt = `Use ${enteredWeight} Kg`
    const action = await infoActionSheet(
      `Abnormal Weight Change`,
      `Previous Weight "${recentWeight.value} Kg". Current Weight "${enteredWeight} Kg"`,
      `Weight Reading has been ${ weightChange > 0 ? 'increased' : 'decresed'} by more than 30%. Please SELECT the correct Weight.)`,
      [
        {
          name: prevWeightBtnTxt,
          slot: 'start',
          color: 'success'
        },
        {
          name: newWeightBtnTxt,
          slot: 'end',
          color: 'danger'
        }
      ]
    )
    if (action === newWeightBtnTxt && recentWeightObsID) {
      if ((await alertConfirmation(`Do you want to void Weight observation for ${recentWeight.value}`))) {
        await VitalsService.voidObs(recentWeightObsID.value)
      }
    } else {
      return recentWeight.value
    }
  }
  return enteredWeight
}

async function onChangeOption (activeItem: Option) {
  if (!activeItem.value && activeItem.other.required) {
    throw `Value for ${activeItem.label} is required`
  }else if (activeItem.value) {
    const errs = vitalsService.validator(activeItem)
    if(errs && errs.length) throw errs
  }
  if(activeItem.label === "Weight" && recentWeight.value > 0) {
    activeItem.value = await getFinalWeight(activeItem);
  } 
}

function getVitalsField(): Field {
  return {
    id: "vitals",
    helpText: "Vitals entry",
    type: FieldType.TT_VITALS_ENTRY,
    validation: validateVitals,
    options: () => [
      weightOption,
      heightOption.value,
      bpOption,
      ageOption.value
    ],
    config: {
      onUpdateAlertStatus,
      onChangeOption,
      hiddenFooterBtns : ['Clear']
    }
  }
}

async function buildBpObs(bp: string) {
  const  [sys, dia] = bp.split("/");
  return [
    await vitalsService.buildValueNumber("Systolic", parseInt(sys)),
    await vitalsService.buildValueNumber("Diastolic", parseInt(dia))
  ]
}

async function buildVitalsObs(vitals: Array<Option>) {
  const obs = await Promise.all(vitals.filter(vital => !(vital.other?.doNotSave || isEmpty(vital.value)))
    .map(async (vital) => {
      if(vital.label === "BP") return buildBpObs(vital.value as string);
      if(vital.label === "Weight" && recentWeight.value > 0) {
        vital.value = await getFinalWeight(vital)
      }
      return vitalsService.buildValueNumber(vital.label, vital.value as number);
    }))
  return obs.flat();
}

async function isHeightConfirmed(vitals: Array<Option>) {
  const heightOption = find(vitals, {label: "Height"});
  if(heightOption?.value as number > 0) return true
  return !(await alertConfirmation("Patient has no height reading. Do you want to proceed without recording height?", {
    header: "HEIGHT CONFIRMATION",
    confirmBtnLabel: "Enter Height",
    cancelBtnLabel: "Proceed"
  }))
}

async function onFinish({ vitals }: any) {
  if(!(await isHeightConfirmed(vitals))) return 
  await vitalsService.createEncounter();
  const vitalObs = await buildVitalsObs(vitals);
  await vitalsService.saveObservationList(vitalObs);
  goToNextTask();
}
</script>
