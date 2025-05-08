<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    :onFinishAction="onFinish"
    :skipSummary="true"
    @onIndex="activeField=''"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import HisDate from "@/utils/Date";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";
import { StockService } from "./stock_service";
import { toastDanger, toastSuccess, toastWarning } from "@/utils/Alerts";
import { isEmpty } from "lodash";
import { toNumString } from "@/utils/Strs";
import { DrugCmsService } from "@/services/drug_cms_service";

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
      const items = this.prepDrugs(formData);
      const f = await this.stockService.postItems(items);
      if (f) {
        toastSuccess("Stock succesfully added");
        this.$router.push("/");
      } else {
        toastDanger("Could not save stock");
      }
    },
    getFields(): Array<Field> {
      return [
        {
          id: "transfer_origination",
          helpText: "Select where stock came from",
          type: FieldType.TT_SELECT,
          validation: (val: Option) => Validation.required(val),
          options: () => [
            {
              label: "DHA",
              value: "DHA",
            },
            {
              label: "Other location",
              value: "Other location",
            },
          ],
        },
        {
          id: "transfer_location",
          helpText: "Location",
          type: FieldType.TT_SELECT,
          validation: (val: Option) => Validation.required(val),
          condition: (val: any) => val.transfer_origination.value === "Other location",
          options: (_: any, filter = "") => getFacilities(filter),
          computedValue: (val: Option) => val.label,
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
        },
        {
          id: "barcode",
          helpText: "Scan barcode",
          type: FieldType.TT_BARCODE,

          config: {
            hiddenFooterBtns: ["Clear", "Next"],
          },
          onValue: async (id: string) => {
            this.barcode = id;
            this.activeField = "select_drugs";
          },
          condition: (val: any) => val.transfer_origination.value === "DHA"
        },
        {
          id: "select_drugs",
          helpText: "Select drugs",
          type: FieldType.TT_MULTIPLE_SELECT,
          requireNext: true,
          validation: (val: any) => Validation.required(val),
          options: () =>  this.drugs,
          unload: (val: any) => (this.selectedDrugs = val),
          config: {
            showKeyboard: true,
            footerBtns: [
              {
                name: "Select all",
                slot: "end",
                onClickComponentEvents: {
                  refreshOptions: () => {
                    this.drugs = this.selectAll(this.drugs);
                    return this.drugs;
                  },
                },
                onClick: () => "NONE",
              },
            ],
          },
        },
        {
          id: "date",
          helpText: "Delivery Date",
          type: FieldType.TT_FULL_DATE,
          validation: (val: Option) => Validation.required(val),
        },
        {
          id: "enter_batches",
          helpText: "Batch entry",
          type: FieldType.TT_BATCH_ENTRY,
          options: () => this.selectedDrugs,
          beforeNext: (_: any, f: any, c: any, {currentFieldContext}: any) => {
            const drugsToStr = (drugs: any) => drugs.map((b: any) => `${b.label}`).join(' & ')
            const drugsWithoutBatches = currentFieldContext.drugs.filter((drug: any) =>
              drug.entries.map((d: any) => !d.tins && !d.expiry && !d.batchNumber && !d.tabs).every(Boolean)
            )
            const partialBatches = currentFieldContext.drugs.filter((drug: any) => {
              return drug.entries.map((e: any) => {
                let score = 0
                if (e.tins) score += 1
                if (e.expiry) score += 1
                if (e.batchNumber) score += 1
                if (e.tabs) score += 1
                return score >= 1 && score <= 3
              }).some(Boolean)
            })
            if (!isEmpty(partialBatches)) {
              const partialDrugs = drugsToStr(partialBatches)
              toastWarning(`Please fix partial batch entries for drugs: ${partialDrugs}`)
              return false
            }
            if (!isEmpty(drugsWithoutBatches)) {
              const batchlessDrugs = drugsToStr(drugsWithoutBatches)
              toastWarning(`The following drug batches are empty: ${batchlessDrugs}`)
              return false
            }
            return true
          },
          validation: (v: Option) => Validation.required(v),
          config: {
            entryDate: (f: any) => f.date.value
          }
        },
        {
          id: "summary",
          helpText: "Summary",
          type: FieldType.TT_TABLE_VIEWER,
          options: (d: any) => this.buildResults(d.enter_batches),
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
      ];
    },
    buildResults(d: any) {
      const columns = [
        "Drug",
        "Amount per unit",
        "Tins/Pallets",
        "Expiry date",
        "Batch number",
      ];
      const rows = d.map((j: any) => {
        const d = j.value;
        return [
          d.short_name,
          d.tabs,
          toNumString(d.tins),
          HisDate.toStandardHisDisplayFormat(d.expiry),
          d.batchNumber,
        ];
      });
      return [
        {
          label: "Confirm entry",
          value: "Table",
          other: { columns, rows },
        },
      ];
    },
    prepDrugs(formdata: any) {
      const items: any[] = [];
      const barcode = this.barcode;
      const location = formdata.transfer_origination.value === "DHA" ? null : formdata.transfer_location.value;
      formdata.enter_batches.forEach((el: any) => {
        const element = el.value;
        items.push({
          'batch_number': element.batchNumber,
          'location_id': location,
          items: [
            {
              'barcode': barcode,
              'drug_id': element.drug_inventory_id,
              'expiry_date': element.expiry,
              'quantity': parseInt(element.tabs) * parseInt(element.tins),
              'delivery_date': formdata.date.value,
              'product_code': element.code,
              "pack_size": element.tabs,
            },
          ],
        });
      });
      return items;
    },
    selectAll(listData: Array<Option>) {
      return listData.map((l) => {
        l.isChecked = true;
        return l;
      });
    },
    async loadDrugs() {
      const allDrugs = await DrugCmsService.getDrugs({ pagenate: false});
      this.drugs = allDrugs.map((drug: any) => {
        return {
          label: `${drug.short_name} (${drug.code})`,
          value: drug,
        };
      });
    },
  },
  created() {
    this.stockService = new StockService();
    this.loadDrugs();
    this.fields = this.getFields();
  },
});
</script>