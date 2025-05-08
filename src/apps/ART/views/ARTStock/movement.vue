<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { CHARACTERS_AND_NUMBERS_LO } from "@/components/Keyboard/KbLayouts";
import Validation from "@/components/Forms/validations/StandardValidations";
import { DHAVerificationService } from "@/services/DHA_code_service"
import HisDate from "@/utils/Date";
import { StockService } from "./stock_service";
import { toastWarning, toastDanger, toastSuccess } from "@/utils/Alerts";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";
import { BadRequestError } from  "@/services/service"
import { isEmpty } from "lodash";
import dayjs from "dayjs";
import { toNumString } from "@/utils/Strs";

export default defineComponent({
  components: { HisStandardForm },
  data: () => ({
    activeField: "",
    fields: [] as any,
    drugs: [] as any,
    selectedDrugs: [] as any,
    barcode: "",
    stockService: {} as any,
  }),

  methods: {
    async onFinish(formData: any) {
      let errors: string[] = [];
      for (const drug of formData.enter_batches) {
        const data = {
          'reallocation_code': formData.authorization.value,
          quantity: drug.other.pack_size * drug.other.tins,
          date: formData.date.value,
          reason: drug.other.reason,
        }
        try {
          if (formData.task.value === "Relocations") {
            await this.stockService.relocateItems(drug.other.id, {
              ...data, 
              location_id: formData.relocation_location.value
            })
          } else await this.stockService.disposeItems(drug.other.id, data)
        } catch (e) {
          if (e instanceof BadRequestError && !isEmpty(e.errors)) {
            errors = errors.concat(e.errors.map((e: string) => `${e} for ${drug.other.drug_name}`));
          } else {
            errors.push(`${e}`)
          }
          console.log(e)
        }
      }
      if (isEmpty(errors)) {
        toastSuccess("Stock succesfully moved");
        return this.$router.push("/");
      }
      toastDanger(`${errors.join(',')}`);
    },
    getFields(): Array<Field> {
      return [
        {
          id: "task",
          helpText: "Select task",
          type: FieldType.TT_SELECT,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: "Relocations",
              value: "Relocations",
            },
            {
              label: "Disposal",
              value: "Disposal",
            },
          ],
        },
        {
          id: "relocation_location",
          helpText: "Destination",
          type: FieldType.TT_SELECT,
          validation: (val: Option) => Validation.required(val) || Validation.notTheSame(val.label, `${StockService.getLocationName()}`),
          condition: (val: any) => val.task.value === "Relocations" ,
          options: (_: any, filter = "") => getFacilities(filter),
          computedValue: (val: Option) => val.label,
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
        },
        {
          id: "date",
          dynamicHelpText: (f) => `Date of ${f.task.label}`,
          helpText: "Set date",
          type: FieldType.TT_FULL_DATE,
          validation: (val: any) => Validation.required(val),
        },
        {
          id: "select drugs",
          helpText: "Select drugs",
          type: FieldType.TT_MULTIPLE_SELECT,
          requireNext: true,
          validation: (val: any) => Validation.required(val),
          options: async (f: any, checked: Option[]) => this.getDrugs(checked, f.date.value),
          unload: (val: any) => (this.selectedDrugs = val),
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_MOVEMENT,
          beforeNext: (v: any, f: any, c: any, {currentFieldContext}: any) => {
            const drugsToStr = (drugs: any) => drugs.map((b: any) => `${b.label}`).join(' & ')
            const partialEntries = currentFieldContext.drugs.filter((drug: Option) => !drug.other.tins || !drug.other.reason);
            if (!isEmpty(partialEntries)) {
              const partialDrugs = drugsToStr(partialEntries)
              toastWarning(`Please fix partial batch entries for drugs: ${partialDrugs}`)
              return false
            }
            return true
          },
          options: () => this.selectedDrugs,
          validation: (val: any) => Validation.required(val),
          config: {
            getReasons: this.getReasons,
          }
        },
        {
          id: "authorization",
          helpText: "Enter authorization code",
          type: FieldType.TT_TEXT,
          config: {
            customKeyboard: [CHARACTERS_AND_NUMBERS_LO, [['Delete']]]
          },
          validation: (v: Option) => Validation.validateSeries([
            () => Validation.required(v),
            () => {
              const value = v.value as string
              const dha = new DHAVerificationService()
              return !dha.isValidDHACode(value.toUpperCase())
                ? ['Invalid authorization code']
                : null
            }
          ]), 
        },
        {
          id: "summary",
          helpText: "Summary",
          type: FieldType.TT_TABLE_VIEWER,
          options: (d: any) => this.buildResults(d),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
      ];
    },
    buildResults(formData: any) {
      const isRelocation = formData.task.value === 'Relocations'
      const columns = [
        "Drug",
        "Total Tins",
        "Expiry date",
        "Authorization code",
        "Reason"
      ];

      if (isRelocation) columns.push('Relocation')

      const rows = formData.enter_batches.map((drug: any) => {
        const data = [
          drug.other.drug_name,
          toNumString(drug.other.tins),
          HisDate.toStandardHisDisplayFormat(drug.other.expiry_date),
          formData.authorization.value.toUpperCase(),
          drug.other.reason
        ]
        if (isRelocation) data.push(formData.relocation_location.label)
        return data
      });
      return [
        {
          label: "Confirm entry",
          value: "Table",
          other: { columns, rows },
        },
      ];
    },
    async getDrugs(checked: Option[], date: string): Promise<Array<Option>> {
      const drugs = await this.stockService.getItems();
      return  drugs.map((drug: any) => {
        const name = drug?.drug_name ?? drug?.drug_legacy_name ?? 'N/A';
        const expireAt = HisDate.toStandardHisDisplayFormat(drug.expiry_date);
        const isChecked = checked.filter(c => c.label === name).length >= 1 
        return {
          label: name,
          value: drug.drug_id,
          isChecked,
          description: {
            color: "primary",
            show: "always",
            text: `Product Code: ${drug.product_code} - Batch Number: ${drug.batch_number} - Pack Size: ${drug.pack_size} - Expiry date: ${expireAt}`
          },
          other: {
            ...drug,
            tins: null,
            quantity: Math.trunc(drug.current_quantity / drug.pack_size) || 0,
            reason: ''
          },
        };
      })
      .filter((drug: any) => {
        return !(dayjs(date).isBefore(drug.other.delivery_date)) &&
          drug.other.current_quantity > 0
      });
    },
    mapToOptions(vals: string[]) {
      return vals.map((data) => {
        return { label: data, value: data };
      });
    },
    getReasons(drug: Option, formdata: any): any {
      if (formdata.task.value === "Relocations") {
        return this.mapToOptions([
          "Transfer to another facility/relocation",
          "For trainings",
        ]);
      } 
      const drugExpired = dayjs(drug.other?.expiry_date).isAfter(StockService.getSessionDate());
      const disposeReasons = ["Damaged", "Phased out", "Banned", "Missing"];
      if(!drugExpired) disposeReasons.push("Expired");
      return this.mapToOptions(disposeReasons);
    },
  },
  created() {
    this.stockService = new StockService();
    this.fields = this.getFields();
  },
});
</script>