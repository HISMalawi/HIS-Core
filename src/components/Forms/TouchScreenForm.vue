<template>
  <!-- 
    HACK: dont remove the this, 
    some components dont render without it's presence
    See: ProgrammeManagement.vue
  --->
  {{currentField}}
  <!-- END OF HACK --->
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-row> 
          <ion-col>
            <ion-title class="his-lg-text">{{ helpText }}</ion-title>
          </ion-col>
          <ion-col v-if="currentField?.config?.toolbarInfo">
            <info-card :style="{height: '100%'}" :items="currentField?.config?.toolbarInfo"/>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <keep-alive>
        <component
          v-bind:is="currentField.type"
          :key="currentField.id"
          :config="currentField.config"
          :options="currentField.options"
          :preset="currentField.preset"
          :clear="valueClearIndex"
          :fdata="formData"
          :cdata="computedFormData"
          :activationState="state"
          :onValue="currentField.onValue"
          :defaultValue="currentField.defaultValue"
          :onValueUpdate="currentField.onValueUpdate"
          :footerButtonEvent="ftBtnEvent"
          @onValue="onFieldValue"
          @onFieldActivated="onFieldActivated"
        />
      </keep-alive>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
          <ion-button
            v-for="(btn, index) in footerBtns"
            :key="index"
            :slot="btn.slot || 'start'"
            :class="btn.styleClass"
            @click="onFtButtonClicked(btn)"
            :color="btn.color || 'primary'"
            :size="btn.size || 'large'"
            :disabled="onDisabledBtnState(btn)"
            v-show="onVisibleBtnState(btn)"
          >
            {{ btn.name }}
          </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang='ts'>
import { defineComponent, PropType, defineAsyncComponent } from "vue";
import { COMPONENT_REFS } from "@/components/Forms/BaseFormElements";
import { findIndex, isEmpty } from "lodash";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { 
  Field, 
  Option,
  FormFooterBtns,
  FooterBtnEvent,
FormOnFinishAction,
FormOnCancelAction
} from "./FieldInterface";
import {
  IonPage,
  IonCol,
  IonRow,
  IonButtons,
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonHeader,
  IonTitle,
  loadingController,
  modalController,
  alertController,
  toastController
} from "@ionic/vue";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";
import InfoCard from "@/components/DataViews/HisFormInfoCard.vue"
import {toastDanger} from "@/utils/Alerts"
import LoadingFormElement from "@/components/Forms/LoaderFormPlaceholder.vue"
import ErrorFormElement from "@/components/Forms/FormElementError.vue"
/**
 * Build async components for all form elements
 */
function buildAsyncComponents() {
  const components: any = {}
  COMPONENT_REFS.forEach((name: string) => {
    components[name] = defineAsyncComponent({
      loader: () => import( /* webpackChunkName: "TouchFormElement"*/`@/components/FormElements/${name}.vue`),
      loadingComponent: LoadingFormElement,
      errorComponent: ErrorFormElement,
      delay: 150,
      timeout: 50000,
    })
  })
  return components
}

export default defineComponent({
  name: "TouchscreenForm",
  components: {
    InfoCard,
    IonButtons,
    IonPage,
    IonContent,
    IonFooter,
    IonToolbar,
    IonButton,
    IonHeader,
    IonTitle,
    IonCol,
    IonRow,
    ...buildAsyncComponents(),
  },
  emits: [
    'onFinish',
    'onIndex'
  ],
  props: {
    onFinish: {
      type: Function as PropType<FormOnFinishAction>
    },
    skipSummary: {
      type: Boolean,
      default: false,
    },
    activeField: {
      type: String,
    },
    fields: {
      type: Object as PropType<Field[]>,
      required: true,
    },
    cancelDestinationPath: {
      type: String,
    },
    disableAutoModalDismiss : {
      type: Boolean
    },
    cancelAction: {
      type: Function as PropType<FormOnCancelAction>
    }
  },
  data: () => ({
    ftBtnEvent: {
      eventIndex: 0,
      btnName: '',
      btnOutput: null as any,
    } as FooterBtnEvent,
    helpText: '' as string,
    valueClearIndex: 0 as number,
    currentIndex: 0,
    currentField: {} as Field,
    currentFieldContext: null as any,
    formData: {} as any,
    computedFormData: {} as any,
    footerBtns: [] as Array<FormFooterBtns>,
    currentFields: [] as Array<Field>,
    fieldsInitialisedOnce: {} as Record<string, boolean>,
    state: "" as
      | "init"
      | "onsubmit"
      | "onload"
      | "unload"
      | "next"
      | "prev"
      | "onfinish"
      | "onValue"
      | "default"
  }),
  watch: {
    /**
     * Initiate the form if all fields are available
     */
    fields: {
      async handler(fields: Array<Field>) {
        if (!isEmpty(fields)) {
          this.buildFormData(fields);
          let dataFields = fields;
          if (!this.skipSummary) {
            dataFields = [...dataFields, this.getDefaultSummaryField()];
          }
          this.currentFields = dataFields;
          // Use activeField as initial field if set
          if (this.activeField) {
            this.mountField(this.activeField)
          } else {
            await this.onNext(); //look for a field to mount initially
          }
        }
      },
      immediate: true,
      deep: true
    },
    state: {
      handler (newState: string) {
        if(["onValue", "onClear", "next", "prev", "onfinish", "onload", "unload"].includes(newState)){
          loadingController.getTop().then(v => v ? loadingController.dismiss() : null)
          if (!this.disableAutoModalDismiss) modalController.getTop().then(v => v && modalController.dismiss())
          alertController.getTop().then(v => v ? alertController.dismiss() : null)
          toastController.getTop().then(v => v ? toastController.dismiss() : null)
        }
      },
      immediate: true,
      deep: true
    },
    /**
     * Switch the view to a target field
    */
    activeField: {
      async handler(field: string) {
        if (field) this.mountField(field)
      }
    }
  },
  mounted() {
    this.footerBtns = [this.getCancelBtn()]
  },
  methods: {
    clearValue() {
      this.valueClearIndex += 1
      this.setActiveFieldValue(null)
    },
    async onFtButtonClicked(btn: FormFooterBtns) {
      this.ftBtnEvent.eventIndex += 1
      this.ftBtnEvent.btnName = btn.name
      this.ftBtnEvent.btnOutput = await btn.onClick(this.formData, this.computedFormData, this.currentFieldContext)
      if (btn.onClickComponentEvents) {
        this.ftBtnEvent.onClickComponentEvents = btn.onClickComponentEvents
      } else {
        if (this.ftBtnEvent.onClickComponentEvents) delete this.ftBtnEvent.onClickComponentEvents
      }
    },
    async mountField(name: string) {
      if (name === '_NEXT_FIELD_') {
        await this.goNext()
        return this.$emit('onIndex', this.currentIndex)
      }
      const i = findIndex(this.currentFields, { id: name });
      if (i >= 0 && i <= this.currentFields.length) {
        this.setActiveFieldComputedValue()
        this.setActiveField(i)
        this.$emit('onIndex', i)
      }
    },
    /**
     * Redirects to a specified route or defaults to the previous view
     */
    getCancelBtn(conf={} as any): FormFooterBtns {
      const override = conf || {}
      return {
        name: override.name || "Cancel",
        color: override.color || "danger",
        onClick: async () => {
          if (override.onClick) {
            return override.onClick()
          }
          if ((await alertConfirmation("Are you sure you want to cancel?"))) {
            if (typeof this.cancelAction === 'function') {
              return this.cancelAction()
            } else {
              this.cancelDestinationPath
                ? this.$router.push(this.cancelDestinationPath)
                : this.$router.back();
            }
          }
        }
      }
    },
    /**
     * Clear the current's field value. However this depends if 
     * the field supports this feature
     */
    getClearBtn(conf={} as any): FormFooterBtns {
      const override = conf || {}
      return {
        name: override.name || "Clear",
        color: override.color || "warning",
        slot: "end",
        onClick: async () => {
          if (override.onClick) {
            return override.onClick()
          }
          const confirmation = await alertConfirmation(
            "Are you sure you want to clear field data?"
          );
          if (confirmation) this.clearValue();
        },
      };
    },
    /**
     * Go to the previous page on the form
     */
    getBackBtn(conf={} as any): FormFooterBtns {
      const override = conf || {}
      const visibleCondition = () => {
        if (this.currentFields.length === 1 
          || this.currentIndex <= 0) {
            return false;
          }
        return true;
      }
      return {
        name: override?.name || "Back",
        slot: "end",
        state: {
          disabled: {
            default: () => false,
            onsubmit: () => true
          },
          visible: {
            onload: () => visibleCondition(),
            default: () => visibleCondition()
          }
        },
        onClick: () => override.onClick ? override.onClick() : this.goBack()
      };
    },
    /**
     * Go to the next index in the array of fields
     */
    getNextBtn(conf={} as any): FormFooterBtns {
      const override = conf || {}
      const visibleCondition = () => {
        if (this.currentIndex + 1 >= this.currentFields.length 
          || this.currentFields.length <= 1) {
          return false;
        }
        return true;
      }
      return {
        name: override?.name || "Next",
        color: override?.color || "success",
        slot: "end",
        state: override?.state || {
          disabled: {
            onsubmit: () => true,
            default(field: Field) {
              if ('requireNext' in field) {
                return !field.requireNext
              }
              return false
            }
          },
          visible: {
            onsubmit: () => false,
            onfinish: () => false,
            default: () => visibleCondition(),
            onload: () => visibleCondition()
          }
        },
        onClick: () => override.onClick ? override.onClick(this.formData, this.computedFormData) : this.goNext(),
      };
    },
    /**
     * When clicked it notifies the parent that form has been submitted
     */
    getFinishBtn(conf={} as any): FormFooterBtns {
      const override = conf || {}
      const visibilityCondition = () => {
        return this.currentIndex+1 >= this.currentFields.length
      }
      return {
        name: override?.name || "Finish",
        color: override?.color || "success",
        slot: "end",
        state: {
          disabled: {
            default: () => false,
            onsubmit: () => true,
          },
          visible: {
            onfinish: () => true,
            onsubmit: () => true,
            default:() => visibilityCondition(),
            onload: () => visibilityCondition()
          }
        },
        onClick: () => override.onClick ? override.onClick() : this.goNext()
      }
    },
    /**
     * Shows or hides a footer button based on it's defined states
     */
    onVisibleBtnState(btn: any) {
      // Hide buttton if the current field configured it to be hidden
      try {
        if (this.currentField
            ?.config
            ?.hiddenFooterBtns
            .includes(btn.name)) {
          return false
        }
      }catch(e) { 
        //No hidden buttons i suppose
      }
      // Check for state observables in the button
      if (btn?.state?.visible) {
        if (this.state in btn.state.visible) {
          return btn.state.visible[this.state] (
            this.currentField, this.formData
          )
        }
        if ('default' in btn.state.visible) {
          return btn.state.visible['default'] (
            this.currentField, this.formData
          )
        }
      }
      return true
    },
    /**
     * Disables or enables a footer button based on it's defined states
     */
    onDisabledBtnState(btn: any) {
      // Check for state observables in the button
      if (btn?.state?.disabled) {
        if (this.state in btn.state.disabled) {
          return btn.state.disabled[this.state] (
            this.currentField, this.formData
          )
        }
        if ('default' in btn.state.disabled) {
          return btn.state.disabled['default'] (
            this.currentField, this.formData
          )
        }
      }
      return false
    },
    /**
     * Built in field to consolidates and displays all data that were
     * entered on the form
     */
    getDefaultSummaryField(): Field {
      return {
        id: "__form_summary__",
        helpText: "Summary",
        type: FieldType.TT_SUMMARY,
        config: {
          hiddenFooterBtns: ["Clear"],
        },
        options: (
          formData: Record<string, any>,
          computedData: Record<string, any>
        ) => {
          const data: Array<Option> = [];
          for (const ref in formData) {
            // We need to retrieve field configuration 
            // inorder to map labels to helpText and 
            // to check if the field should be visible on the summary...e.t.c
            const field = this.currentFields.filter(
              (i: Field) => i.id === ref || i.proxyID === ref
            )[0];
            const fdata = formData[ref];
            // A field has the right to disable itself from appearing on the
            // summary
            if (
              !fdata ||
              (field.appearInSummary != undefined &&
                !field.appearInSummary(formData, ref))
            )
              continue;
            const values = Array.isArray(fdata) ? fdata : [fdata];

            values.forEach((item) => {
              if (field.summaryMapValue) {
                // A field can configure how it's data should appear on the 
                // summary page. This overrides the default process of showing values
                data.push(
                  field.summaryMapValue(item, formData, computedData[ref])
                );
                return;
              }
              data.push({ label: field.helpText, value: item.label });
            });
          }
          return data;
        },
      };
    },
    /**
     * Filters out fields with null values
     */
    resolveFormValues(formObj: Record<string, any>) {
      const resolved: any = {}
      for(const i in formObj) {
        if (formObj[i] != null) {
          resolved[i] = formObj[i]
        }
      }
      return resolved
    },
    /**
     * Run default action when the form is submitted
    */
    async onFinishAction() {
      const formData = this.resolveFormValues(this.formData)
      const computedData = this.resolveFormValues(this.computedFormData)
      if (this.onFinish) {
        try {
          this.state = 'onsubmit'
          await this.onFinish(formData ,computedData)
        }catch(e) { 
          console.error(e)
          toastDanger(`${e}`) 
        }
      }
      this.state = 'onfinish'
      this.$emit('onFinish', formData, computedData)
    },
    /**
     * Goes to next component if they're no errors on the page
     */
    async goNext() {
      // Run field validations before goind next
      if (this.currentField.validation) {
        const value = this.formData[this.currentField.id];
        const errors = this.currentField.validation(
          value, this.formData, this.computedFormData
        )
        if (errors) return toastWarning(errors.join(", "), 2000);
      }
      // Run callback before proceeding to next field
      if (this.currentField.beforeNext) {
        if (!(await this.currentField.beforeNext(
            this.formData[this.currentField.id],
            this.formData,
            this.computedFormData,
            this
        ))) {
          return
        }
      }
      await this.onNext();
    },
    /**
     * Go to the previous page if conditions are ok
     */
    async goBack() {
      for (let i = this.currentIndex; i >= 0; --i) {
        const field = this.currentFields[i];
        if (!isEmpty(this.currentField) 
          && this.currentField.id === field.id) {
          continue;
        }
        await this.initFieldOnce(field)
        try {
          if (!(await this.checkFieldCondition(field))) {
            continue
          }
        } catch (e) {
          continue
        }
        await this.setActiveField(i, "prev");
        return
      }
    },
    /**
     * Run a field's condition if configured. 
     * Note: Fields whose evaluation === False will have their
     *      values null by Default. If a defaultOuput/defaultComputedOutput 
     *      was set, those values will be used instead of null
     */
    async checkFieldCondition(field: Field) {
       if (field.condition && !(await field.condition(
          this.formData, this.computedFormData
        ))) {
        if (typeof field.onConditionFalse === 'function') {
          field.onConditionFalse()
        }
        // Normal form value to be used when condition is false
        this.formData[field.id] = field.defaultOutput 
          ? field.defaultOutput(this.formData, this.computedFormData) 
          : null;
        // Computed form value to be used when condition is false
        if (field.computedValue) {
          this.computedFormData[field.id] = field.defaultComputedOutput
            ? field.defaultComputedOutput(this.formData, this.computedFormData)
            : null
        }
        return false
      }
      return true
    },
    /**
     * Callback when the field component has been activated.
     * if  a callback is defined, we pass an instance of the active field
     * so that it can be manipulated by the parent.
     */
    onFieldActivated(fieldContext: any) {
      this.state = "onload";
      this.currentFieldContext = fieldContext // it might not be used anywhere on this component but it might be used in some callbacks as context
      if (this.currentField.onload) this.currentField.onload(fieldContext);
    },
    /**
     * Callback before the active field is replaced
     */
    async onUnload(state = "") {
      try {
        this.state = "unload";
        if (!isEmpty(this.currentField) && this.currentField.unload) {
          const data = this.formData[this.currentField.id];
          await this.currentField.unload(
            data,
            state,
            this.formData,
            this.computedFormData,
            this
          );
        }
      } catch (e) {
        console.error(e)
      }
    },
    buildFormData(fields: Array<Field>): void {
      this.formData = {};
      fields.forEach((field) => {
        /**
         * Fields with proxyIDs write their values in the same place
         * unlike normal IDs !!
        */
       if (field.proxyID) {
        this.formData[field.proxyID] = null
       }
       this.formData[field.id] = null
      })
    },
    async setActiveFieldValue(value: any) {
      this.state = "onValue";
      const proxyID = this.currentField.proxyID
      const id = this.currentField.id

      if (proxyID) this.formData[proxyID] = value

      this.formData[id] = value;
      if (typeof this.currentField.updateHelpTextOnValue === 'function') {
        this.helpText = this.currentField.updateHelpTextOnValue(value, this.formData)
      }
    },
    /**
     * Determine which field to show next by it's condition
     */
    async onNext() {
      const totalFields = this.currentFields.length;
      for (let i = this.currentIndex; i < totalFields; ++i) {
        const field = this.currentFields[i];
        if (!isEmpty(this.currentField) 
          && this.currentField.id === field.id) {
            continue;
          }
        await this.initFieldOnce(field)
        try {
          if (!(await this.checkFieldCondition(field))) {
            continue
          }
        } catch (e) { 
          continue 
        }
        if (typeof this.currentField.exitsForm === 'function' 
          && this.currentField.exitsForm(this.formData, this.computedFormData)) 
          break
        this.setActiveFieldComputedValue()
        this.setActiveField(i, "next");
        return;
      }
      this.setActiveFieldComputedValue()
      await this.onFinishAction()
    },
    /**
     * Push the current field to be displayed
     */
    async setActiveField(index: number, state = "" as "init" | "next" | "prev") {
      await this.onUnload(state);
      this.state = state;
      this.currentIndex = index;
      this.currentField = this.currentFields[this.currentIndex];
      await this.initFieldOnce(this.currentField)  
      // Set default helpText
      this.helpText = this.currentField.dynamicHelpText
        ? this.currentField.dynamicHelpText(this.formData)
        : typeof this.currentField.updateHelpTextOnValue === 'function' 
        ? this.currentField.updateHelpTextOnValue(
          this.formData[this.currentField.id], 
          this.computedFormData[this.currentField.id]
        )
        : this.currentField.helpText

      // create new instance of footer buttons all new fields
      this.footerBtns = [this.getCancelBtn()];
      // Load custom buttons defined in the field
      if (this.currentField.config 
        && this.currentField.config.footerBtns) {
        this.footerBtns = this.footerBtns.concat(
          this.currentField.config.footerBtns
        )
      }
      // Retrieve button override configuration.
      const ftBtns = this.currentField.config?.overrideDefaultFooterBtns 
      this.footerBtns.push(this.getClearBtn(ftBtns?.clearBtn));
      this.footerBtns.push(this.getBackBtn(ftBtns?.backBtn));
      this.footerBtns.push(this.getNextBtn(ftBtns?.nextBtn));
      this.footerBtns.push(this.getFinishBtn(ftBtns?.finishBtn));
    },
    setActiveFieldComputedValue() {
      if (typeof this.currentField === 'object' && typeof this.currentField.computedValue === 'function') {
        const fieldID = this.currentField.proxyID || this.currentField.id
        const formValue = this.formData[fieldID]
        if (formValue != null || !formValue) {
          this.computedFormData[fieldID] = this.currentField.computedValue(
            formValue, this.formData, this.computedFormData
          )
        } else {
          this.computedFormData[fieldID] = null
        }
      }
    },
    onFieldValue(value: Option | Array<Option>) {
      this.setActiveFieldValue(value);
      if ("requireNext" in this.currentField 
        && !this.currentField.requireNext) {
        this.onNext();
      }
    },
    async initFieldOnce(field: Field) {
      if (typeof field.init === 'function') {
        if (!this.fieldsInitialisedOnce[field.id]) {
          this.fieldsInitialisedOnce[`${field.id}`] = await field.init(this.formData, this.computedFormData)
        }
      }
    }
  }
});
</script>
