<template>
  <ion-page>
    <his-standard-form
      :fields="fields"
      :skipSummary="true"
      :onFinishAction="onFinish"
      :cancelDestinationPath="cancelDestination"
    />
  </ion-page>
</template>

<script lang="ts">
import EncounterMixinVue from "@/views/EncounterMixin.vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { defineComponent } from "vue";
import { AncCurrentPregnancyService } from "@/apps/ANC/Services/anc_current_pregnancy";
import {
  Field,
  FooterBtnEvent,
  Option,
} from "@/components/Forms/FieldInterface";
import Validation from "@/components/Forms/validations/StandardValidations";
import { IonPage } from "@ionic/vue";
import { ObsValue } from "@/services/observation_service";
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";
import { alertConfirmation } from "@/utils/Alerts";
import { RecordConflictError } from "@/services/service";

export default defineComponent({
  components: { IonPage },
  mixins: [EncounterMixinVue],
  data: () => ({
    service: {} as AncCurrentPregnancyService,
    gestationWeeks: 0,
    delieveryDate: "",
    lnmp: "",
  }),
  watch: {
    ready: {
      async handler(ready: boolean) {
        if (ready) {
          this.service = new AncCurrentPregnancyService(
            this.patientID,
            this.providerID
          );
          this.fields = this.getFields();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async onFinish(_: any, computedData: any) {
      try {
        await this.service.enrollPatient();
      } catch (e) {
        if (e instanceof RecordConflictError) {
          console.warn(`${e}`);
        } else {
          throw e;
        }
      }
      const obs = await this.resolveObs(computedData);
      await this.service.createEncounter();
      await this.service.saveObservationList(obs as ObsValue[]);
      this.nextTask();
    },
    buildLnmpObs(estimated = false) {
      if (/Unknown/i.test(this.lnmp)) return null;
      return [
        estimated
          ? this.service.buildValueDateEstimated(
              "Last menstrual period",
              this.lnmp
            )
          : this.service.buildValueDate("Last menstrual period", this.lnmp),
        this.service.buildValueNumber(
          "Week of First Visit",
          this.gestationWeeks
        ),
      ];
    },
    getFields(): Field[] {
      return [
        {
          id: "lnmp",
          helpText: "Last Normal Menstrual Period",
          type: FieldType.TT_FULL_DATE,
          config: { allowUnknown: true, addTodayBtn: false },
          defaultValue: () => this.service.date,
          computedValue: () => this.buildLnmpObs(),
          beforeNext: async (v: Option) => {
            this.lnmp = v.value as string;
            this.gestationWeeks = this.service.calculateWeekOfFirstVisit(
              this.lnmp
            );
            if (this.gestationWeeks <= 0 || this.gestationWeeks > 42) {
              return alertConfirmation(
                "Gestation weeks out of range of 0-42. Are you sure you want to continue?"
              );
            }
            return true;
          },
          validation: (v: Option) =>
            this.validateSeries([
              () => Validation.required(v),
              () => {
                if (v.value) {
                  const lmpDate = new Date(v.value);
                  const today = new Date(this.service.date);
                  if (lmpDate > today) {
                    return ["Last menstrual period cannot be in the future"];
                  }
                }
                return null;
              },
            ]),
        },
        {
          id: "estimate_lmp",
          helpText: "Gestation (months)",
          type: FieldType.TT_NUMBER,
          condition: (f: any) => f.lnmp.value === "Unknown",
          computedValue: () => this.buildLnmpObs(true),
          validation: (v: Option) =>
            this.validateSeries([
              () => Validation.required(v),
              () => Validation.rangeOf(v, 1, 10),
            ]),
          beforeNext: (v: Option) => {
            this.lnmp = this.service.calculateGestationDateFromPeriod(
              v.value as number
            );
            this.gestationWeeks = this.service.calculateWeekOfFirstVisit(
              this.lnmp
            );
            return true;
          },
        },
        {
          id: "expected_delivary_date",
          helpText: "Expected Date Of Delivery",
          type: FieldType.TT_FULL_DATE,
          config: { 
            addTodayBtn: () => this.gestationWeeks >= 30 
          },
          dynamicHelpText: () =>
            `Expected Date Of Delivery (Gestation Weeks: ${this.gestationWeeks})`,
          defaultValue: () => this.service.estimateDelieveryDate(this.lnmp),
          computedValue: (v: Option) =>
            this.service.buildValueDate(
              "Estimated date of delivery",
              v.value as string
            ),
          validation: (v: Option) => Validation.required(v),
        },
        {
          id: "planned_delivery_place",
          helpText: "Planned delivery place",
          type: FieldType.TT_SELECT,
          computedValue: (v: Option) =>
            this.service.buildValueText("Planned Delivery Place", v.label),
          validation: (v: Option) => Validation.required(v),
          options: (_: any, filter = "") => getFacilities(filter),
          config: {
            footerBtns: [
              {
                name: "Here",
                slot: "end",
                onClickComponentEvents: {
                  setValue: (btnEvent: FooterBtnEvent) => {
                    return btnEvent.btnOutput;
                  },
                },
                onClick: () => AncCurrentPregnancyService.getLocationName(),
              },
            ],
            showKeyboard: true,
            isFilterDataViaApi: true,
          },
        },
        {
          id: "bed_net_available_for_use",
          helpText: "Mosquito net in good condition available for own use",
          type: FieldType.TT_SELECT,
          condition: () => false, /// Feature disabled
          computedValue: (v: Option) =>
            this.service.buildValueCoded("Do you use bed nets", v.value),
          validation: (v: Option) => Validation.required(v),
          options: () => {
            return this.yesNoOptions();
          },
        },
        {
          id: "bed_net_given",
          helpText: "Bed net given today",
          type: FieldType.TT_SELECT,
          computedValue: (v: Option) =>
            this.service.buildValueCoded("Mosquito net started", v.value),
          validation: (v: Option) => Validation.required(v),
          options: () => {
            return this.yesNoOptions();
          },
        },
        {
          id: "previous_td_given",
          helpText: "Previous TD given before this pregnancy",
          type: FieldType.TT_NUMBER,
          computedValue: (v: Option) =>
            this.service.buildValueNumber("TD Booster", v.value as number), //Previously called TTV
          validation: (v: Option) => Validation.required(v),
        },
      ];
    },
  },
});
</script>
