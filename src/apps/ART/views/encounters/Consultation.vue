<template>
  <his-standard-form
    :fields="fields"
    :onFinishAction="onFinish"
    :skipSummary="true"
    :cancelDestinationPath="cancelDestination"
  >
  </his-standard-form>
</template> 
<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import { FooterBtnEvent, Option } from "@/components/Forms/FieldInterface";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import Validation from "@/components/Forms/validations/StandardValidations";
import { alertConfirmation, infoAlert, toastSuccess, toastWarning } from "@/utils/Alerts";
import HisDate from "@/utils/Date";
import { findIndex, isEmpty, find } from "lodash";
import { ConsultationService } from "@/apps/ART/services/consultation_service";
import { UserService } from "@/services/user_service";
import { OrderService } from "@/services/order_service";
import { ConceptService } from "@/services/concept_service";
import AdherenceMixinVue from "./AdherenceMixin.vue";
import { modalController } from "@ionic/vue";
import VLReminderModal from "@/components/DataViews/VLReminderModal.vue";
import { ProgramService } from "@/services/program_service";
import { ARTLabService } from "../../services/lab_service";
import { infoActionSheet, optionsActionSheet } from "@/utils/ActionSheets";
import SideEffectsModalVue from "@/components/DataViews/SideEffectsModal.vue";
import ART_PROP from "@/apps/ART/art_global_props";
import { generateDateFields, EstimationFieldType } from "@/utils/HisFormHelpers/MultiFieldDateHelper"
import table from "@/components/DataViews/tables/ReportDataTable"
import { PatientTypeService } from "../../services/patient_type_service";
import { PrescriptionService } from "../../services/prescription_service";
import { DispensationService } from "../../services/dispensation_service";
import { AppEncounterService } from "@/services/app_encounter_service";
import Store from "@/composables/ApiStore"
import { getFacilities } from "@/utils/HisFormHelpers/LocationFieldOptions";
import { RegimenService } from "@/services/regimen_service";
import dayjs from "dayjs";
import { printLabOrderLbl } from "@/views/Labels";

interface TPTStatus {
  tpt: string;
  completed: boolean;
  tb_treatment: boolean;
  tpt_init_date?: string;
  tpt_complete_date?: string;
  tpt_end_date?: string;
  eligible: {
    "3HP": boolean;
    "6H": boolean;
  }
}

export default defineComponent({
  mixins: [AdherenceMixinVue],
  components: { HisStandardForm },
  data: () => ({
    fields: [] as any,
    currentWeight: -1 as any,
    weightTrail: [] as any,
    customRegimens: [] as any,
    labOrders: [] as any,
    weightLossPercentageNum: 0 as number,
    lostTenPercentBodyWeight: false as boolean,
    CxCaEnabled: false as boolean,
    CxCaStartAge: -1 as number,
    CxCaMaxAge: -1 as number,
    DueForCxCa: false as boolean,
    currentlyPregnant: false as boolean,
    currentlyBreastfeeding: false,
    patientHitMenopause: false as boolean,
    hasPregnancyObsToday: false as boolean,
    autoSelect3HP: false as boolean,
    labOrderFieldContext: {} as any,
    consultation: {} as any,
    prescription: {} as any,
    dispensation: {} as any,
    hasTbHistoryObs: false,
    allergicToSulphur: false as boolean | null,
    TBSuspected: false,
    presentedTBSymptoms: false,
    askAdherence: false as boolean,
    lastDrugsReceived: [] as any,
    sideEffectsHistory: {} as any,
    onPermanentFPMethods: false,
    reasonForDecliningTPTObs: {} as any,
    malawiSideEffectReasonObs: [] as any,
    otherSideEffectReasonObs: [] as any,
    wasTransferredIn: false as boolean,
    dateStartedArt: '' as string,
    clientHadAHysterectomy: false as any,
    isNoneClientPatient: false as boolean,
    tptStatus: {} as TPTStatus,
    customDrugs: [] as any,
    CxCaAppointDate: {} as any,
    hasTbTreatmentDate: false as boolean,
    isEligibleForTpt: false as boolean
  }),
  watch: {
    ready: {
      handler(value: boolean) {
        if (value) {
          this.consultation = new ConsultationService(this.patientID, this.providerID)
          this.prescription = new PrescriptionService(this.patientID, this.providerID)
          this.dispensation = new DispensationService(this.patientID, this.providerID)
          this.fields = this.getFields();
        }
      },
      immediate: true
    },
  },
  methods: {
    async onFinish(f: any, computedData: any) {
      const encounter = await this.consultation.createEncounter();  

      if (!encounter) return toastWarning("Unable to create encounter");

      const computedObs = await this.resolveObs(computedData, 'consultation')
      const secondaryObs = (await Promise.all([
        ...this.malawiSideEffectReasonObs,
        ...this.otherSideEffectReasonObs,
        this.reasonForDecliningTPTObs,
        this.buildTBStatusObs(f)
      ])).filter((d) => !isEmpty(d))

      const savedObs = await this.consultation.saveObservationList([
        ...computedObs, ...secondaryObs
      ])

      if (!isEmpty(this.drugObs) && !this.isNoneClientPatient) await this.saveAdherence();

      if (!savedObs) return toastWarning("Unable to save patient observations");

      toastSuccess("Observations and encounter created!");

      if (f.refer_to_clinician && f.refer_to_clinician.value ==='Yes') {
        this.gotoPatientDashboard()
        return
      }
      this.nextTask();
    },
    async getTptDrugs(formData: any){
      const drugFilters: string[] = []
      const tptHistory = formData.routine_tb_therapy.value
      if (isEmpty(this.customDrugs)) {
        this.customDrugs = await RegimenService.getCustomIngridients()
      }
      if(tptHistory.match(/ipt/i)) {
        drugFilters.push("INH or H (Isoniazid 300mg tablet)")
      } else if(tptHistory.includes("3HP (RFP + INH)")){
        drugFilters.push('INH or H (Isoniazid 300mg tablet)')
        drugFilters.push('Rifapentine (150mg)')
      } else if(tptHistory.includes("INH 300 / RFP 300 (3HP)")){
        drugFilters.push("INH 300 / RFP 300 (3HP)")
      }
      return !isEmpty(drugFilters) 
        ? this.customDrugs.filter((drug: any) => drugFilters.includes(drug.name))
          .map((drug: any) => ({
            label: drug.name,
            value: '',
            other: drug
          }))
        : []
    },
    async getTransferInStatus() {
      const receivedArvs = await ConsultationService.getFirstValueCoded(
        this.patientID, 'Ever received ART'
      )
      const transferLetterObs = await ConsultationService.getFirstObs(
        this.patientID, 'Has transfer letter'
      )
      const date = transferLetterObs ? HisDate.toStandardHisFormat(transferLetterObs.obs_datetime) : ''
      return receivedArvs 
        && receivedArvs.match(/yes/i) 
        && transferLetterObs 
        && `${transferLetterObs.value_coded}`.match(/yes/i)
        && date === this.consultation.getDate()
    },
    async getDateStartedArt() {
      const dateStarted = await ConsultationService.getFirstValueDatetime(this.patientID, 'Date ART started')
      return dateStarted ? HisDate.toStandardHisFormat(dateStarted) : ''
    },
    async checkIfWeightLossIsControlled(val: any) {
      if (this.lostTenPercentBodyWeight
        && `${val.label}`.match(/malnutrition/i)
        && `${val.value}`.match(/no/i)) {
        const action = await infoActionSheet(
          'Recommendation',
          `Patient's weight has dropped by ${this.weightLossPercentageNum}% , is this controlled weight loss??`,
          'Please verify',
          [
            { name: 'Confirm weight loss', slot: 'start', color: 'success'},
            { name: 'Confirm controlled', slot: 'end', color: 'primary'}
          ]
        )
        val.value = action === 'Confirm weight loss' ? 'Yes' : 'No'
      }
    },
    async checkVLReminder() {
      const vals = await ProgramService.getPatientVLInfo(this.patientID);
      if (vals.eligibile === true) {
        const modal = await modalController.create({
          component: VLReminderModal,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: { VLData: vals },
        });
        modal.present();
        const { data } = await modal.onDidDismiss();
        switch (data) {
          case "order":
            await this.labOrderFieldContext.launchOrderSelection();
            break;
          case "wait":
            await this.waitForVL();
            break;
          case "later":
            break;
          default:
            break;
        }
      }
    },
    async waitForVL(milestone: any = null) {
      const orderService = new ARTLabService(this.patientID, this.providerID);
      const encounter = await orderService.createEncounter();
      const observations = await orderService.buildDefferedOrder(milestone);
      if (!encounter) return toastWarning("Unable to create encounter");
      await orderService.saveObservationList(observations);
    },
    canScreenCxCa() {
      const age = this.patient.getAge()
      return this.patient.isFemale()
        && this.DueForCxCa
        && this.CxCaEnabled 
        && age >= this.CxCaStartAge 
        && age <= this.CxCaMaxAge
        && !this.clientHadAHysterectomy
    },
    pregnancyEligible() {
      return this.patient.isChildBearing() && !this.onPermanentFPMethods
    },
    showCurrentContraceptionMethods(formData: any) {
      return (this.pregnancyEligible()
        && !this.patientHitMenopause 
        && !this.isPregnant(formData))
        && !this.isANCclient()
    },
    showNewContraceptionMethods(formData: any) {
      return (
        this.pregnancyEligible() &&
        !this.patientHitMenopause &&
        !this.isPregnant(formData) &&
        !this.isLongTermFpMethod(formData) &&
        !this.isANCclient()
      )
    },
    isPregnant(formData: any) {
      if (formData.pregnant_breastfeeding) {
        return this.inArray(formData.pregnant_breastfeeding, 
          p => p.label === 'Pregnant' && p.value === 'Yes'
        )
      }
      return this.currentlyPregnant
    },
    isBreastFeeding(formData: any) {
      if (formData.pregnant_breastfeeding) {
        return this.inArray(formData.pregnant_breastfeeding, 
          p => p.label === 'Breastfeeding' && p.value === 'Yes'
        )
      }
      return this.currentlyBreastfeeding
    },
    isLongTermFpMethod(formData: any) {
      return (formData.current_fp_methods||[]).some(
        (d: Option) => /contraceptive implant|intrauterine|tubal ligation/i.test(`${d.value}`)
      )
    },
    async disableFPMethods(listData: Array<Option>, value: Option) {
      if (value.isChecked && value.label === "NONE") {
        return listData.map((i) => {
          if (i.label != "NONE") {
            i.isChecked = false;
            i.disabled = false;
          }
          return i;
        });
      } else if (value.label != "NONE" && value.isChecked) {
        if (value.label.match(/condom/gi)) infoAlert("Combine with other modern methods of family planning") 
        const noneIndex = findIndex(listData, { label: "NONE" });
        listData[noneIndex].isChecked = false;
        const vals = this.consultation.familyPlanningMethods(
          value.label,
          listData
        );
        const currentIndex = findIndex(vals, { label: value.label });
        vals[currentIndex].isChecked = true;
        return vals;
      } else {
        return listData.map((i) => {
          i.disabled = false;
          return i;
        });
      }
    },
    disablePrescriptions(listData: Array<Option>, value: Option) {
      if (value.isChecked && value.label === "NONE OF THE ABOVE") {
        return listData.map((i) => {
          if (i.label != "NONE OF THE ABOVE") i.isChecked = false;
          return i;
        });
      } else if (value.label != "NONE OF THE ABOVE" && value.isChecked) {
        const noneIndex = findIndex(listData, { label: "NONE OF THE ABOVE" });
        listData[noneIndex].isChecked = false;
      }
      return listData;
    },
    buildMedicationOrders(options: Option[]) {
      if (this.inArray(options, o => o.label === "NONE OF THE ABOVE")) {
        return this.consultation.buildValueCoded('Prescribe drugs', 'No')
      }
      const priscribed = this.consultation.buildValueCoded('Prescribe drugs', 'Yes')
      const medications = options.map( o => this.consultation.buildValueCoded(
        'Medication orders', o.label
      ))
      return [priscribed, ...medications]
    },
    declinedFPM(formData: any) {
      return this.inArray(formData.fp_methods, d => d.value === "NONE")
        && this.inArray(formData.current_fp_methods, d => d.value === "NONE")
    },
    riskOfUnplannedPregnancy(formData: any) {
      return formData.reason_for_no_fpm.value === "At risk of unplanned pregnancy"
    },
    showOtherSideEffects(formData: any) {
      return this.inArray(formData.side_effects, d => d.label === "Other" && d.value === "Yes")
    },
    hasTBSymptoms(formData: any) {
      this.presentedTBSymptoms = this.inArray(formData.tb_side_effects, d => d.value === "Yes")
      return this.presentedTBSymptoms
    },
    isTBSuspect(data: any) {
      this.TBSuspected = data.value.toString().match(/Yes|TB Suspected/i) ? true : false
      return this.TBSuspected
    },
    isAllergicToSulphur (data: any) {
      this.allergicToSulphur = data.value.match(/unknown/i) ? null : data.value.match(/yes/i) ? true : false
      return this.allergicToSulphur
    },
    async buildSideEffectObs(data: Option[], attr: 'malawiSideEffectReasonObs' | 'otherSideEffectReasonObs'): Promise<boolean> {
      const sideEffectReasons  = await this.getSideEffectsReasons(data)

      this[attr] = [] //Clear this incase side effects no longer exist
  
      if (sideEffectReasons === undefined) return false

      if (sideEffectReasons != -1) {
        const drugInducedConcept = ConceptService.getCachedConceptID('Drug induced', true)
        const isOtherReason = (reason: string) => `${reason}`.match(/other|drug/i) ? true : false
        this[attr] = sideEffectReasons.map((r: any) => ({
          'concept_id': drugInducedConcept,
          'value_coded': ConceptService.getCachedConceptID(r.label, true),
          'value_text': isOtherReason(r.reason) ? 'Past medication history' : null,
          'value_drug': !isOtherReason(r.reason) ? r.reason : null //Reason is drug ID number if caused by specific drug
        }))
      }
      return true
    },
    async getSideEffectsReasons(sideEffects: Option[]) {
      const allYes = sideEffects.filter(s => !(`${s.label}`.match(/other/i)) && s.value==='Yes')
      if (allYes.length > 0) {
        const modal = await modalController.create({
          component: SideEffectsModalVue,
          backdropDismiss: false,
          cssClass: "large-modal",
          componentProps: { sideEffects: allYes, drugs: this.lastDrugsReceived },
        });
        modal.present();
        const { data } = await modal.onDidDismiss();
        return data;
      }
      return -1
    },
    getFPMethods(exclusionList: string[] = [], preChecked: Array<Option>) {
      const methods = this.consultation.getFamilyPlanningMethods();
      const filtered = methods.filter(
        (data: string) => !exclusionList.includes(data)
      )
      return filtered.map((method: any) => ({
        label: method,
        value: method,
        isChecked: preChecked.map((i) => i.label).includes(method),
      }))
    },
    getContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "contraindication", true
      ).map((data) => data.name);
      return this.getOptions([...contraIndications, "Other"], preValues);
    },
    getOtherContraindications(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "side_effect", true
      ).map((data) => data.name);
      /**
       * HACK ALERT!!!
       * Dont want to show Other (Specify) as a last element
       */
      const lastElement = contraIndications.pop()
      return this.getOptions([...contraIndications, "Other (Specify)", `${lastElement}`], preValues)
    },
    getTBSymptoms(preValues: Array<Option>) {
      const contraIndications = ConceptService.getConceptsByCategory(
        "tb_symptom", true
      ).map((data) => data.name)
      return this.getOptions([...contraIndications], preValues);
    },
    getReasonsForNoCxcaOptions() {
      return ConceptService.getConceptsByCategory("reason_for_no_cxca")
        .map((c: any) => ({
          label: c.name,
          value: c.name,
          other: {
            c
          }
        }))
    },
    runAppendOptionParams(options: Option[], prechecked: Option[]) {
      const checkedOptions = prechecked.filter(o => o.isChecked).map(o => o.label)
      return options.map(o => {
        if (typeof o?.other?.appendOptionParams === 'function') {
          const appendedOptions = o?.other?.appendOptionParams()
          if (typeof appendedOptions === 'object')  {
            const option: Option = {
              label: o.label,
              value: o.value,
              other: o.other
            }
            if (appendedOptions.isChecked) {
              option.isChecked = appendedOptions.isChecked
              delete appendedOptions.isChecked
            } else {
              option.isChecked = checkedOptions.includes(o.label)
            }
            return { ...option, ...appendedOptions}
          }
        }
        return o
      })
    },
    /**
     * Checks formdata and previous observation state if a patient completed TPT
     */
    didCompletedTPT(formData: any) {
      return /complete/i.test(formData.routine_tb_therapy?.value) || this.tptStatus.completed
    },
    patientOnTpt(formData: any) {
      return this.didCompletedTPT(formData);
    },
    /**
     * Provides validations for TPT selections and value updates
     */
    async on3HPValueUpdate(listData: Option[], curOption: Option) {
      const is3HPorTPT = (i: Option) => i.label.match(/IPT|3HP/i) ? true : false

      //Checks if IPT and 3HP are both selected and returns a boolean
      const ipt3HPConflict: boolean = (() => {
        const checkedDrugs = listData.reduce(
        (checkedDrugs: string[], item: Option) => {
          if (is3HPorTPT(item) 
            && !(item.label in checkedDrugs) 
            && item.isChecked) {
            checkedDrugs.push(item.label)
          }
          return checkedDrugs
        }, [])
        return checkedDrugs.includes('IPT') 
          && (checkedDrugs.includes('3HP (RFP + INH)') 
          || checkedDrugs.includes('INH 300 / RFP 300 (3HP)'))
      })()

      // check if no tpt is present
      const noTpTPresent = is3HPorTPT(curOption) 
        && listData.filter(i => is3HPorTPT(i)).map(i => !i.isChecked)
          .every(Boolean)
  
      if (is3HPorTPT(curOption) && noTpTPresent && !this.tptStatus.completed) {
        const modal = await optionsActionSheet(
          'Reasons for declining TPT', 
          '',
          [
            'Patient declined',
            'Side-effects (previous or current)',
            'Stock-out',
            'Starting TB treatment',
            'Other'
          ],
          [
            { name : 'Done', slot: 'start', role: 'action'}
          ]
        )
        this.reasonForDecliningTPTObs = this.consultation.buildValueText(
          'Other reason for not seeking services', modal.selection
        )
      } else {
        this.reasonForDecliningTPTObs = {}
      }

      if (ipt3HPConflict) {
        const action = await infoActionSheet(
          "IPT / 3HP conflict",
          "IPT and 3HP can NOT be prescribed together",
          "Please pick either one",
          [
            { name: "Prescribe 3HP", slot: "start", color: "primary" },
            { name: "Prescribe IPT", slot: "end", color: "primary" },
          ]
        )
        return listData.map(i => {
          if (is3HPorTPT(i)) {
            i.isChecked =
              action === 'Prescribe IPT' && i.label === 'IPT' || 
              action ==='Prescribe 3HP' && i.label === 'INH 300 / RFP 300 (3HP)'
          }
          return i
        })
      }
      return listData.map(i => {
        // By default, toggle between variants of 3HP. All of them cant be selected at once
        if (curOption.label === '3HP (RFP + INH)' 
          && i.label === 'INH 300 / RFP 300 (3HP)'
          && curOption.isChecked) {
          i.isChecked = false
        } else if (curOption.label === 'INH 300 / RFP 300 (3HP)' 
          && i.label === '3HP (RFP + INH)'
          && curOption.isChecked ) {
            i.isChecked = false
        }
        return i
      })
    },
    medicationOrderOptions(formData: any, prechecked=[] as Option[]): Option[] {
      this.isEligibleForTpt = false
      const completedTpt = this.didCompletedTPT(formData)
      const everTakenTpt = this.tptStatus.tpt !== null
      const isCurrentlyBreastfeeding = this.isBreastFeeding(formData)
      const isPregnant = this.isPregnant(formData)

      const disableOption = (text: string) => ({
        disabled: true,
        isChecked: false,
        description: {
          color: "danger",
          show: "always",
          text
        }
      })

      const breastfeedingStatus = (() => {
        if (isCurrentlyBreastfeeding) {
          return {
            isChecked: false,
            description: {
              color: "danger",
              show: "always",
              text: "Patient is breast feeding"
            }
          }
        }
        return {}
      })()

      return this.runAppendOptionParams([
        this.toOption('ARVs', {
          appendOptionParams: () => ({ 
            isChecked: this.autoSelect3HP && !this.TBSuspected
          })
        }),
        this.toOption('CPT', {
          appendOptionParams: () => {
            if (this.autoSelect3HP && !this.TBSuspected 
              && !this.allergicToSulphur) {
              return { isChecked : true }
            }
            return this.allergicToSulphur 
              ? disableOption('Allergic to CPT')
              : { disabled: false }
          }
        }),
        this.toOption('3HP (RFP + INH)', {
          appendOptionParams: () => {
            if (completedTpt) return disableOption(`Completed TPT treatment`)
            if (formData.on_tb_treatment?.value === 'Yes') return disableOption('On TB treatment')
            if (this.tptStatus.tb_treatment) return disableOption(`Completed/on TB treatment`)
            if (/confirmed tb/i.test(formData.tb_status?.value)) return disableOption('Confirmed TB Not on treatment')
            if (this.TBSuspected) return disableOption('TB Suspect')
            if (isPregnant) return disableOption('Pregnant patient')
            if (this.currentWeight < 20) return disableOption('Weight below regulation')
            if (!this.tptStatus.eligible["3HP"] && !this.tptStatus.eligible["6H"]) return disableOption("Not eligible to start or re-start TPT");
            if (everTakenTpt && this.tptStatus.tpt !== '3HP (RFP + INH)' && !this.tptStatus.completed) {
              return disableOption(`On ${this.tptStatus.tpt} treatment`)
            }
            this.isEligibleForTpt = this.tptStatus.eligible["3HP"];
            if (this.tptStatus.tpt === '3HP (RFP + INH)' && !this.tptStatus.completed && this.isEligibleForTpt) return { isChecked: true, ...breastfeedingStatus }
          }
        }),
        this.toOption('INH 300 / RFP 300 (3HP)', {
          appendOptionParams: () => { 
            if (completedTpt) return disableOption(`Completed TPT treatment`)
            if (formData.on_tb_treatment?.value === 'Yes') return disableOption('On TB treatment')
            if (this.tptStatus.tb_treatment) return disableOption(`Completed/on TB treatment`)
            if (this.TBSuspected) return disableOption('TB Suspect')
            if (/confirmed tb/i.test(formData.tb_status?.value)) return disableOption('Confirmed TB Not on treatment')
            if (isPregnant) return disableOption('Pregnant patient')
            if (this.currentWeight < 30) return disableOption('Weight below regulation') 
            if (!this.tptStatus.eligible["3HP"] && !this.tptStatus.eligible["6H"]) return disableOption("Not eligible to start or re-start TPT");
            if (everTakenTpt && this.tptStatus.tpt !== 'INH 300 / RFP 300 (3HP)' && !this.tptStatus.completed) {
              return disableOption(`On ${this.tptStatus.tpt} treatment`)
            }
            this.isEligibleForTpt = this.tptStatus.eligible["3HP"];
            if (this.tptStatus.tpt === 'INH 300 / RFP 300 (3HP)' && !this.tptStatus.completed && this.isEligibleForTpt) return { isChecked: true, ...breastfeedingStatus }
            return { isChecked: this.autoSelect3HP && this.isEligibleForTpt , ...breastfeedingStatus }
          }
        }),
        this.toOption('IPT', {
          appendOptionParams: () => {
            if (completedTpt) return disableOption(`Completed TPT treatment`)
            if (formData.on_tb_treatment?.value === 'Yes') return disableOption('On TB treatment')
            if (this.tptStatus.tb_treatment) return disableOption(`Completed/on TB treatment`)
            if (this.TBSuspected) return disableOption('TB Suspect')
            if (/confirmed tb/i.test(formData.tb_status?.value)) return disableOption('Confirmed TB Not on treatment')
            if (isPregnant) return disableOption('Pregnant patient')
            if (!this.tptStatus.eligible["3HP"] && !this.tptStatus.eligible["6H"]) return disableOption("Not eligible to start or re-start TPT");
            if (everTakenTpt && this.tptStatus.tpt !== 'IPT' && !this.tptStatus.completed) {
              return disableOption(`On ${this.tptStatus.tpt} treatment`)
            }
            this.isEligibleForTpt = this.tptStatus.eligible["6H"];
            if (this.tptStatus.tpt === 'IPT' && !this.tptStatus.completed && this.isEligibleForTpt) return { isChecked: true, ...breastfeedingStatus }
          }
        }),
        this.toOption('NONE OF THE ABOVE')
      ], prechecked)
    },
    async getVlLabData() {
      return OrderService.formatLabs((await Store.get('GET_LAB_ORDERS_WITH_GIVEN_RESULT_STATUS', { patientID: this.patientID })));
    },
    isANCclient() {
      return ProgramService.getSuspendedProgram() === 'ANC'
    },
    isRapidTestPositive(formData: Record<string, any>) {
      const CXR = 'chest x-ray'
      const mWRD = 'Molecular WHO Recommended Rapid Diagnostic test'
      const screen = formData.tb_screening_testing_results.reduce((a: any, c: any) => {
        return { ...a, [c.label]: c.value }
      }, {})
      if (screen[mWRD] === 'Negative') {
        return false
      }
      if (screen[CXR] === 'Positive' || screen[mWRD] === 'Positive') {
        return true
      }
      return false
    },
    buildTBStatusObs(formData: Record<string, any>) {
      if (formData?.on_tb_treatment?.value === 'Yes') {
        return this.consultation.buildValueCoded("TB Status", "Confirmed TB on treatment")
      }
      if (formData?.tb_status) {
        return this.consultation.buildValueCoded("TB Status", formData.tb_status.value)
      }
      if (formData?.tb_screening_testing_results) {
        if (this.isRapidTestPositive(formData)) {
          return this.consultation.buildValueCoded("TB Status", 'TB Suspected')
        } else {
          return this.consultation.buildValueCoded("TB Status", 'TB NOT suspected')
        }
      }
      if (formData?.tb_side_effects && !this.hasTBSymptoms(formData)) {
        return this.consultation.buildValueCoded("TB Status", 'TB NOT suspected')
      }
      return {}
    },
    getFields(): any {
      return [
        {
          id: "other_patient_prescription",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          init: async () => {
            const isGuardian = (await this.consultation.getClient()) === "No";
            if (isGuardian) {
              this.isNoneClientPatient = true
            } else {
              this.isNoneClientPatient = (await PatientTypeService.isDrugRefillPatient(this.patientID))
                ? true : false
            }
            if (this.isNoneClientPatient) {
              this.currentWeight = Number((await this.patient.getRecentWeight()))
              this.autoSelect3HP = await Store.get('ART_AUTO_3HP_SELECTION')
              this.tptStatus = await this.consultation.getTptTreatmentStatus();
            }
            return true
          },
          beforeNext: async (v: Option[], f: any) => {
            if (!Object.keys(this.reasonForDecliningTPTObs).length && 
                !this.isBreastFeeding(f) && 
                this.isEligibleForTpt &&
                !this.patientOnTpt(f) &&
                !v.some(d => /3hp|ipt/i.test(d.label))) {
                  if ((await alertConfirmation('Are you sure you want to proceed without prescribing TPT?'))) {
                    const modal = await optionsActionSheet(
                      'Reasons for declining TPT', 
                      '',
                      [
                        'Patient declined',
                        'Side-effects (previous or current)',
                        'Stock-out',
                        'Starting TB treatment',
                        'Other'
                      ],
                      [
                        { name : 'Done', slot: 'start', role: 'action'}
                      ]
                    )
                    this.reasonForDecliningTPTObs = this.consultation.buildValueText(
                      'Other reason for not seeking services', modal.selection
                    )
                } else {
                  this.reasonForDecliningTPTObs = {}
                  return false
                }
            }
            return true
          },
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option[]) => ({ 
            tag: 'consultation',
            obs: this.buildMedicationOrders(v)
          }),
          onValueUpdate: (listData: Array<Option>, value: Option) => {          
            const list = this.disablePrescriptions(listData, value);
            return this.on3HPValueUpdate(list, value)
          },
          options: (formData: any, _c: Array<Option>, _cd: any, l: any) => {
            return !isEmpty(l) ? l : this.medicationOrderOptions(formData)
          },
          condition: () => this.isNoneClientPatient,
          exitsForm: () => true
        },
        /**
        * DRUG TRANSFER IN INITIATION 
        */
        ...generateDateFields({
          id: 'date_last_received_arvs',
          helpText: 'Last ARV Dispensation',
          required: true,
          init: async () => {
            this.wasTransferredIn = (await this.getTransferInStatus()) || false
            this.dateStartedArt = await this.getDateStartedArt()
            return true
          },
          condition: () => this.wasTransferredIn,
          minDate: () => this.dateStartedArt,
          maxDate: () => this.consultation.getDate(),
          computeValue: (date: string) => {
            this.prescription.setDate(date)
            return {
              tag: 'consultation',
              date,
              obs: this.consultation.buildValueDate(
                'Date drug received from previous facility', date
              )
            }
          },
          estimation: {
            allowUnknown: false
          }
        }),
        {
          id: 'previous_arvs_received',
          helpText: 'Last ARV drugs dispensed',
          type: FieldType.TT_MULTIPLE_SELECT,
          computedValue: (v: Option[]) => v.map(d => d.other),
          validation: (v: Option[]) => Validation.required(v),
          options: async () => {
            if (!isEmpty(this.customRegimens)) return this.customRegimens
            const p = new PrescriptionService(this.patientID, this.providerID)
            this.customRegimens = (await p.getARVs())
              .map((drug: any ) => ({
                label: drug.name,
                value: drug.drug_id,
                other: { ...drug }
              })) as Option[]
            return this.customRegimens
          },
          config: {
            showKeyboard: true
          },
          condition: () => this.wasTransferredIn
        },
        {
          id: 'drug_interval',
          helpText: 'Duration period for last received ARVs',
          type: FieldType.TT_NEXT_VISIT_INTERVAL_SELECTION,
          condition: () => this.wasTransferredIn,
          validation: (val: Option) => Validation.required(val),
          computedValue: (d: Option) => d.other.nextAppointment,
          options: () => {
            const intervals = [
              { label: '2 weeks', value: 14 },
              { label: '1 month', value: 28 },
              { label: '2 months', value: 56 },
              { label: '3 months', value: 84 },
              { label: '4 months', value: 112 },
              { label: '5 months', value: 140 },
              { label: '6 months', value: 168 },
              { label: '7 months', value: 196 },
              { label: '8 months', value: 224 },
              { label: '9 months', value: 252 },
              { label: '10 months', value: 280 },
              { label: '11 months', value: 308 },                        
              { label: '12 months', value: 336 }
            ]
            return intervals.map(({label, value}: Option) => {
              this.prescription.setNextVisitInterval(value)
              const nextAppointment = this.prescription.calculateDateFromInterval()
              return {
                label,
                value,
                other: {
                  label: 'Medication run-out date:',
                  value: HisDate.toStandardHisDisplayFormat(nextAppointment),
                  nextAppointment,
                  other: {
                    label: "",
                    value: []
                  }
                }
              }
            })
          }
        },
        {
          id: 'arv_quantities',
          helpText: 'Amount of drugs dispensed (From last ART Facility)',
          type: FieldType.TT_DRUG_TRANSFER_IN,
          validation: (v: Option[]) => this.validateSeries([
            () => Validation.required(v),
            () => v.map((i: Option) => i.value === '' || i?.other?.pillsBrought === '')
              .some(Boolean) ? ['Some Drugs are missing values'] : null
          ]),
          computedValue: (v: Option[], f: any, c: any) => ({
            tag: 'consultation',
            obs:  v.map(async (d: any) => {
              const drugID: number = d?.other?.drug?.drug_id || 0
              return { 
                ...(await this.consultation.buildObs(
                  'Drug received from previous facility', {
                    'value_drug': drugID,
                    'value_datetime': c?.drug_interval || null,
                    'value_numeric': d?.value || 0
                    }
                )),
                child: [
                  await this.consultation.buildObs(
                    'Number of tablets brought to clinic', {
                      'value_drug': drugID,
                      'value_numeric': d?.other?.pillsBrought || -1,
                      'value_datetime': c?.date_last_received_arvs?.date || null
                    }
                  )
                ]
              }
            })
          }),
          options: (_: any, c: any, listData: Option) => {
            return c.previous_arvs_received
              .map((d: any) => {
                const drugName = d['alternative_drug_name'] || d['drug_name'] || d['name']
                const prevValue = find(listData, { label: drugName })
                let qty = ''
                let rmndr = ''
                if (prevValue) {
                  qty = prevValue?.value
                  rmndr = prevValue?.other?.pillsBrought
                }
                return {
                  label: drugName,
                  value: qty,
                  other: {
                    drug: d,
                    pillsBrought: rmndr
                  }
                }
              })
          },
          condition: () => this.wasTransferredIn
        },
        /**
        * END OF DRUG TRANSFER IN
        */
        {
          id: "patient_lab_orders",
          helpText: "Lab orders",
          type: FieldType.TT_LAB_ORDERS,
          init: async () => {
            this.labOrders = await this.getVlLabData()
            return true
          },
          unload: async () => {
            await this.checkVLReminder()
            // Check if released results were given to the patient
            const noGivenResults = this.labOrders.filter((r: any) => r.result_given === 'No')
            if (noGivenResults.length && (await alertConfirmation('Result(s) Given to Client?'))) {
              const enc = new AppEncounterService(this.patientID, -1, this.providerID)
              // flatten array and save observations for results given
              const obs = noGivenResults.reduce((all: any, result: any) => [
                ...all, ...(result.resultIds.map(async (resultID: number) =>{
                  enc.encounterID = result.encounter_id
                  return enc.saveObs((await enc.buildObs("Result Given to Client", {
                      "value_coded": "Yes",
                      "obs_group_id": resultID
                    })))
                })) 
              ], [])
              await Promise.all(obs)
            }
            // refresh data
            this.labOrders = await this.getVlLabData()
          },
          onload: (fieldContext: any) =>  this.labOrderFieldContext = fieldContext,
          options: () => {
            return [
              {
                label: "Lab orders",
                value: "order trail",
                other: {
                  values: this.labOrders
                }
              }
            ]
          },
          config: {
            printOrder: (orderID: number) => {
              return printLabOrderLbl(orderID)
            },
            hiddenFooterBtns: ["Clear"],
            footerBtns: [
              {
                name: "Order",
                size: "large",
                slot: "end",
                color: "primary",
                visible: true,
                onClick: async () => {
                  if (!isEmpty(this.labOrderFieldContext)) {
                    await this.labOrderFieldContext.launchOrderSelection();
                  }
                }
              }
            ]
          },
        },
        {
          id: "pregnant_breastfeeding",
          helpText: `Patient Pregnant or breastfeeding?`,
          init: async () => {
            if (this.patient.isFemale()) {
              if (this.patient.isChildBearing()) {
                this.hasPregnancyObsToday = await this.patient.hasPregnancyObsToday()
                this.currentlyPregnant = await this.patient.isPregnant()
                this.currentlyBreastfeeding = await this.patient.isBreastfeeding();
              }
              this.onPermanentFPMethods = await this.consultation.getTLObs();
            }
            return true
          },
          condition: () => !this.hasPregnancyObsToday && this.pregnancyEligible(),
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.map(d => this.consultation.buildValueCoded(d.other.concept, d.value)).concat(
              this.isANCclient() ? [this.consultation.buildValueCoded('Is patient pregnant', 'Yes')] : []
            ),
          }),
          options: (formData: any) => {
            const options = []
            // Because ANC clients are always Pregnant!
            if (!this.isANCclient()) options.push({
              label: "Pregnant",
              value: "",
              other: {
                values: this.yesNoOptions(),
                concept: "Is patient pregnant",
              }
            })

            options.push({
              label: "Breastfeeding",
              value: "",
              other: {
                values: this.yesNoOptions(),
                concept: "Is patient breast feeding",
              }
            })

            return formData.pregnant_breastfeeding || options
          }
        },
        {
          id: "patient_weight_chart",
          helpText: "Patient weight chart",
          type: FieldType.TT_WEIGHT_CHART,
          init: async () => {
            this.weightTrail = await this.patient.getWeightHistory()
            this.weightLossPercentageNum = this.patient.getWeightLossPercentageFromTrail(this.weightTrail)
            this.lostTenPercentBodyWeight = this.weightLossPercentageNum >= 10
            return true
          },
          options: async () => {
            const bmi = await this.patient.getBMI();
            const values = this.weightTrail;
            return [
              {
                label: "Weight for patient",
                value: "Weight trail",
                other: {
                  bmi,
                  values: values.map((d: any) => ({
                    x: HisDate.toStandardHisDisplayFormat(d.date),
                    y: d.weight,
                  })),
                  age: this.patient.getAge(),
                },
              },
            ];
          },
          config: {
            hiddenFooterBtns: ["Clear"],
          },
        },
        {
          id: "has_fp_methods",
          helpText: "",
          type: FieldType.TT_TEXT_BANNER,
          condition: () => this.onPermanentFPMethods,
          options: () => this.mapStrToOptions([
            "Patient is on Tubal ligation method"
          ])
        },
        {
          id: "current_fp_methods",
          helpText: "What method are you currently on?",
          type: FieldType.TT_MULTIPLE_SELECT,
          init: async () => {
            if (this.patient.isFemale()) {
              this.patientHitMenopause = await this.consultation.patientHitMenopause()
            }
            return true
          },
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.map(d => this.consultation.buildValueCoded('Family planning method', d.value))
          }),
          condition: (formData: any) => this.showCurrentContraceptionMethods(formData),
          options: (_: any, checked: Array<Option>) =>this.getFPMethods([], checked),
        },
        {
          id: "fp_methods",
          helpText: "What method are you providing today?",
          type: FieldType.TT_MULTIPLE_SELECT,
          condition: (formData: any) => this.showNewContraceptionMethods(formData),
          validation: (data: any) => Validation.required(data),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            return this.disableFPMethods(listData, value);
          },
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.map((d: Option) => this.consultation.buildValueCoded('Family planning, action to take', d.value))
          }),
          options: (_: any, checked: Array<Option>) => this.getFPMethods([], checked)
        },
        {
          id: "reason_for_no_fpm",
          helpText: "Main reason for not using family planning methods",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.declinedFPM(formData),
          computedValue: (v: Option) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueText("Why does the woman not use birth control", v.value) 
          }),
          options: () => this.mapStrToOptions([
            "Not Sexually active",
            "Patient want to get pregnant",
            "Not needed for medical reasons",
            "At risk of unplanned pregnancy",
            "Menopause"
          ])
        },
        {
          id: "specific_reason_for_no_fpm",
          helpText: "Specific reason for not using family planning methods",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (v: Option) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueText("Reason for not using contraceptives", v.value)
          }),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          options: () => this.mapStrToOptions([
            "Following wishes of spouse",
            "Religious reasons",
            "Afraid of side effects",
            "Never though about it",
            "Indifferent (does not mind getting pregnant)"
          ])
        },
        {
          id: "offer_contraceptives",
          helpText: "Offer contraceptives",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => this.riskOfUnplannedPregnancy(formData),
          computedValue: (v: any) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueCoded("Family planning, action to take", v.value)
          }),
          options: () => [
            { label: "Accepted", value: "Yes" },
            { label: "Declined", value: "No" },
            { label: "Discuss with spouse", value: "Discuss with spouse" },
          ]
        },
        {
          id: "offered_intervention",
          helpText: "Offered intervention",
          type: FieldType.TT_MULTIPLE_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => formData.offer_contraceptives.value === "Accepted",
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.map(d => this.consultation.buildValueCoded(d.label, d.value))
          }),
          options: (_: any, checked: Array<Option>) => this.getFPMethods(["NONE"], checked),
        },
        {
          id: "offer_cxca",
          helpText: "Refer client for CxCa screening",
          type: FieldType.TT_SELECT,
          init: async () => {
            if (this.patient.isFemale()) {
              this.CxCaEnabled = await ART_PROP.cervicalCancerScreeningEnabled()
              if (this.CxCaEnabled) {
                const { start, end } = await ART_PROP.cervicalCancerScreeningAgeBounds()
                this.CxCaMaxAge = end
                this.CxCaStartAge = start
                this.DueForCxCa = await this.consultation.clientDueForCxCa()
                this.clientHadAHysterectomy =  await this.consultation.clientHasHadAHysterectomy();
              }
            }
            return true
          },
          validation: (v: Option) => Validation.required(v),
          condition: (f: any) => this.canScreenCxCa() && !this.isPregnant(f),
          computedValue: (v: Option) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueCoded('Offer CxCa', v.value)
          }),
          options: () => this.yesNoOptions()
        },
        {
          id: "cxca_reminder",
          helpText: "CxCa Screening Reminder",
          type: FieldType.TT_TEXT_BANNER,
          init: async () => {
            if (this.CxCaEnabled && this.patient.isFemale()) {
              this.CxCaAppointDate = await this.patient.nextAppointment(24)
            }
            return true;
          },
          condition: () => {
            const ONE_MONTH = 30;
            return ONE_MONTH > HisDate.dateDiffInDays(this.CxCaAppointDate, this.consultation.date)
          },
          options: () => this.mapStrToOptions([
            `Patient is due for Cervical Cancer Screening on ${HisDate.toStandardHisDisplayFormat(this.CxCaAppointDate.appointment_date)}`
          ])
        },
        {
          id: "reason_for_no_cxca",
          helpText: "Reason for NOT offering CxCa",
          type: FieldType.TT_SELECT,
          validation: (v: Option) => Validation.required(v),
          condition: (f: any) => f.offer_cxca.value === 'No',
          computedValue: (v: Option) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueCoded("Reason for NOT offering CxCa", v.value)
          }),
          options: () => this.getReasonsForNoCxcaOptions(),
        },
        ...generateDateFields({
          id: 'previous_cxca_test_date',
          helpText: 'Previous CxCa test',
          required: true,
          minDate: () => this.patient.getBirthdate(),
          maxDate: () => ConsultationService.getSessionDate(),
          condition: (f: any) => f.reason_for_no_cxca.value === 'Not due for screening',
          computeValue: (date: string, isEstimate: boolean) => {
            if (isEstimate) {
              return {
                tag: 'consultation',
                obs: this.consultation.buildValueDateEstimated('CxCa test date', date)
              }
            } else {
              return {
                tag: 'consultation',
                obs: this.consultation.buildValueDate('CxCa test date', date) 
              }
            }
          },
          estimation: {
            allowUnknown: true,
            estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
          }
        }),
        {
          id: 'previous_side_effects',
          helpText: 'Side effects / Contraindications history',
          type: FieldType.TT_DATA_TABLE,
          init: async () => {
            this.sideEffectsHistory = await this.consultation.getDrugSideEffects()
            return true
          },
          config: {
            columns: () => [
              [
                table.thTxt('Date'),
                table.thTxt('Condition'),
                table.thTxt('Drug induced'),
                table.thTxt('Drug')
              ]
            ],
            rows: () => {
              return Object.keys(this.sideEffectsHistory)
              .map((k: string) =>
                Object.values(this.sideEffectsHistory[k])
                .filter((d: any) => !isEmpty(d.name))
                .map((d: any) => [
                  table.tdDate(k),
                  table.td(d.name),
                  table.td(d.drug_induced ? 'Yes' : 'No'),
                  table.td(d.drug)
              ]))
              .reduce((accum, cur) => accum.concat(cur), [])
            }
          }
        },
        {
          id: "side_effects",
          helpText: "Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          init: async () => {
            this.lastDrugsReceived = await this.consultation.getPreviousDrugs();
            return true
          },
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.map(async (d) => ({
              ...(await this.consultation.buildValueCoded('Malawi ART side effects', d.label)),
              child: [await this.consultation.buildValueCoded(d.label, d.value)]
            }))
          }),
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'malawiSideEffectReasonObs'),
          options: (_: any, checked: Array<Option>) => this.getContraindications(checked)
        },
        {
          id: "other_side_effects",
          helpText: "Other Contraindications / Side effects (select either 'Yes' or 'No')",
          type: FieldType.TT_MULTIPLE_YES_NO,
          onValue: async (val: any) => {
            await this.checkIfWeightLossIsControlled(val)
            return true
          },
          condition: (formData: any) => this.showOtherSideEffects(formData),
          onConditionFalse: () => this.otherSideEffectReasonObs = [],
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data),
            ]),
          computedValue: (v: Option[]) => ({
            tag: 'consultation',
            obs: v.filter(d => d.label != 'Other (Specify)')
              .map(async (d) => ({
              ...(await this.consultation.buildValueCoded('Other side effect', d.label)),
              child: [await this.consultation.buildValueCoded(d.label, d.value)]
            }))
          }),
          beforeNext: (data: Option[]) => this.buildSideEffectObs(data, 'otherSideEffectReasonObs'),
          options: (_: any, checked: Array<Option>) => this.getOtherContraindications(checked),
        },
        {
          id: 'other_side_effect_specify',
          helpText: "Other Contraindications / Side effects (specify)",
          type: FieldType.TT_NOTE,
          computedValue: async (v: Option) => ({
            tag: 'consultation',
            obs: {
              ...(await this.consultation.buildValueCoded('Other side effect', 'Other (Specify)')),
              child: [await this.consultation.buildValueText('Other (Specify)', v.value )]
            }
          }),
          condition: (f: any) => this.inArray(
            f.other_side_effects, d => d.label === "Other (Specify)" && d.value === 'Yes'
          ),
          validation: (v: Option) => Validation.required(v)
        },
        {
          id: "on_tb_treatment",
          helpText: "On TB Treatment?",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (data: any) => ({ 
            tag: 'consultation', 
            obs: this.consultation.buildValueCoded("TB treatment", data.value)
          }),
          options: () => this.yesNoOptions()
        },
        {
          id: "tb_date_started_treatment_known",
          helpText: "TB treatment history",
          type: FieldType.TT_YES_NO,
          init: async () => {
            // TODO: Account for TB interruptions in the future
            this.hasTbTreatmentDate = false
            const startDate = await ConsultationService.getFirstValueDatetime(
              this.patientID, 'TB treatment start date'
            )
            const tbPeriod = await ConsultationService.getFirstValueNumber(
              this.patientID, 'TB treatment period'
            )
            if (tbPeriod && startDate) {
              const timeElapse = dayjs(this.consultation.date).diff(startDate, 'months')
              this.hasTbTreatmentDate = timeElapse <= tbPeriod
            }
            return true
          },
          validation: (data: any) => Validation.required(data),
          condition: (f: any) => !this.hasTbTreatmentDate && f.on_tb_treatment.label === 'Yes',
          options: () => {
            return [
              {
                label: 'Date started treatment known?',
                values: this.yesNoOptions()
              }
            ]
          }
        },
        ...generateDateFields({
          id: 'tb_start_date',
          helpText: 'Enter start date for treatment?',
          required: true,
          minDate: () => this.patient.getBirthdate(),
          maxDate: () => ConsultationService.getSessionDate(),
          condition: (f: any) => f.tb_date_started_treatment_known === 'Yes',
          computeValue: (date: string) => {
            return {
              tag: 'consultation',
              obs: this.consultation.buildValueDate('TB treatment start date', date)
            }
          },
          estimation: {
            allowUnknown: false
          }
        }),
        {
          id: "tb_treatment_period",
          helpText: "Enter Full TB Treatment Period (In Months)",
          type: FieldType.TT_NUMBER,
          validation: (v: Option) => Validation.validateSeries([
            () => Validation.required(v),
            () => Validation.isNumber(v),
            () => Validation.rangeOf(v, 3, 9)
          ]),
          condition: (f: any) => f.tb_date_started_treatment_known === 'Yes',
          computedValue: (v: Option) => {
            return {
              tag: 'consultation',
              obs: this.consultation.buildValueNumber('TB treatment period', v.value)
            }
          }
        },
        {
          id: "tb_side_effects",
          helpText: "TB Associated symptoms",
          type: FieldType.TT_MULTIPLE_YES_NO,
          onValue: async (val: any) => {
            await this.checkIfWeightLossIsControlled(val)
            return true
          },
          validation: (data: any) =>
            this.validateSeries([
              () => Validation.required(data),
              () => Validation.anyEmpty(data)
          ]), 
          condition: (formData: any) => formData.on_tb_treatment.value.match(/no/i),
          options: (_: any, checked: Array<Option>) => this.getTBSymptoms(checked),
          computedValue: (vals: Option[]) => ({
            tag: 'consultation',
            obs: vals.map(async (data: Option) => ({
              ...(await this.consultation.buildValueCoded("Routine TB Screening", data.label)),
              child: [await this.consultation.buildValueCoded(data.label, data.value)]
            }))
          })
        },
        {
          id: "tb_screening_testing_methods",
          helpText: "TB screening method used",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) => Validation.anyEmpty(data), 
          condition: (formData: any) => formData.on_tb_treatment.value.match(/no/i),
          options: (f: any) => {
            return [
              {
                label: 'chest x-ray',
                value: (f.tb_screening_testing_methods||[])[0]?.value||'',
                other: {
                  values: this.yesNoOptions(),
                  resultOptions: [
                    { label: "Abnormal", value: "Positive" },
                    { label: "Normal", value: "Negative" }
                  ]
                },
              },
              {
                label: "Molecular WHO Recommended Rapid Diagnostic test",
                value: (f.tb_screening_testing_methods||[])[1]?.value||'',
                other: {
                  values: this.yesNoOptions(),
                  resultOptions: [
                    { label: "Positive", value: "Positive" },
                    { label: "Negative", value: "Negative" }
                  ]
                }
              }
            ]
          }
        },
        {
          id: "tb_screening_testing_results",
          helpText: "TB screening result",
          type: FieldType.TT_MULTIPLE_YES_NO,
          validation: (data: any) => Validation.required(data), 
          condition: (formData: any) => formData.tb_screening_testing_methods.some(
            (res: Option) => res.value === 'Yes'
          ),
          options: (f: any) => {
            const screenings = f.tb_screening_testing_methods.filter((data: Option) => data.value === 'Yes')
            return screenings.map((data: Option) => {
              return {
                value: ((f.tb_screening_testing_results||[]).find((d: Option) => d.label === data.label)||[])?.value||'',
                label: data.label,
                other: {
                  values: data.other.resultOptions
                }
              }
            })
          },
          computedValue: (vals: Option[]) => ({
            tag: 'consultation',
            obs: vals.map(async (data: Option) => ({
              ...(await this.consultation.buildValueCoded("TB screening method used", data.label)),
              child: [await this.consultation.buildValueCoded(data.label, data.value)]
            }))
          })
        },
        {
          id: "tb_status",
          helpText: "TB Status",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          condition: (formData: any) => { 
            if (formData.tb_screening_testing_results) {
              return this.isRapidTestPositive(formData)
            }
            return this.hasTBSymptoms(formData) 
          },
          onConditionFalse: () => this.TBSuspected = false,
          defaultValue: () => 'TB Suspected',
          beforeNext: async (data: Option) => {
            if (this.isTBSuspect(data)) {
              const action = await infoActionSheet(
                "Lab Order",
                "The patient is a TB suspect. Do you want to take lab orders?",
                "",
                [
                  { name: "Order now", slot: "start", color: "success" },
                  { name: "NOT now", slot: "end", color: "danger" },
                ]
              )
              if (action === 'Order now') this.labOrderFieldContext.launchOrderSelection([
                'TB Microscopic Exam', 
                'GeneXpert', 
                'Culture & Sensitivity',
                'TB Tests'
              ])
            }
            return true
          },
          options: () => this.mapStrToOptions([
            "TB NOT suspected",
            "TB Suspected",
            "Confirmed TB Not on treatment",
          ])
        },
        {
          id: "routine_tb_therapy",
          helpText: "TB preventive therapy (TPT) history",
          type: FieldType.TT_SELECT,
          init: async () => {
            this.hasTbHistoryObs = await this.consultation.hasTreatmentHistoryObs()
            return true
          },
          validation: (data: any) => Validation.required(data),
          condition: () => !this.hasTbHistoryObs,
          computedValue: (data: any) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueText("Previous TB treatment history", data.value)
          }),
          options: (f: any) => {
            let options: string[] = []
            if(/no/i.test(f.on_tb_treatment.value)) {
              options = [
                "Currently on IPT",
                "Currently on 3HP (RFP + INH)",
                "Currently on INH 300 / RFP 300 (3HP)"
              ]
            }
            options = options.concat([
              "Complete course of 3HP in the past (3 months RFP+INH)",
              "Complete course of IPT in the past (min. 6 months of INH)",
              "Aborted course of 3HP (RFP + INH) in the past",
              "Aborted course of INH 300 / RFP 300 (3HP) in the past",
              "Aborted course of IPT in the past",
              "Never taken IPT or 3HP"
            ])
            return this.mapStrToOptions(options)
          }
        },
        ...generateDateFields({
          id: 'date_started_tpt',
          helpText: 'Started TPT Treatment',
          required: true,
          minDate: () => this.patient.getBirthdate(),
          maxDate: () => ConsultationService.getSessionDate(),
          condition: (f: any) => f.routine_tb_therapy.value.match(/currently/i),
          computeValue: (date: string) => date,
          estimation: {
            allowUnknown: true,
            estimationFieldType: EstimationFieldType.MONTH_ESTIMATE_FIELD
          }
        }),
        {
          id: "tpt_drugs_received",
          helpText: "TPT Drugs Received",
          required: true,
          condition: (f: any) => f.routine_tb_therapy.value.match(/currently/i),
          type: FieldType.TT_ADHERENCE_INPUT,
          options: (f: any) => this.getTptDrugs(f),
          computedValue: (drugs: Option[], f: any, c: any) => ({
            tag: 'consultation',
            obs:  drugs.map(async (drug: any) => this.consultation.buildObs(
              'TPT Drugs Received', 
              {
                'value_drug': drug?.other?.drug_id || 0,
                'value_datetime': c?.date_started_tpt || null,
                'value_numeric': drug?.value || 0
              }
            ))
          }),
          config: {
            titles: {
              label: 'Drug name',
              value: 'Tablets received'
            }
          }
        },
        {
          id: 'tpt_tranfer_from',
          helpText: 'Facility client is transferring in from',
          type: FieldType.TT_SELECT,
          computedValue: ({label}: Option) => ({
            tag:'consultation',
            obs: this.consultation.buildValueText(
              'Location TPT last received', label
            )
          }),
          validation: (val: any) => Validation.required(val),
          condition: (f: any) => f.routine_tb_therapy.value.match(/currently/i),
          options: (_: any, filter='') => getFacilities(filter),
          config: {
            showKeyboard: true,
            isFilterDataViaApi: true
          }
        },
        {
          id: "allergic_to_sulphur",
          helpText: "Allergic to Cotrimoxazole",
          type: FieldType.TT_SELECT,
          validation: (data: any) => Validation.required(data),
          computedValue: (data: any) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueCoded("Allergic to sulphur", data.value)
          }),
          beforeNext: (data: any) => {
            this.isAllergicToSulphur(data);
            return true;
          },
          options: () => this.yesNoUnknownOptions()
        },
        ...this.getAdherenceFields(true),
        {
          id: "refer_to_clinician",
          helpText: "Refer to clinician",
          type: FieldType.TT_SELECT,
          condition: () => UserService.isNurse(),
          validation: (data: any) => Validation.required(data),
          computedValue: (data: any) => ({
            tag: 'consultation',
            obs: this.consultation.buildValueCoded("Refer to clinician", data.value)
          }),
          options: () => this.yesNoOptions(),
        },
        {
          id: "medication_to_prescribe",
          proxyID: "prescription",
          helpText: "Medication to prescribe during this visit",
          type: FieldType.TT_MULTIPLE_SELECT,
          init: async () => {
            if (!this.isNoneClientPatient) {
              this.currentWeight = Number((await this.patient.getRecentWeight()))
              this.autoSelect3HP = await Store.get('ART_AUTO_3HP_SELECTION')
              this.tptStatus = await this.consultation.getTptTreatmentStatus();
            }
            return true
          },
          beforeNext: async (v: Option[], f: any) => {
            if (!Object.keys(this.reasonForDecliningTPTObs).length && 
                !this.isBreastFeeding(f) && 
                this.isEligibleForTpt &&
                !this.patientOnTpt(f) &&
                !v.some(d => /3hp|ipt/i.test(d.label))) {
                  if ((await alertConfirmation('Are you sure you want to proceed without prescribing TPT?'))) {
                    const modal = await optionsActionSheet(
                      'Reasons for declining TPT', 
                      '',
                      [
                        'Patient declined',
                        'Side-effects (previous or current)',
                        'Stock-out',
                        'Starting TB treatment',
                        'Other'
                      ],
                      [
                        { name : 'Done', slot: 'start', role: 'action'}
                      ]
                    )
                    this.reasonForDecliningTPTObs = this.consultation.buildValueText(
                      'Other reason for not seeking services', modal.selection
                    )
                } else {
                  this.reasonForDecliningTPTObs = {}
                  return false
                }
            }
            return true
          },
          condition: (f: any) => !f.refer_to_clinician || `${f.refer_to_clinician.value}`.match(/no/i),
          validation: (data: Option) => Validation.required(data),
          computedValue: (v: Option[]) => ({
            tag: 'consultation', 
            obs: this.buildMedicationOrders(v)
          }),
          onValueUpdate: (listData: Array<Option>, value: Option) => {
            const list =  this.disablePrescriptions(listData, value)
            return this.on3HPValueUpdate(list, value)
          },
          options: (formData: any, c: Array<Option>, cd: any, currentOptions: any) => {
            return this.medicationOrderOptions(formData, currentOptions)
          },
          config: {
            footerBtns: [
              {
                name: "Update allergic to CPT",
                onClickComponentEvents: {
                  refreshOptions: (btnEvent: FooterBtnEvent, options: Option[], formData: any): Option[] => {
                    this.allergicToSulphur = btnEvent.btnOutput === 'Allergic'
                    return this.medicationOrderOptions(formData, options)
                  }
                },
                onClick: () => {
                  return infoActionSheet(
                    "Allergic to Cotrimoxazole update",
                    `Is the patient allergic to cotrimoxazole.`,
                    "",
                    [
                      { name: "Allergic", slot: "start", color: "success" },
                      { name: "NOT Allergic", slot: "end" },
                    ]
                  )
                }
              }
            ]
          }
        }
      ]
    }
  }
})
</script>