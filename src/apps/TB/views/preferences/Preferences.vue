<template>
  <ion-page>
    <his-standard-form :fields="fields" :onFinishAction="onFinish" :skipSummary="true">
    </his-standard-form>
  </ion-page>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { Option } from "@/components/Forms/FieldInterface";
import { GlobalPropertyService } from "@/services/global_property_service";
import { toastSuccess } from "@/utils/Alerts";
import { IonPage } from "@ionic/vue";
import { TB_PREFS } from "@/apps/TB/services/tb_props";
import TB_PROPS from "@/apps/TB/services/tb_props";

export default defineComponent({
  components: { HisStandardForm, IonPage },
  data: () => ({
    preference: "" as string,
    fields: [] as any,
  }),
  created() {
    this.preference = this.$route.query.config as string;
    this.fields = [...this.systemPreferences()];
  },
  methods: {
    isProp(prop: string) {
      return !this.preference || prop === this.preference;
    },
    async onFinish(_: any, data: Record<string, any>) {
      for (const prop in data) {
        await GlobalPropertyService.set(prop, data[prop]);
        toastSuccess("Property has been updated", 2000);
      }
      this.$router.back();
    },
    systemPreferences() {
      return [
        {
          id: TB_PREFS.SITE_TB_CODE,
          helpText: "Set Site Code",
          type: FieldType.TT_TEXT,
          computedValue: (v: Option) => v.value,
          defaultValue: () => TB_PROPS.getSiteTbCode(),
          validation: (val: any) => Validation.required(val),
          condition: () => this.isProp(TB_PREFS.SITE_TB_CODE),
          config: {
            showKeyboard: true,
          },
        },
        // faciliity catchment population
        {
          id: TB_PREFS.FACILITY_CATCHMENT_POPULATION,
          helpText: "Set Facility Catchment Population",
          type: FieldType.TT_NUMBER,
          computedValue: (v: Option) => v.value,
          defaultValue: () => TB_PROPS.getSiteCatchmentPopulation(),
          validation: (val: any) => Validation.required(val),
          condition: () => this.isProp(TB_PREFS.FACILITY_CATCHMENT_POPULATION),
          config: {
            showKeyboard: true,
          },
        },
        // functional sputum collection points
        {
          id: TB_PREFS.FUNCTIONAL_SPUTUM_COLLECTION_POINTS,
          helpText: "Set Functional Sputum Collection Points",
          type: FieldType.TT_NUMBER,
          computedValue: (v: Option) => v.value,
          defaultValue: () => TB_PROPS.getFunctionalSputumCollectionPoints(),
          validation: (val: any) => Validation.required(val),
          condition: () => this.isProp(TB_PREFS.FUNCTIONAL_SPUTUM_COLLECTION_POINTS),
          config: {
            showKeyboard: true,
          },
        },
        // newly established sputum collection points
        {
          id: TB_PREFS.NEWLY_ESTABLISHED_SPUTUM_COLLECTION_POINTS,
          helpText: "Set Newly Established Sputum Collection Points",
          type: FieldType.TT_NUMBER,
          computedValue: (v: Option) => v.value,
          defaultValue: () => TB_PROPS.getNewlyEstablishedSputumCollectionPoints(),
          validation: (val: any) => Validation.required(val),
          condition: () =>
            this.isProp(TB_PREFS.NEWLY_ESTABLISHED_SPUTUM_COLLECTION_POINTS),
          config: {
            showKeyboard: true,
          },
        },
      ];
    },
  },
});
</script>
