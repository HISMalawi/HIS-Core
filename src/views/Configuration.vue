<template>
  <his-standard-form :fields="fields" @onSubmit="onSubmit" @onFinish="onFinish" :skipSummary="true" v-if="fields.length > 0"/>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements"
import { GlobalPropertyService } from "@/services/global_property_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { toastSuccess } from "@/utils/Alerts"
import Validation from "@/components/Forms/validations/StandardValidations"
import Store from "@/composables/ApiStore"
import {GLOBAL_PROP} from "@/apps/GLOBAL_APP/global_prop"
import {ART_GLOBAL_PROP} from "@/apps/ART/art_global_props"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      GlobalPropertyService.set(this.property , formData.preference)
      .then(() => {
        switch(this.property) {
          case GLOBAL_PROP.DDE_ENABLED:
            Store.invalidate('IS_DDE_ENABLED')
            break;
          case ART_GLOBAL_PROP.DRUG_MANAGEMENT:
            Store.invalidate('IS_ART_DRUG_MANAGEMENT_ENABLED')
            break
          case GLOBAL_PROP.MILITARY_SITE:
            Store.invalidate('IS_MILITARY_SITE')
            break;
          case ART_GLOBAL_PROP.FAST_TRACK:
            Store.invalidate('IS_ART_FAST_TRACK_ENABLED')
            break;
          case ART_GLOBAL_PROP.HTN_ENHANCEMENT:
            Store.invalidate('IS_ART_HTN_ENABLED')
            break;
          case ART_GLOBAL_PROP.FILING_NUMBERS:
            Store.invalidate('IS_ART_FILING_NUMBER_ENABLED')
            break;
          case ART_GLOBAL_PROP.PILLS_REMAINING:
            Store.invalidate('ASK_HANGING_PILLS')
            break;
          case ART_GLOBAL_PROP.THREE_HP_AUTO_SELECT:
            Store.invalidate('ART_AUTO_3HP_SELECTION')
            break;
          case GLOBAL_PROP.MALAWI_NATIONAL_ID_SCANNER_ENABLED:
            Store.invalidate('IS_MW_NATIONAL_ID_SCANNER_ENABLED')
            break;
        }
        toastSuccess('Property set')
      })
      .then(() => this.$router.push('/'))
    },
    async getFields  (){
      this.fields =  [
        {
          id: "preference",
          helpText: this.label,
          type: FieldType.TT_YES_NO,
          defaultValue: () => this.val,
          validation: (val: any) => Validation.required(val),
          options: ()=>([
            {
              label: this.label,
              values: [
                {
                  label: "yes",
                  value: "true"
                },
                {
                  label: "no",
                  value: "false"
                }
                ],
            },
          ]),
        }
      ]

    }
  },
  data() {
    return {
      property: null as any,
      fields: [] as any,
      label: null as any,
      val : ''
    };
  },
  watch: {
    $route: {
      async handler({ query }: any) {
        if(query.label && query.property) {
          try {
            this.val = await GlobalPropertyService.get(query.property);
          } catch (error) {
            console.log('fixed global property not found error');
          }
          this.property = query.property;
          this.label = query.label;
          this.getFields();
        }
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>
