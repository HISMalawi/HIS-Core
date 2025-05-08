<template>
  <his-standard-form
    :fields="fields"
    :activeField="activeField"
    @onskip="activeField = ''"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { Field, Option } from "@/components/Forms/FieldInterface";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { VitalsService } from "@/apps/ART/services/vitals_service";
import { alertConfirmation, toastSuccess, toastWarning } from "@/utils/Alerts";
import EncounterMixinVue from "../../../../views/EncounterMixin.vue";
import { BMIService } from "@/services/bmi_service";
import { ProgramService } from "@/services/program_service";
import { find, isEmpty } from "lodash";
import HisApp from "@/apps/app_lib"
import { infoActionSheet } from "@/utils/ActionSheets"
import dayjs from "dayjs";
import Store from "@/composables/ApiStore"
import ART_PROP from "@/apps/ART/art_global_props"
import { ObservationService } from "@/services/observation_service";

export default defineComponent({
  mixins: [EncounterMixinVue],
  components: { HisStandardForm },
  data: () => ({
    app: HisApp.getActiveApp() as any,
    activeField: "",
    age: null as any,
    gender: null as any,
    hasBPinfo: false,
    finalHeightValue: null as number | null,
    recentHeight: null,
    recentHeightObsID: -1,
    HTNEnabled: false,
    optionWhiteList: [] as string[],
    hasHTNObs: false,
    vitals: {} as any,
    weightForHeight: {} as any,
    medianWeightandHeight: {} as any,
    canEditHeight: false as boolean,
    patientAgeAtPrevRecordedHeight: -1 as number,
    bpIsMandatory: false
  }),
  watch: {
    ready: {
      handler(ready) {
        if (ready) this.init()
      },
      immediate: true
    }
  },
  methods: {
    init() {
      this.vitals = new VitalsService(this.patientID, this.providerID);
      this.age = this.patient.getAge();
      this.gender = this.patient.getGender();
      this.fields = this.getFields();
    },
    getOptions() {
      let recentHeight = ''
      if (this.recentHeight) {
        if (this.age > 18 || this.patientAgeAtPrevRecordedHeight >= 18 ) {
          recentHeight = this.recentHeight || ''
        }
      }
      const options = [
        {
          label: "Weight",
          value: "",
          other: {
            modifier: "KG",
            icon: "weight",
            required: true,
          },
        },
        {
          label: "Height",
          value: `${recentHeight}`,
          other: {
            modifier: "CM",
            icon: "height",
            recentHeight: this.recentHeight,
            visible: this.canEditHeight,
            required: this.canEditHeight
          },
        },
        { 
          label: "BP", 
          value: "", 
          other: { 
            modifier: "mmHG", 
            icon: "bp",
            required: this.bpIsMandatory
          } 
        },
        {
          label: "Temp",
          value: "",
          other: { modifier: "°C", icon: "temp" },
        },
        {
          label: "SP02",
          value: "",
          other: { modifier: "%", icon: "spo2" },
        },
        {
          label: "Pulse",
          value: "",
          other: { modifier: "BPM", icon: "pulse-rate" },
        },
        {
          label: "Age",
          value: this.age,
          other: { modifier: "Years old", icon: "", visible: false },
        }
      ]

      if (!isEmpty(this.optionWhiteList)) {
        return options.filter((o: any) => this.optionWhiteList.includes(o.label))
          .map((o: any) => {
            o.other.required = true
            return o
          })
      }
      return options
    },
    canCheckWeightHeight() {
      return isEmpty(this.optionWhiteList) || this.optionWhiteList.includes('Height') 
        && this.optionWhiteList.includes('Weight')
    },
    canCheckBp() {
      return isEmpty(this.optionWhiteList) || this.optionWhiteList.includes('BP')
    },
    async onFinish(formData: any) {
      const encounter = await this.vitals.createEncounter();

      if (!encounter) return toastWarning("Unable to create treatment encounter");

      const obs = await this.buildObs(formData);
      const observations = await this.vitals.saveObservationList(obs);

      if (!observations) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      this.nextTask();
    },
    async buildObs(formData: any) {
      const observations: any = await this.mapObs(
        this.sanitizeVitals(formData.vitals).filter(
          (element) => element.label !== "BP"
        ).map((e: any) => {
          if (e.label === 'Height' && e.other.visible && this.finalHeightValue) {
            e.value = this.finalHeightValue
          }
          return e
        })
      );
      if (this.HTNEnabled && !this.hasHTNObs && formData.on_htn_medication) {
        const obs = await this.vitals.buildValueText(
          "Treatment status",
          formData.on_htn_medication.value
        );
        observations.push(obs);
      }
      return observations;
    },
    splitBP(formData: Option[]) {
      const p: Option[] = [];
      formData.forEach((element) => {
        if (element.label === "BP") {
          const value = `${element.value}`.split("/");
          const bpSystolic = value[0];
          const bpDiastolic = value[1];

          p.push({ label: "Systolic", value: bpSystolic });
          p.push({ label: "Diastolic", value: bpDiastolic });
        }
      });
      return p;
    },
    getBMI(formData: Option[]) {
      const weight = this.getVal(formData, "Weight");
      const height = this.getVal(formData, "Height");
      const obs: any = [];
      if (this.age <= 14) {
        const currentWeightPercentile = (
          (weight / parseFloat(this.medianWeightandHeight["weight"])) *
          100
        ).toFixed(0);
        const currentHeightPercentile = (
          (height / parseFloat(this.medianWeightandHeight["height"])) *
          100
        ).toFixed(0);
        const currentHeightRounded =
          (height % Math.floor(height) < 0.5 ? 0 : 0.5) + Math.floor(height);
        const medianWeightHeight =
          this.weightForHeight[currentHeightRounded.toFixed(1)];
        const weightForHeightPercentile = (
          (weight / medianWeightHeight) *
          100
        ).toFixed(0);
        if(!isNaN(parseFloat(weightForHeightPercentile))) {
          obs.push({
            label: "Weight for height percent of median",
            value: weightForHeightPercentile,
          });
        }
        obs.push({
          label: "Weight for age percent of median",
          value: currentWeightPercentile,
        });
        obs.push({
          label: "Height for age percent of median",
          value: currentHeightPercentile,
        });
      } else {
        const BMI = BMIService.calculateBMI(weight, height);
        obs.push({ label: "BMI", value: BMI });
      }
      return obs;
    },
    getVal(formData: Option[], val: string): number {
      const value = formData.filter((key: any) => key.label === val);
      return value[0].value === "" ? 0 : parseFloat(`${value[0].value}`);
    },
    async mapObs(vitals: any) {
      const j = vitals.map(async (element: any) => {
        const obs = await this.vitals.buildValueNumber(
          element.label,
          element.value
        );
        return obs;
      });
      return Promise.all(j);
    },
    validateVitals(vitals: any) {
      const l = this.checkRequiredVitals(vitals);
      if (l.length > 0) {
        return l.map((val) => {
          return [`${val.label} can not be empty`];
        });
      }
      const v = this.sanitizeVitals(vitals);
      return this.vitals.validateAll(v);
    },
    sanitizeVitals(vitals: Array<Option>) {
      let p = vitals.filter((element) => {
        if (element.label === "Height" && element.other.required == false) {
          return false;
        }
        return element.value !== "" && element.label !== "Age";
      })
      if (this.canCheckBp()) {
        p = p.concat(this.splitBP(p))
      }
      if (this.canCheckWeightHeight()){
        p = p.concat(this.getBMI(vitals))
      }
      return p
    },
    checkRequiredVitals(vitals: Array<Option>) {
      return vitals.filter((element) => {
        return element.value === "" && element.other.required === true;
      });
    },
    getFields(): Array<Field> {
      return [
        {
          id: "on_htn_medication",
          helpText: "Is client hypertensive?",
          type: FieldType.TT_SELECT,
          init: async () => {
            if (this.app?.applicationName === 'ART') {
              this.HTNEnabled = await Store.get('IS_ART_HTN_ENABLED')
              if (this.HTNEnabled) {
                await VitalsService.getAll(this.patientID, "Treatment status").then(
                  (data: any) => {
                    this.hasHTNObs = data && data.length > 0;
                  }
                )
                const bpAgeThreshold = await ART_PROP.htnAgeThreshold() ?? 0
                const lastBp = await ObservationService.getFirstObs(this.patientID, 'Systolic blood pressure')

                if (bpAgeThreshold && this.patient.getAge() >= bpAgeThreshold) {
                  this.bpIsMandatory = !lastBp?.obs_datetime || dayjs(VitalsService.getSessionDate()).diff(lastBp.obs_datetime, 'years') >= 1
                }
              }
            }
            return true
          },
          validation: (val: any) => Validation.required(val),
          condition: () => {
            return this.HTNEnabled && !this.hasHTNObs;
          },
          options: () => [
            {
              label: "Yes",
              value: "BP Drugs started",
            },
            {
              label: "No",
              value: "Not on BP Drugs",
            },
          ],
        },
        {
          id: "vitals",
          helpText: "Vitals entry",
          type: FieldType.TT_VITALS_ENTRY,
          init: async () => {
            const optionWhiteList = this.$route.query.vital_options as string
            if (optionWhiteList) this.optionWhiteList = optionWhiteList.split(',')
            if (this.canCheckWeightHeight()) {
              const lastHeight = await this.patient.getRecentHeightObs();
              if (!isEmpty(lastHeight)) {
                this.patientAgeAtPrevRecordedHeight = dayjs(lastHeight['obs_datetime'])
                  .diff(this.patient.getBirthdate(), 'year')
                this.recentHeight = lastHeight['value_numeric'];
                this.recentHeightObsID = lastHeight['obs_id'];
                /**
                 * For a scenario where a patient's height was last updated when they were a minor
                 * and they return as an adult, provide an option to update their height.
                 */
                this.canEditHeight = this.patientAgeAtPrevRecordedHeight < 18 || this.age < 18
              } else {
                this.canEditHeight = true
              }
              if (this.age <= 14) {
                this.medianWeightandHeight = await this.patient.getMedianWeightHeight();
                this.weightForHeight = await ProgramService.getWeightForHeightValues();
              }
            }
            return true
          },
          validation: (value: any) => this.validateVitals(value),
          beforeNext: async (val: Option[]) => {
            const heightOption = find(val, { label: "Height" });
            if (heightOption && this.recentHeight && heightOption.other.visible) {
              const enteredHeight = parseInt(`${heightOption.value || 0}`);
              const prevHeight = parseInt(`${this.recentHeight || 0}`);

              /** Warn if inconsistent height is detected */
              if (enteredHeight < prevHeight) {
                const prevHeightBtnTxt = `Use ${prevHeight} CM`
                const newHeightBtnTxt = `Use ${enteredHeight} CM`
                const action = await infoActionSheet(
                  `Previous Height "${prevHeight} CM"`,
                  `Current Height "${enteredHeight} CM"`,
                  `Inconsistent Height Reading (Height can not be lower than previous height of " ${this.recentHeight} "CM. Please SELECT the correct height.)`,
                  [
                    {
                      name: prevHeightBtnTxt,
                      slot: 'start',
                      color: 'success'
                    },
                    {
                      name: newHeightBtnTxt,
                      slot: 'end',
                      color: 'danger'
                    }
                  ]
                )
                if (action === newHeightBtnTxt && this.recentHeightObsID) {
                  if ((await alertConfirmation(
                    `Do you want to void height observation for ${prevHeight}`
                  ))) {
                    await VitalsService.voidObs(this.recentHeightObsID)
                  }
                } else {
                  this.finalHeightValue = prevHeight
                }
              }
            }
            return true
          },
          config: {
            hiddenFooterBtns : [
              'Clear'
            ],
            onUpdateAlertStatus: async (params: Option[]) => {
              const weightOption = find(params, { label: 'Weight'})
              const heightOption = find(params, { label: 'Height'})

              if (!(weightOption && heightOption)) return

              const weight = parseFloat(weightOption.value as string)
              const height = parseFloat(heightOption.value as string)

              if (weight <= 0 || height <=0) return { 
                label: 'BMI',
                value: 'N/A',
                color: '', 
                status: ''
              }

              const BMI = await BMIService.getBMI(weight, height, this.gender, this.age);

              return {
                label: 'BMI',
                value: BMI.index,
                color: BMI.color, 
                status: BMI.result
              }
            },
            onChangeOption: (activeItem: any) => {
              if (!activeItem.value && activeItem.other.required) {
                throw `Value for ${activeItem.label} is required`
              }else if (activeItem.value) {
                const errs = this.vitals.validator(activeItem)
                if(errs && errs.length) throw errs
              }
            }
          },
          options: () => this.getOptions(),
        },
      ];
    },
  },
});
</script>
