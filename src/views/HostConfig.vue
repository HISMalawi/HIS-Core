<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="true"
  />
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { NUMBER_PAD_LO } from "@/components/Keyboard/KbLayouts";
import ApiClient from "@/services/api_client";
import { infoActionSheet } from "@/utils/ActionSheets";
import { toastWarning } from "@/utils/Alerts"
import { loadingController } from "@ionic/vue"

export default defineComponent({
  components: { HisStandardForm },
  methods: {
    async onFinish(formData: any) {
      const protocol = formData.protocol.value;
      const ipAddress = formData.ip_address.value;
      const port = formData.port.value;

      ApiClient.setLocalStorage(protocol, ipAddress, port);
      
      const loading = await loadingController
        .create({
          message: 'Please wait...',
          backdropDismiss: false
        })

      await loading.present()

      const res = await ApiClient.healthCheck()

      loadingController.dismiss()

      if (!(res && res.status === 200) || !res) {
        toastWarning(`
          Unable to connect to: ${protocol}://${ipAddress}: ${port}
        `)
        this.clearLocalStorage()
      } else {
        this.$router.back();
      }
    },
    getFields() {
      this.fields = [
        {
          id: "protocol",
          helpText: "Select Protocol",
          type: FieldType.TT_SELECT,
          requireNext: false,
          validation: (val: any) => Validation.required(val),
          options: () => [
            {
              label: 'HTTP',
              value: 'http'
            },
            {
              label: 'HTTPS',
              value: 'https'
            }
          ]
        },
        {
          id: "ip_address",
          helpText: "Enter IP Address",
          type: FieldType.TT_IP_ADDRESS,
          validation: (val: any) => Validation.required(val) || Validation.isIPAddress(val)
        },
        {
          id: "port",
          helpText: "Enter Port",
          validation: (val: any) => Validation.required(val),
          type: FieldType.TT_TEXT,
          config: {
            customKeyboard: [
              NUMBER_PAD_LO,
              [["Delete"]],
            ],
          },
        },
      ];
    },
    async showConfigNotice() {
      if (this.isUsingLocalStorage()) {
        const action = await infoActionSheet(
          "Config notice",
          `The system is currently using user specified configurations. \
                Do you wish to reset back to server configurations?`,
          "",
          [
            { name: "Reset configurations", slot: "start", color: "success" },
            { name: "New configurations", slot: "end" },
          ]
        );

        if (action === "Reset configurations") {
          this.clearLocalStorage();
          this.$router.back();
        }
      }
    },
    isUsingLocalStorage() {
      if (localStorage.getItem("useLocalStorage") === "true") return true;
      return false;
    },
    clearLocalStorage() {
      const excluions = ['useLocalStorage',
        'apiURL',
        'apiPort',
        'apiProtocol'];
      ApiClient.removeOnly(excluions);
    }
  },
  data() {
    return {
      fields: [] as any,
    };
  },
  async mounted() {
    await this.showConfigNotice();
    this.getFields();
  },
});
</script>
