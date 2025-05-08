
<template>
  <his-standard-form
    :fields="fields"
    @onSubmit="onSubmit"
    @onFinish="onFinish"
    :skipSummary="true"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import { toastSuccess } from "@/utils/Alerts";
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop";
import Store from "@/composables/ApiStore"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    onFinish(formData: any) {
      const sitePrefix = `${formData.site_code.value}`.toUpperCase();
      GLOBAL_PROP.setSitePrefix(sitePrefix)
        .then(() => {
          Store.invalidate('SITE_PREFIX')
          toastSuccess("Property set")
        })
        .then(() => this.$router.push("/"));
    },
    async setFields() {
      const val = await Store.get('SITE_PREFIX')
      this.fields = [
        {
          id: "site_code",
          helpText: "Enter Site Code",
          defaultValue: () => val,
          type: FieldType.TT_TEXT,
          validation(value: any): null | Array<string> {
            return !value ? ["Value is required"] : null;
          }
        }
      ]
    }
  },
  data() {
    return {
      fields: [] as any,
    };
  },
  watch: {
    $route: {
      async handler() {
        this.setFields();
      },
      deep: true,
      immediate: true,
    },
  },
});
</script>

