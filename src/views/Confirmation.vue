<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-row> 
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <span class="his-sm-text">Patient Name: <b> {{demographics.patientName}}</b></span> <p/>
              <span class="his-sm-text">Birthdate: <b> {{birthdate}} </b></span> <p/>
              <span class="his-sm-text">Gender:  <b>{{demographics.gender}}</b></span>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <span class="his-sm-text">Ancestry district: <b>{{ demographics.ancestryDistrict }}</b></span><p/>
              <span class="his-sm-text">Ancestry TA: <b>{{ demographics.ancestryTA }}</b></span><p/>
              <span class="his-sm-text">Ancestry village: <b>{{ demographics.ancestryVillage }}</b></span><p/>
            </div>
          </ion-col>
          <ion-col> 
            <div class="tool-bar-medium-card"> 
              <span class="his-sm-text">Current District:<b> {{ demographics.currentDistrict }}</b><p/></span>
              <span class="his-sm-text">Current TA: <b> {{ demographics.currentTA }}</b><p/></span>
              <span class="his-sm-text">Current Village: <b> {{ demographics.currentVillage }}</b><p/></span>
            </div>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-row>
        <ion-col size-md="4" size-sm="12" v-for="(card, index) in cards" :key="index">
          <confirmation-card
            :key="`card-${index}`"
            :title="card.label"
            :items="card.values"
            :isLoading="card.isLoading"
          />
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-footer>
      <ion-toolbar color="dark">
        <ion-button
          color="danger"
          size="large"
          router-link="/"
          >
          Cancel
        </ion-button>
        <ion-button
          :disabled="!canVoidClient"
          color="danger left"
          size="large"
          @click="onVoid"
          >Void Client</ion-button
        >
        <ion-button
          v-if="facts.anc.canInitiateNewPregnancy"
          slot="end"
          size="large"
          @click="onInitiateNewAncPregnancy">
          New Pregnancy
        </ion-button>
        <ion-button
          :disabled="!facts.patientFound || facts.patientFound && !isReady"
          slot="end"
          color="success"
          size="large"
          @click="nextTask">
          <ion-spinner v-if="!isReady" name="crescent"/>
          Continue
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { isEmpty } from "lodash";
import HisDate from "@/utils/Date"
import HisApp from "@/apps/app_lib"
import { defineAsyncComponent, defineComponent } from "vue";
import { nextTask } from "@/utils/WorkflowTaskHelper"
import { UserService } from "@/services/user_service";
import { matchToGuidelines } from "@/utils/GuidelineEngine"
import { Patientservice } from "@/services/patient_service";
import { PatientProgramService } from "@/services/patient_program_service"
import { alertConfirmation, toastDanger, toastSuccess, toastWarning } from "@/utils/Alerts"
import { Patient } from "@/interfaces/patient"
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonPage,
  IonToolbar,
  IonRow,
  IonCol,
  IonSpinner,
  IonButton,
  modalController
} from "@ionic/vue";
import {
  FlowState, 
  TargetEvent,
  CONFIRMATION_PAGE_GUIDELINES
} from "@/guidelines/confirmation_page_guidelines"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"
import { IncompleteEntityError, BadRequestError } from "@/services/service"
import { OrderService } from "@/services/order_service";
import { PatientTypeService } from "@/apps/ART/services/patient_type_service";
import { ObservationService } from "@/services/observation_service";
import { delayPromise } from "@/utils/Timers";
import { AncPregnancyStatusService } from "@/apps/ANC/Services/anc_pregnancy_status_service"
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
import { isUnknownOrEmpty, isValueEmpty } from "@/utils/Strs";
import Store from "@/composables/ApiStore"
import { Order } from "@/interfaces/order";
import { Result } from "@/interfaces/result";
import TbService from "@/apps/TB/services/tb_service";
import { AppEncounterService } from "@/services/app_encounter_service";
import { EncounterType } from "@/apps/TB/meta/constants"
import { printNpidLbl } from "./Labels";
import { infoActionSheet } from "@/utils/ActionSheets";

export default defineComponent({
  name: "Patient Confirmation",
  components: {
    IonContent,
    IonHeader,
    IonFooter,
    IonPage,
    IonToolbar,
    IonSpinner,
    IonRow,
    IonCol,
    IonButton,
    ConfirmationCard: defineAsyncComponent(()=>import("@/components/Cards/PatientConfirmationCards.vue")),
  },
  data: () => ({
    app: {} as any,
    program: {} as any,
    patient: {} as any,
    localPatient: {} as any, // Patient found without dde
    ddeInstance: {} as any,
    useDDE: false as boolean,
    programInfo: {} as any,
    isReady: false as boolean,
    cards: [] as any[],
    facts: {
      isMalawiNationalIDFeaturesEnabled: false as boolean,
      hasMalawiNationalID: false as boolean,
      hasHighViralLoad: false as boolean,
      patientFound: false as boolean,
      npidHasDuplicates: false as boolean,
      npidHasOverFiveDuplicates: false as boolean,
      userRoles: [] as string[],
      scannedNpid: '' as string,
      currentNpid: '' as string,
      hasInvalidNpid: false as boolean,
      enrolledInProgram: false as boolean,
      programName: 'N/A' as string,
      currentOutcome: '' as string,
      programs: [] as string[],
      identifiers: [] as string[],
      patientType: 'N/A' as string,
      patientTypeLastUpdated: '' as string,
      tb: {
        noHivPositiveRecordInTB: false,
        clientEnrolledInArtProgram: false,
        _artData: {} as any
      },
      anc: {
        lmpMonths: -1,
        canInitiateNewPregnancy: false,
        currentPregnancyIsOverdue: false
      },
      dde: {
        localNpidDiff: '',
        remoteNpidDiff: '',
        voidedNpids: {
         cols: [] as string[],
         rows: [] as any
        },
        hasDemographicConflict: false,
        localDiffs: {},
        diffRows: [],
        diffRowColors: [] as Array<{indexes: number[]; class: string}>
      } as any,
      demographics: {
        patientIsComplete: false as boolean,
        hasInvalidDemographics: false as boolean,
        invalidDemographics: [] as string[],
        givenName: '' as string,
        familyName: '' as string,
        patientName: '' as string,
        landmark: '' as string,
        phoneNumber: '' as string,
        currentDistrict: '' as string,
        currentTA: '' as string,
        currentVillage: '' as string,
        ancestryDistrict: '' as string,
        ancestryTA: '' as string,
        ancestryVillage: '' as string,
        gender: '' as string,
        birthdate: '' as string,
      } as any,
      globalProperties: {
        useFilingNumbers: false,
        ddeEnabled: false
      } as any
    }
  }),
  created() {
    this.initCards()
    this.app = HisApp.getActiveApp() || {}
  },
  mounted() {
    if (this.app) {
      this.updateCards()
      this.ddeInstance = new PatientDemographicsExchangeService()
      this.setGlobalPropertyFacts().then(() => {
        const query = this.$route.query
        if (!isEmpty(query) && (query.person_id || query.patient_barcode)) {
          this.findAndSetPatient(query.person_id as any, query.patient_barcode as any)
        }
      })
    }
  },
  computed: {
    demographics(): any {
      return this.facts.demographics
    },
    birthdate(): string {
      return HisDate.toStandardHisDisplayFormat(
        this.facts.demographics.birthdate
      )
    },
    canVoidClient() {
      return this.facts.patientFound && UserService.isDataManager()
    }
  },
  methods: {
    initCards() {
      for(let i=0; i < 6; i++) {
        this.cards[i] = {
          label: '-',
          isLoading: true,
          values: []
        }
      }
    },
    async updateCards() {
      if (typeof this.app.confirmationSummary === 'function') {
        const cardItems: any = this.app.confirmationSummary(
          this.patient, this.program, this.facts
        )
        const keys: any = Object.keys(cardItems)
        for(let i = 0; i < this.cards.length; i++) {
          const cardData = keys[i] ? cardItems[keys[i]]() : []
          this.cards[i] = {
            label: keys[i] || '-',
            isLoading: false,
            values: cardData
          }
          if (typeof cardData === 'object' && cardData.then) {
            this.cards[i].isLoading = true
            if (!isEmpty(this.patient)) {
              cardData.then((data: any) => {
                this.cards[i].isLoading = false
                this.cards[i].values = data
              }).catch((e: any) => {
                this.cards[i].isLoading = false
                console.error(`${e}`)
              })
            }
          } else {
            // Render static label value pairs
            for (let c=0; c < cardData.length; ++c) {
              const val = cardData[c]
              this.cards[i].values[c] = val
              if (!isEmpty(this.patient)) {
                if (typeof val.init === 'function') {
                  await val.init()
                }
                if (typeof val.asyncValue === 'function') {
                  val.asyncValue().then((val: any) => {
                    this.cards[i].values[c].value = val
                  }).catch((e: any) => {
                    this.cards[i].values[c].value = '_ERROR_'  
                    console.error(`${e}`)
                  })
                } else if (typeof val.staticValue === 'function') {
                  this.cards[i].values[c].value = val.staticValue()
                }
              }
            }
          }
        }
      }
    },
    async setViralLoadStatus() {
      try {
        const orders = await OrderService.getOrders(this.patient.getID())      
        const latestVLResult = orders.reduce((result: Result, order: Order) => {
          const _results = OrderService.getVLResults(order)
          return isEmpty(_results) || _results[0].date < result.date
            ? result 
            : _results[0] 
        }, {} as Result);
  
        this.facts.hasHighViralLoad = OrderService.isHighViralLoadResult(latestVLResult)     
      } catch (e) {
        console.error(e)
      }
    },
    /**
     * Resolve patient by either patient ID or NpID.
     * Note: 
     *  - DDE Service only supports NPID search.
    */
    async findAndSetPatient(id: number | undefined, npid: string | undefined) {
      let req = null
      this.isReady = false
      this.localPatient = {} // Patient found without using DDE
      if (!this.facts.scannedNpid) {
        this.facts.scannedNpid = npid || ''
      }
      if (this.useDDE && npid) {
        req = this.ddeInstance.searchNpid(npid)
      } else if (id) {
        req = Patientservice.findByID(id)
      } else {
        req = Patientservice.findByNpid(npid as string)
      }
      this.handleSearchResults(req)
        .then(() => this.isReady = true)
        .catch((e) => toastDanger(`${e}`, 300000))
    },
    /**
     * Handle search result promises and handle entity related errors.
     * This is also an entrypoint to initialise Ui Data and facts
     */
    async handleSearchResults(patient: Promise<Patient | Patient[]>) {
      let results: Patient[] | Patient = []
      try {
        results = await patient as Patient[] | Patient
      } catch (e) {
        // [DDE] A person might have missing attributes such as home_village, 
        // or home_ta.
        if (e instanceof IncompleteEntityError && !isEmpty(e.entity)) {
          results = e.entity
        } else if (e instanceof BadRequestError && Array.isArray(e.errors)) {
          const [msg, ...entities] = e.errors
          if (typeof msg === 'string' && msg === "Invalid parameter(s)") {
            this.setInvalidParametersFacts(entities)
          }
        } else {
          toastDanger(`${e}`, 300000)
        }
      }

      // Use local patient if available if DDE never found them
      if (isEmpty(results) && !isEmpty(this.localPatient)) results = this.localPatient
      
      if(Array.isArray(results) && results.length > 1){
        this.facts.npidHasDuplicates = results.length <= 5
        this.facts.npidHasOverFiveDuplicates = results.length > 5
      } else {
        this.facts.patientFound = !isEmpty(results)
      }

      if (this.facts.patientFound) {
        this.patient = new Patientservice(
          Array.isArray(results)
            ? results[0]
            : results
          )
        this.updateCards()
        Store.set('ACTIVE_PATIENT', this.patient)
        this.setPatientFacts()
        const factPromises = []
        factPromises.push(this.setProgramFacts())
        if (this.useDDE) {
          factPromises.push(this.setDDEFacts())
        } 
        if (this.facts.programName === 'ANC') {
          factPromises.push(this.setAncFacts())
        }
        if (this.facts.programName === 'TB') {
          factPromises.push(this.setTbFacts())
        }
        if (this.facts.programName === 'ART') {
          factPromises.push(this.setViralLoadStatus())
        }
        this.facts.currentNpid = this.patient.getNationalID()
        factPromises.push(this.validateNpid())
        await Promise.all(factPromises)
      } else {
        // [DDE] a user might scan a deleted npid but might have a newer one.
        // The function below checks for newer version
        if (this.facts.scannedNpid) this.setVoidedNpidFacts(this.facts.scannedNpid)
      }
      this.onEvent(TargetEvent.ONLOAD)
        .then(() => this.isReady = true)
        .catch(e => { toastDanger(`${e}`, 300000); this.isReady = true })
    },
    async validateNpid () {
      if(this.useDDE){
        this.facts.hasInvalidNpid = !this.patient.getDocID() || (
          this.patient.getDocID() && isUnknownOrEmpty(this.patient.getNationalID())
        )
      } else {
        const results = await Patientservice.findByNpid(this.facts.currentNpid, {"page_size": 2})
        this.facts.hasInvalidNpid = Array.isArray(results) && results.length > 1
      }
    },
    /**
     * DDE sometimes sends 400 bad request which contains
     * a list of invalid demographic attributes 
     */
    setInvalidParametersFacts(errorExceptions: any) {
      this.facts.demographics.hasInvalidDemographics = true
      // Create a turple of attribute and error pairs
      this.facts.demographics.invalidDemographics =
        errorExceptions.map((e: any) => {
          const data = Object.entries(e)
          const entity = data[0][0]
          const errors = data[0][1] as string[]
          return [entity, errors.join(', ')]
        })      
    },
    /**
     * Reloads patient facts and information.
     * Note: Use this when you know the patient is loaded
     */
    reloadPatient() {
      return this.findAndSetPatient(this.patient.getID(), undefined)
    },
    /**
     * Facts are used by the Guideline Engine to crosscheck 
     * conditions to execute. The more the data the better
     * the decision support. These facts are also presented 
     * on the User interface
    */
    setPatientFacts() {
      this.facts.demographics.patientIsComplete = this.patient.patientIsComplete()
      this.facts.demographics.patientName = this.patient.getFullName()
      this.facts.demographics.givenName = this.patient.getGivenName()
      this.facts.demographics.familyName = this.patient.getFamilyName()
      this.facts.demographics.landmark = this.patient.getAttribute(19)
      this.facts.demographics.phoneNumber = this.patient.getAttribute(12)
      this.facts.demographics.gender = this.patient.getGender()
      this.facts.demographics.birthdate = this.patient.getBirthdate()
      this.facts.demographics.ancestryDistrict = this.patient.getHomeDistrict()
      this.facts.demographics.ancestryTA = this.patient.getHomeTA()
      this.facts.demographics.ancestryVillage = this.patient.getHomeVillage()
      this.facts.demographics.currentDistrict = this.patient.getCurrentDistrict()
      this.facts.demographics.currentTA = this.patient.getCurrentTA()
      this.facts.demographics.currentVillage = this.patient.getCurrentVillage()
      this.facts.identifiers = this.patient.getIdentifiers().map((id: any) => id.type.name)
      this.facts.hasMalawiNationalID = !/unknown/i.test(this.patient.getMWNationalID())
    },
    async setGlobalPropertyFacts() {
      this.facts.isMalawiNationalIDFeaturesEnabled = await Store.get('IS_MW_NATIONAL_ID_SCANNER_ENABLED');
      this.facts.globalProperties.ddeEnabled = await Store.get('IS_DDE_ENABLED')
      this.useDDE = this.facts.globalProperties.ddeEnabled
      if (this.app.applicationName === 'ART') {
        this.facts.globalProperties.useFilingNumbers = await Store.get('IS_ART_FILING_NUMBER_ENABLED')
      }
    },
    async setAncFacts() {
      const anc = new AncPregnancyStatusService(this.patient.getID(), -1)
      this.facts.anc.canInitiateNewPregnancy = await anc.canInitiateNewPregnancy()
      this.facts.anc.currentPregnancyIsOverdue = await anc.pregnancyIsOverdue()
      this.facts.anc.lmpMonths = await anc.getLmpInMonths()
    },
    async setTbFacts() {
      const art = await TbService.generateArtStatusFromArt(this.patient.getID(), TbService.getSessionDate())
      if (art) {
        this.facts.tb.noHivPositiveRecordInTB = !art.hivStatus._recordedStatusInTB
        this.facts.tb.clientEnrolledInArtProgram = true
        this.facts.tb._artData = art
      }
    },
    buildDDEDiffs(diffs: any) {
      const comparisons: Array<string[]> = []
      const refs: any = {
        givenName : { label: 'First Name', ref: 'given_name' },
        familyName: { label: 'Last Name', ref: 'family_name'},
        birthdate: { label: 'Birthdate', ref: 'birthdate'},
        gender: { label: 'Gender', ref: 'gender' },
        phoneNumber: {label: 'Phone number', ref: 'phone_number'},
        ancestryDistrict: { label: 'Home District', ref: 'home_district'},
        ancestryTA: { label: 'Home TA', ref: 'home_traditional_authority'},
        ancestryVillage: { label: 'Home Village', ref: 'home_village'},
        currentDistrict: { label: 'Current District', ref: 'current_district'},
        currentTA: { label: 'Current TA', ref: 'current_traditional_authority'},
        currentVillage: { label: 'Current Village', ref: 'current_village'}
      }
      let index = 0
      const diffIndexes: any = { indexes: [], class: 'his-empty-set-color'}

      for(const k in refs) {
        let local = this.facts.demographics[k]
        let remote = local

        if (refs[k].ref in diffs) {
          diffIndexes.indexes.push(index)
          local = diffs[refs[k].ref].local
          remote = diffs[refs[k].ref].remote
        }

        comparisons.push([
          refs[k].label,
          local,
          remote
        ])
        ++index
      }
      return {comparisons, rowColors: [diffIndexes]}
    },
    async setProgramFacts() {
      this.facts.programName = this.app.applicationName
      try {
        this.program = new PatientProgramService(this.patient.getID())
        this.programInfo = await this.program.getProgram()
        Store.set('PATIENT_PROGRAM', this.programInfo)
        const { program, outcome }: any =  this.programInfo
        this.facts.enrolledInProgram = !(isValueEmpty(program) || program.match(/n\/a/i))
        this.facts.currentOutcome = outcome
        this.facts.userRoles = UserService.getUserRoles().map((r: any) => r.role)
        const patientTypeObs = await ObservationService.getFirstObs(this.patient.getID(), 'Type of patient')
        if (patientTypeObs?.value_coded) {
          this.facts.patientType = patientTypeObs.value_coded
          this.facts.patientTypeLastUpdated = HisDate.toStandardHisFormat(patientTypeObs.obs_datetime)
        }
      } catch (e) {
        console.error(`${e}`)
      }
    },
    /**
     * Set dde facts if service is enabled.
     * Please Note that DDE has to be configured per Program in the backend.
     * If a program isnt configured for DDE, it crashes by default hence 
     * exception handling is required
     */
    async setDDEFacts() {
      try {
        const localAndRemoteDiffs = (await this.ddeInstance.getLocalAndRemoteDiffs())?.diff
        this.facts.dde.localDiffs = this.ddeInstance.formatDiffValuesByType(
          localAndRemoteDiffs, 'local'
        )
        const { comparisons, rowColors } = this.buildDDEDiffs(localAndRemoteDiffs)
        this.facts.dde.diffRows = comparisons
        this.facts.dde.diffRowColors = rowColors
        if (localAndRemoteDiffs.npid) {
          const {local, remote} = localAndRemoteDiffs.npid
          this.facts.dde.localNpidDiff = local
          this.facts.dde.remoteNpidDiff = remote
          delete localAndRemoteDiffs.npid
        }
        this.facts.dde.hasDemographicConflict = !isEmpty(localAndRemoteDiffs)
      } catch (e) {
        console.warn(e)
      }
    },
    async setVoidedNpidFacts(npid: string) {
      const cols = [
        'Name', 'Birthdate', 'Gender', 'Ancestry Home', 'CurrentID', 'Action'
      ]
      let rows = []
      const req = await this.ddeInstance.findVoidedIdentifier(npid)
      if (req) {
        rows = req.map((d: any) => {
          const p = new Patientservice(d)
          return [
            p.getFullName(),
            p.getBirthdate(),
            p.getGender(),
            p.getHomeTA(),
            p.getNationalID(),
            {
              type: 'button',
              name: 'Select',
              action: async () => {
                if (!p.patientIsComplete()) {
                  return this.$router.push(`/patient/registration?edit_person=${p.getID()}`)
                } else if (p.getNationalID().match(/unknown/i) || !p.getDocID()) {
                  try {
                    await p.assignNpid()
                    await this.findAndSetPatient(p.getID(), undefined)
                    return modalController.dismiss()
                  } catch (e) {
                    toastWarning('Failed to assign npid to patient with unknown npid.')
                    return console.error(e)
                  }
                }
                await modalController.dismiss()
                await this.findAndSetPatient(undefined, p.getNationalID())
              }
            }
          ]
        })
        this.facts.dde.voidedNpids.cols = cols
        this.facts.dde.voidedNpids.rows = rows
      }
    },
    /**
     * Executes CONFIRMATION_PAGE GUIDELINES with given TargetEvent
    */
    async onEvent(targetEvent: TargetEvent, callback={}) {
      const findings = matchToGuidelines(
        this.facts, CONFIRMATION_PAGE_GUIDELINES, '', targetEvent, 'weight'
      )
      for(const index in findings) {
        const finding = findings[index]
        if (finding?.actions?.alert) {
          const state = await finding?.actions?.alert(this.facts)
          if ((await this.runFlowState(state))
              === FlowState.FORCE_EXIT) {
              return false 
            }
        }
      }
      if (typeof callback === 'function') callback()
    },
    async onInitiateNewAncPregnancy() {
      if ((await alertConfirmation('Are you sure you want to initiate new pregnancy?'))) {
        if ((await this.initiateNewAncPregnancy())) {
          this.facts.anc.canInitiateNewPregnancy = false
          this.facts.anc.currentPregnancyIsOverdue = false
          this.nextTask()
        } else {
          toastWarning('Unable to initiate new pregnancy')
        }
      }
    },
    initiateNewAncPregnancy() {
      return new AncPregnancyStatusService(this.patient.getID(), -1).createNewPregnancyStatus()
    },
    /**
     * Maps FlowStates defined in the Guideline to
     * Functions definitions that are executed.
     */
    async runFlowState(state: FlowState) {
      const states: Record<string, () => any> = {}
      states[FlowState.SCAN_NATIONAL_ID] = async () => {
        if ((await alertConfirmation("Are you able to scan National ID Card / Birth certificates at your Station?"))) {
          await infoActionSheet(
            "Malawi National ID",
            "Use your 2D barcode scanner to scan the National ID Card / Birth certificate on the Home Page to proceed",
            "",
            [
              {
                name: "Go To Home Page",
                slot: "start",
                color: "primary"
              }
            ]
          )
          this.$router.push('/')
          return FlowState.FORCE_EXIT
        }
        await infoActionSheet(
          "Malawi National ID",
          "Please update Missing Malawi National ID Code",
          "",
          [
            {
              name: "Update Demographics Manually",
              slot: "start",
              color: "primary"
            }
          ]
        )
        this.$router.push(`/patient/registration?edit_person=${this.patient.getID()}`)
        return FlowState.FORCE_EXIT
      }
      states[FlowState.ALERT_TO_BRING_NATIONAL_ID_NEXT] = async() => {
        await infoActionSheet(
          "Malawi National ID",
          "",
          "Please remind the client to bring a National ID or Birth certificate on their next visit",
          [
            {
              name: "Understood",
              slot: "start",
              color: "success"
            }
          ]
        )
        return FlowState.CONTINUE
      }
      states[FlowState.GO_HOME] = () => {
          this.$router.push('/')
          return FlowState.FORCE_EXIT
      }
      states[FlowState.GO_BACK] = () => {
        this.$router.back()
        return FlowState.FORCE_EXIT
      }
      states[FlowState.ENROLL] = () => {
        return this.program.enrollProgram()
      }
      states[FlowState.ACTIVATE_FN] = () => {
        this.$router.push(`/art/filing_numbers/${this.patient.getID()}?assign=true`)
        return FlowState.FORCE_EXIT
      }
      states[FlowState.UPDATE_DMG] = () => {
        this.$router.push(`/patient/registration?edit_person=${this.patient.getID()}`)
        return FlowState.FORCE_EXIT
      }
      states[FlowState.PRINT_NPID] = async () => {
        await this.ddeInstance.printNpid(this.patient.getID())
        await delayPromise(1800)
        return FlowState.CONTINUE
      }
      states[FlowState.SYNCH_ART_STATUS_WITH_TB] = async () => {
        const service = new AppEncounterService(this.patient.getID(), EncounterType.UPDATE_HIV_STATUS, -1);
        await service.createEncounter();
        await service.saveObservationList(
          Object.keys(this.facts.tb._artData).reduce(
            (a: any, k: any) =>([...a, this.facts.tb._artData[k].obs]),
          [])
        )
      }
      states[FlowState.CREATE_NPID_WITH_REMOTE_DIFF] = async () => {
        const npid = this.facts.dde.remoteNpidDiff
        try {
          if (npid && (await this.ddeInstance.createNPID(npid))) {
            this.facts.scannedNpid = npid
            this.facts.currentNpid = npid
            this.facts.dde.localNpidDiff = npid
            toastSuccess('Remote NPID successfully updated')
            await delayPromise(300)
            await this.ddeInstance.printNpid()
            await this.findAndSetPatient(undefined, npid)
            return FlowState.FORCE_EXIT
          }
        } catch (e) {
          const alreadyAssigned = /Identifier already assigned to another patient/i
          if (e instanceof BadRequestError && e.errors.join(',').match(alreadyAssigned)) {
            const res = await this.ddeInstance.reassignNpid(this.patient.getDocID())
            if (res) {
              this.patient = new Patientservice(res)
              toastSuccess('Patient has been reassigned NPID')
              await delayPromise(300)
              await this.ddeInstance.printNpid()
              await this.findAndSetPatient(undefined, this.patient.getNationalID())
              return FlowState.FORCE_EXIT
            }
          }
          toastDanger(`Unable to assign NPID: ${e}`)
        }
      }
      states[FlowState.ASSIGN_NPID] = async () => {
        await this.patient.assignNpid()
        await printNpidLbl(this.patient.getID())
        await delayPromise(300)
        await this.reloadPatient()
        return FlowState.FORCE_EXIT
      },
      states[FlowState.INITIATE_ANC_PREGNANCY] = async () => {
        await this.initiateNewAncPregnancy()
        return FlowState.CONTINUE
      }
      states[FlowState.VIEW_MERGE_AUDIT_FOR_NPID] = () => {
        this.$router.push(`/merge/rollback/${this.facts.scannedNpid}`)
        return FlowState.FORCE_EXIT
      }
      states[FlowState.RESOLVE_DUPLICATE_NPIDS] = () => {
        this.$router.push(`/npid/duplicates/${this.facts.scannedNpid}`)
        return FlowState.FORCE_EXIT
      }
      states[FlowState.REFRESH_DDE_DEMOGRAPHICS] = async () => {
        await this.ddeInstance.refreshDemographics()
        await this.reloadPatient()
        return FlowState.FORCE_EXIT
      }
      states[FlowState.ADD_AS_DRUG_REFILL] = async () => {
        await this.createPatientType('Emergency supply')
        return FlowState.CONTINUE
      }
      states[FlowState.ADD_AS_NEW_PATIENT] = async () => {
        await this.createPatientType('New patient')
        return FlowState.CONTINUE
      }
      states[FlowState.ADD_AS_EXTERNAL_CONSULTATION] = async () => {
        await this.createPatientType('External consultation')
        return FlowState.CONTINUE
      }
      states[FlowState.SEARCH_BY_NAME] = () => {
        this.$router.push('/patient/registration')
        return FlowState.FORCE_EXIT
      }
      states[FlowState.UPDATE_LOCAL_DDE_DIFFS] = async () => {
        await this.ddeInstance.updateLocalDifferences(
          this.facts.dde.localDiffs
        )
        await this.reloadPatient()
        return FlowState.FORCE_EXIT
      }
      if (state in states) {
        try {
          return await states[state]()
        }catch(e) {
          toastDanger(`${e}`)
        }
      }
      return state
    },
    async createPatientType(newPatientType: 'Emergency supply' | 'External consultation' | 'New patient') {
      if (newPatientType != this.facts.patientType && this.facts.patientTypeLastUpdated === Patientservice.getSessionDate()) {
        if (!(await alertConfirmation(`This client was flagged today as "${this.facts.patientType}", altering patient type to "${newPatientType}" may affect record integrity, do you want to affect change?`))) {
          return
        }
      }
      const type = new PatientTypeService(this.patient.getID(), -1)
      await type.createEncounter()
      await type.savePatientType(newPatientType)
    },
    async onVoid() {
      popVoidReason(async (reason: string) => {
        try {
          await Patientservice.voidPatient(this.patient.getID(), reason)
          this.$router.push('/')
        } catch (e) {
          toastDanger(`${e}`)
        }
      }, 'void-modal')
    },
    nextTask() {
      this.onEvent(TargetEvent.ON_CONTINUE, () => {
        nextTask(this.patient.getID(), this.$router)
      })
    }
  }
})
</script>
<style scoped>
.tool-bar-medium-card {
  padding: 0.3em;
}
ion-col p {
  margin: 0;
}
</style>