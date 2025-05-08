import { nextTick, reactive, Ref, ref, watch } from "vue";
import { OrderService } from "../services/order_service";
import { alertConfirmation, toastWarning } from "../utils/Alerts";
import { find, findIndex, isEmpty } from "lodash";
import { Field, Option } from "../components/Forms/FieldInterface";
import { FieldType } from "../components/Forms/BaseFormElements";
import Validation from "../components/Forms/validations/StandardValidations";
import { LabOrderService } from "../services/lab_order_service";
import Store from "../composables/ApiStore"
import HisDate from "../utils/Date";
import { MultiStepPopupForm } from "../utils/PopupKeyboard";
import { modalController } from "@ionic/core";

let labService: LabOrderService;
const testIndicators = ref<any[]>([]);
const testOptions = ref<Array<Option>>([]);
const refresh = ref(Math.random());

const selectedTest = reactive({
  date: "",
  id: -1,
  indicators: [] as any[],
});


async function isValidResult(name: string, specimen: string, result: string) {
  if (name !== "HIV viral load") return true;
  const modifier = result.substring(0, 1);
  const value = result.substring(1, result.length);
  if (OrderService.isValidVLResult(specimen, modifier, value)) return true;
  const isOk = await alertConfirmation(
    `Invalid results for ${specimen} HIV viral load`,
    {
      cancelBtnLabel: "Process result",
      confirmBtnLabel: "Re-enter result",
    }
  );
  return !isOk;
}

function alphaValueIsValid(value: string) {
  return /^(>|<|=)(.*)/im.test(value);
}

function numericValueIsValid(value: string) {
  return /^(=|<|>)([0-9]*)$/im.test(value);
}

function isCrAgResult(name: string) {
  return /serum crag/i.test(name);
}

function isMalariaResult(name: string) {
  return /mrdt|malaria/i.test(name);
}

function isUrineLamResult(name: string) {
  return /Lam/i.test(name);
}

function isHIVViralLoadResult(name: string) {
  return /HIV viral load/i.test(name);
}

function isSpecialResult(name: string) {
  return isMalariaResult(name) || 
    isUrineLamResult(name) || 
    isCrAgResult(name)
}

function getResultDetails(name: string, form: any, index: number, value: string | number) {
  const specialResult = isSpecialResult(name);
  const type = specialResult ? "text" : form[`type_${index}`].value;
  const resultValue = specialResult
    ? `${value}`
    : (value as string).substring(1);  
  const modifier = specialResult ? "=" : (value as string).charAt(0);
  return {
    type,
    value: resultValue,
    modifier,
  };
}

function mapToIndicators(indicators: Array<any>, testId: number, specimen: string) {
  return indicators.map((i: any) =>({
    testId: testId,
    indicatorName: i.name,
    indicatorId: i.concept_id,
    specimen,
  }));
}

async function loadLabTests() {
  const orders = await labService.getTestsWithoutResults();
  const columns = ["Acession#", "Specimen", "Test", "Order date"];
  const rows: any[] = [];

  for (const order of orders) {
    for (const test of order.tests) {
      if (isEmpty(test.result)) {
        const indicators = await labService.getTestIndicators(test.concept_id);
        const mappedIndicators = mapToIndicators(indicators, test.id, order.specimen.name);
        testIndicators.value.push(...mappedIndicators);
        rows.push([
          order.accession_number,
          order.specimen.name,
          test.name,
          HisDate.toStandardHisDisplayFormat(order.order_date),
          {
            type: "button",
            name: "Enter result",
            action: () => {
              selectedTest.id = test.id;
              selectedTest.date = order.order_date;
              selectedTest.indicators = mappedIndicators;
              nextTick(getResultsDetailForm);
            }
          },
        ]);
      }
    }
  }

  testOptions.value = [{
    label: "",
    value: "",
    other: { rows, columns },
  }];
}

async function getResultsDetailForm() {
  return MultiStepPopupForm([
    {
      id: "result_date",
      helpText: "Result Date",
      type: FieldType.TT_DATE_PICKER,
      required: true,
      defaultValue: () => labService.getDate(),
      computedValue: (date: string) => date,
      config: {
        infoItems: (date: string) => ([
          { label: "Order Date", value: HisDate.toStandardHisDisplayFormat(selectedTest.date) },
          { label: "Result Date", value: HisDate.toStandardHisDisplayFormat(date) },
        ]),
        minDate: () => HisDate.toStandardHisFormat(selectedTest.date),
        maxDate: () => labService.getDate(),
      }
    },
    {
      id: `result_indicators`,
      helpText: `Select test result indicators`,
      type: FieldType.TT_MULTIPLE_SELECT,
      validation: (v: Option) => Validation.required(v),
      options: () => selectedTest.indicators.map((i: any) => ({
        label: i.indicatorName,
        value: i.indicatorId,
      })),
    },
    ...buildTestIndicatorFields(),
    {
      id: "entry_confirmation",
      helpText: "Confirm entry",
      type: FieldType.TT_TABLE_VIEWER,
      options: (_: any, c: any) => {
        const rows = Object.values(c)
          .filter(
            (d: any) =>
              typeof d === "object" && d != null && d.tag === "result_indicator"
          )
          .map((d: any) => [d.test, d.modifier, d.result]);
        return [
          {
            label: "",
            value: "",
            other: {
              rows,
              columns: ["Test", "Modifier", "Result"],
            },
          },
        ];
      },
    },
  ], async (_f: any, c: any) => {
    const measures = Object.values(c)
      .filter((d: any) => d.tag === "result_indicator" && d.measures)
      .map((d: any) => d.measures);
    
    const submitted = await submitLabResult(measures, c.result_date);
    if (submitted) {
      await loadLabTests();
      modalController.dismiss();
      refresh.value = Math.random();
    }
  })
}

function buildTestIndicatorFields(): Array<Field> {
  const fields: Array<Field> = [];

  for (const indicator of testIndicators.value) {
    const { indicatorName, indicatorId, testId, specimen } = indicator
    const fieldIndex = indicatorId * testId;

    const condition = (f: any) => {
      return selectedTest.id === testId && 
        findIndex(f.result_indicators, { label: indicatorName }) > -1;
    }

    const beforeNext = (option: Option) =>
      isValidResult(indicatorName, specimen, option.value as string);

    const computedValue = (v: Option, f: any) => {
      if (
        /^other$/i.test(v.value as string) &&
        isHIVViralLoadResult(indicatorName)
      ) {
        return {};
      }

      const { type, value, modifier } = getResultDetails(
        indicatorName,
        f,
        fieldIndex,
        v.value
      );

      const result = type === "numeric" ? parseInt(value) : value;
      const test = find(f.result_indicators, { label: indicatorName });

      return {
        tag: "result_indicator",
        measures: {
          indicator: {
            concept_id: test.value,
          },
          value: result,
          value_modifier: modifier,
          value_type: type,
        },
        result,
        modifier,
        test: test.label,
      };
    };

    fields.push(...[
      {
        id: `type_${fieldIndex}`,
        helpText: `Result type (${indicatorName})`,
        type: FieldType.TT_SELECT,
        group: "test_indicator",
        condition: (f: any) =>
          condition(f) &&
          !isMalariaResult(indicatorName) &&
          !isUrineLamResult(indicatorName) &&
          !isCrAgResult(indicatorName),
        appearInSummary: () => false,
        validation: (v: Option) => Validation.required(v),
        options: () => [
          {
            label: "Numeric (numbers only)",
            value: "numeric",
          },
          {
            label: "Alphanumeric(text and numbers)",
            value: "text",
          },
        ],
      },
      {
        id: `urine_result_${fieldIndex}`,
        helpText: `Select Test Result (${indicatorName})`,
        type: FieldType.TT_SELECT,
        group: "test_indicator",
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => condition(f) && isUrineLamResult(indicatorName),
        options: () => [
          {
            label: "Positive",
            value: "positive",
          },
          {
            label: "Negative",
            value: "negative",
          },
        ],
      },
      {
        id: `crag_result_${fieldIndex}`,
        helpText: `Select Serum CrAg Result (${indicatorName})`,
        type: FieldType.TT_SELECT,
        group: "test_indicator",
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => condition(f) && isCrAgResult(indicatorName),
        options: () => [
          {
            label: "Positive",
            value: "positive",
          },
          {
            label: "Negative",
            value: "negative",
          },
        ],
      },
      {
        id: `num_${fieldIndex}`,
        helpText: `Test Result (${indicatorName})`,
        type: FieldType.TT_TEXT,
        group: "test_indicator",
        computedValue,
        beforeNext,
        onValue: (v: Option) => {
          if (
            /hiv/i.test(indicatorName) &&
            v &&
            v.value &&
            !numericValueIsValid(v.value.toString())
          ) {
            toastWarning(
              "You must enter a modifer and numbers only. i.e =90 / >19 / < 750"
            );
            return false;
          }
          return true;
        },
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) =>
          condition(f) && f[`type_${fieldIndex}`].value === "numeric",
        config: {
          customKeyboard: [
            [
              ["1", "2", "3"],
              ["4", "5", "6", "=", "<", ">"],
              ["7", "8", "9", "."],
              ["", "0", ""],
            ],
            [["Delete"]],
          ],
        },
      },
      {
        id: `alpha_${fieldIndex}`,
        helpText: `Test Result (${indicatorName})`,
        type: FieldType.TT_TEXT,
        group: "test_indicator",
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) =>
          condition(f) &&
          f[`type_${fieldIndex}`].value === "text" &&
          !isHIVViralLoadResult(indicatorName),
      },
      {
        id: `VL_alpha_${fieldIndex}`,
        helpText: `Select Test Result (${indicatorName})`,
        type: FieldType.TT_SELECT,
        group: "test_indicator",
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) =>
          condition(f) &&
          f[`type_${fieldIndex}`].value === "text" &&
          isHIVViralLoadResult(indicatorName),
        options: () => [
          {
            label: "Collect Another Sample",
            value: "=Collect Another Sample",
          },
          {
            label: "<LDL",
            value: "<LDL",
          },
          {
            label: "=LDL",
            value: "=LDL",
          },
          {
            value: "Other",
            label: "Other",
          },
        ],
      },
      {
        id: `other_VL_alpha_${fieldIndex}`,
        helpText: `Test Result (${indicatorName})`,
        type: FieldType.TT_TEXT,
        group: "test_indicator",
        onValue: (v: Option) => {
          if (v && v.value && !alphaValueIsValid(v.value.toString())) {
            toastWarning(
              "You must enter a modifier plus result (for example =LDL)"
            );
            return false;
          }
          return true;
        },
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => {
          return (
            condition(f) &&
            f[`type_${fieldIndex}`].value === "text" &&
            isHIVViralLoadResult(indicatorName) &&
            f[`VL_alpha_${fieldIndex}`].value === "Other"
          );
        },
      },
      {
        id: `malaria_result_${fieldIndex}`,
        helpText: `Select Test Result (${indicatorName})`,
        type: FieldType.TT_SELECT,
        group: "test_indicator",
        computedValue,
        validation: (v: Option) => Validation.required(v),
        condition: (f: any) => condition(f) && isMalariaResult(indicatorName),
        options: () => {
          if (indicatorName.match(/mrdt/i)) {
            return [
              {
                label: "Positive",
                value: "positive",
              },
              {
                label: "Negative",
                value: "negative",
              },
            ];
          }
          return [
            {
              label: "Parasites seen",
              value: "parasites seen",
            },
            {
              label: "No parasites seen",
              value: "no parasites seen",
            },
          ];
        },
      },
    ])
  }

  return fields;
}

async function submitLabResult(measures: Array<any>, date: string) {
  try {
    await labService.createEncounter();
    await labService.createLabResult(measures, selectedTest.id, date);
    Store.invalidate('PATIENT_LAB_ORDERS');
    testIndicators.value = [];
    toastWarning("Lab result saved successfully");
    return true;
  } catch (error) {
    console.error(error);
    toastWarning("Failed to save lab result");
    return false;
  }
}

function getLabFields(inline: boolean = false): Array<Field> {
  return [
    {
      id: "test_type",
      helpText: "Tests without results",
      type: FieldType.TT_TABLE_VIEWER,
      condition: () => {
        if(!inline) return true;
        return !isEmpty(testOptions.value[0].other.rows);
      },
      init: async () => {
        await loadLabTests();
        return true;
      },
      options: () => testOptions.value,
      config: {
        hiddenFooterBtns: [
          "Clear",
        ],
      },
    },
  ];
}

export default function useLabResultsManager(patientId: number, providerId: number, formKey: Ref<number>) {
  labService = new LabOrderService(patientId, providerId);

  watch(refresh, () => formKey.value++, { deep: true });

  return {
    testIndicators,
    testOptions,
    getLabFields,
    isValidResult,
    buildTestIndicatorFields,
    loadLabTests,
    submitLabResult,
  };
}
