<template>
  <his-standard-form
    :fields="fields"
    @onFinish="onFinish"
    :skipSummary="true"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import {
  CHARACTERS_AND_NUMBERS_LO,
  NUMBER_PAD_LO,
} from "@/components/Keyboard/KbLayouts";
import GLOBAL_PROP from "@/apps/GLOBAL_APP/global_prop";

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    async onFinish(formData: any) {
      const enablePortal = formData.use_portal.value;
      await GLOBAL_PROP.setPortalEnabled(enablePortal)
      if (this.enablePortal) {
        const ipAddress = formData.ip_address.value;
        const port = formData.port.value;
        const portalIP = `http://${ipAddress}:${port}`;
        await GLOBAL_PROP.setPortalIP(portalIP)
      }
      this.$router.back();
    },
    getFields() {
      this.fields = [
        {
          id: "use_portal",
          helpText: "Enable Portal?",
          type: FieldType.TT_SELECT,
          requireNext: true,
          validation: (val: any) => Validation.required(val),
          options: () => [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ],
          computedValue: async (data: any) => {
            this.enablePortal = data.value === "true";
          },
        },
        {
          id: "ip_address",
          helpText: "Enter IP Address",
          type: FieldType.TT_TEXT,
          condition: () => this.enablePortal,
          validation: (val: any) =>
            Validation.required(val) || Validation.isIPAddress(val),
          config: {
            customKeyboard: [CHARACTERS_AND_NUMBERS_LO, [["Delete"]]],
          },
        },
        {
          id: "port",
          helpText: "Enter Port",
          condition: () => this.enablePortal,
          validation: (val: any) => Validation.required(val),
          type: FieldType.TT_TEXT,
          config: {
            customKeyboard: [NUMBER_PAD_LO, [["Delete"]]],
          },
        },
      ];
    },
  },
  data() {
    return {
      fields: [] as any,
      enablePortal: false,
    };
  },
  mounted() {
    this.getFields();
  },
});
</script>

