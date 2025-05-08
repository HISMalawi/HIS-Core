<template>
  <IonPage>
    <HisStandardForm skip-summary :fields="fields" :onFinishAction="submit" />
  </IonPage>
</template>

<script setup lang="ts">
import { DrugPrescriptionService } from "@/apps/AETC/services/drug_prescription_service";
import { ANTI_MALARIA_DRUGS, DRUG_FREQUENCIES } from "@/apps/OPD/services/drug_prescription_service";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { Field, Option } from "@/components/Forms/FieldInterface";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import useEncounter from "@/composables/useEncounter";
import { alertConfirmation } from "@/utils/Alerts";
import { MultiStepPopupForm } from "@/utils/PopupKeyboard";
import { IonPage, modalController } from "@ionic/vue";
import GlobalProps from "../apps/OPD/opd_global_props";
import HisDate from "@/utils/Date";
import { isEmpty } from "lodash";
import { ref } from "vue";
import { printOpdVisitSummary } from "@/apps/OPD/Labels";
import { FLOAT_KEYPAD } from "@/components/Keyboard/KbLayouts";

const fields = ref<Array<Field>>([]);
let context: any;
let service: DrugPrescriptionService;

const { goToNextTask } = useEncounter((providerID, patientID) => {
  service = new DrugPrescriptionService(patientID, providerID);
  fields.value = [
    getDrugSelectionField(),
    getSummaryField(),
  ];
});

async function submit(formData: any) {
  const drugOrders = toDrugOrders(formData.drug_selection);
  try {
    await service.createEncounter();
    await service.createDrugOrder(drugOrders);
    if(await GlobalProps.isSummaryPrintingEnabled() ?? false) {
      printOpdVisitSummary(service.patientID);
    }
    goToNextTask();
  } catch (error) {
    console.error(error);
    
  }
}

function toDrugOrders(drugs: Array<Option>): Array<Record<string, any>> {
  const startDate = DrugPrescriptionService.getSessionDate();
  return drugs.map((drug) => {
    const frequency = DRUG_FREQUENCIES.find((f) => f.code === drug.other.frequency) as typeof DRUG_FREQUENCIES[0]; 
    return {
      'drug_inventory_id': drug.other.drug_id,
      'equivalent_daily_dose': drug.other.dosage=='Unknown'? 0 : drug.other.dosage * frequency?.value || 0,
      'start_date': startDate,
      'auto_expire_date': calculateExpireDate(startDate, drug.other.duration), 
      'units': drug.other.units,
      'instructions': `${drug.label}: ${drug.other.dosage} ${drug.other.units} ${frequency?.code || ''} for ${drug.other.duration} days`,
      'dose': drug.other.dosage,
      'frequency': frequency?.code || '',
    };
  });
}

function calculateExpireDate(startDate: string | Date, duration: any ) {
  const date = new Date(startDate)
  date.setDate(date.getDate() + parseInt(duration))
  return HisDate.toStandardHisFormat(date)
}

async function hasMalaria(): Promise<boolean> {
  const result = await service.hasMalaria() ||
    alertConfirmation("Patient has no malaria. Do you still want to prescribe anti malaria drugs?");
  return result;
}

async function selectMalariaDrugs() {
  if(await hasMalaria()) {
    await MultiStepPopupForm(
      [
        {
          id: "malaria_drug",
          helpText: "Select the malaria drug to be prescribed",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          options: () => ANTI_MALARIA_DRUGS.map((drug) => ({
            value: drug.name,
            label: drug.name,
            other: {
              ...drug,
              dosage: drug.dose_strength,
              frequency: DRUG_FREQUENCIES.find((f) => f.value === drug.frequency)?.code,
            },
          })),
        },
      ],
      async (formData: any) => {
        context.checkedItems.push({
          ...formData.malaria_drug,
          isChecked: true,
        })
        await modalController.dismiss();
      }
    );
  }
}

function isCompletePrescription(drug: Record<string, any>): boolean {
  return drug.dosage && drug.frequency && drug.duration;
}

async function getPrescriptionDetails(drug: Option) {
  return new Promise<any>((resolve) => {
    MultiStepPopupForm(
      [
        {
          id: "frequency",
          helpText: `Select the frequency for ${drug.label}`,
          type: FieldType.TT_SELECT,
          requireNext: false,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option) => v.value,
          options: () => DRUG_FREQUENCIES.map((frequency) => ({
            value: frequency.code,
            label: frequency.label,
            other: frequency,
          })),
        },
        {
          id: "dosage",
          helpText: `Enter the dosage for ${drug.label}`,
          type: FieldType.TT_NUMBER,
          defaultValue: () => drug.other.dose_strength,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option) => Number(v.value),
          config: { keypad: [
            FLOAT_KEYPAD,
            [
              ["DELETE"]
            ]
          ]}
        },
        {
          id: "duration",
          helpText: `Enter the duration for ${drug.label}`,
          type: FieldType.TT_NUMBER,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option) => Number(v.value),
        },
      ],
      async (_formData: any, computedData: any) => {
        await modalController.dismiss();
        resolve(computedData);
      },
      () => resolve({}),
    );
  });
}

function getDrugSelectionField(): Field {
  return {
    id: "drug_selection",
    helpText: "Select the drugs to be prescribed",
    type: FieldType.TT_INFINITE_SCROLL_MULTIPLE_SELECT,
    onload: (ctx: any) => context = ctx,
    validation: (data: any) => Validation.required(data),
    options: async (_, filter = "", page = 1, limit = 10) => service.getDrugs(filter, page, limit),
    onValueUpdate: async (drugs: Array<Option>) => {
      for (let i = 0; i < drugs.length; i++) {
        if(drugs[i].isChecked && !isCompletePrescription(drugs[i].other)){
          const details = await getPrescriptionDetails(drugs[i]);
          if(isEmpty(details)) {
            drugs.splice(i, 1);
          }
          else {
            drugs[i].other = {
              ...drugs[i].other,
              ...details
            }
            // clear search filter
            context.filter = "";
            context.selected = "";
          }
        }
      }
      return drugs;
    },
    config: {
      isFilterDataViaApi: true,
      showKeyboard: true,
      footerBtns: [
        {
          name: "Predefined Malaria Drugs",
          color: "primary",
          size: "large",
          visible: false,
          slot: "end",
          onClick: selectMalariaDrugs,
        },
      ],
    },
  };
}

function getSummaryField(): Field {
  return {
    id: "summary",
    helpText: "Prescribed Drugs",
    type: FieldType.TT_TABLE_VIEWER,
    options: (fields: any) => {
      const columns = ["Drug", "Dosage", "Frequency", "Duration"];
      const rows = fields.drug_selection.map((drug: any) => [
        drug.label,
        drug.other.dosage,
        DRUG_FREQUENCIES.find((f) => f.code === drug.other.frequency)?.label,
        drug.other.duration,
      ]);
      return [{
        label: "Prescribed Drugs",
        value: "",
        other: {
          columns,
          rows,
        },
      }]
      
    }
  };
}
</script>
