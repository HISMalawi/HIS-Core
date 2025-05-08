p<template>
    <!--SMALL SCREENBREAKPOINT-->
    <ion-page v-if="screenBreakPoint === 'sm'"> 
        <minimal-toolbar
            :title="patientName"
            :menuTitle="visitDatesTitle"
            :menuItems="visitDates"
            :appIcon="app.applicationIcon"
            @onClickMenuItem="onActiveVisitDate"
        />
        <ion-toolbar v-if="screenBreakPoint === 'sm'"> 
            <ion-segment :value="activeTab" class="ion-justify-content-center">
                <ion-segment-button value="1" @click="activeTab=1"> 
                    <ion-icon :icon="calendar"> </ion-icon>
                    <ion-label>Visits</ion-label>
                </ion-segment-button>
                <ion-segment-button value="2" @click="activeTab=2"> 
                    <ion-icon :icon="person"> </ion-icon>
                    <ion-label>Patient</ion-label>
                </ion-segment-button>
                <ion-segment-button value="3" @click="activeTab=3">
                    <ion-icon :icon="medical"> </ion-icon>
                    <ion-label>Program</ion-label>
                </ion-segment-button>
                <ion-segment-button value="4" @click="activeTab=4"> 
                    <ion-icon :icon="time"> </ion-icon>
                    <ion-label>Dates</ion-label>
                </ion-segment-button>
            </ion-segment>
        </ion-toolbar>
        <ion-toolbar v-if="nextTask.name && screenBreakPoint === 'sm'"> 
            <ion-button 
                :style="{width: '100%'}" 
                color="success"
                @click="goToNextTask">
                <ion-label><b>Next Task: {{ nextTask.name.toUpperCase() }}</b></ion-label>
                <ion-icon :icon="alertCircle"> </ion-icon>
            </ion-button>
        </ion-toolbar>
        <ion-content id="main-content">
            <!-- Mobile dashboard view -->
            <div v-if="screenBreakPoint==='sm'">
                <component
                    v-if="appHasCustomContent && activeTab === 1 && patientIsset" 
                    v-bind:is="customDashboardContent"
                    :patient="patient"
                    :visitDate="activeVisitDate"
                    >  
                </component>
                <ion-grid v-if="!appHasCustomContent && activeTab === 1">
                    <ion-row>
                        <ion-col size="12"
                            v-for="(card, cardIndex) in patientCards"
                            :key="cardIndex"
                            >
                            <primary-card
                                :key="`mcard${cardIndex}`"
                                :isEnabled="card.isEnabled"
                                :counter="card.items.length"
                                :icon="card.icon"
                                :title="card.label"
                                :titleColor="card.color"
                                :items="card.items"
                                :isLoading="card.isLoading"
                                @click="card.onClick(card)"
                                > 
                            </primary-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
                <!-- Patient Information TAB --->
                <ion-list v-if="activeTab === 2">
                    <div class="his-card info-card-item"
                        v-for="(item, rIndex) in patientCardInfo" 
                        :key="rIndex"> 
                        <ion-item lines="none"> 
                            <ion-label> {{item.label}} </ion-label>
                            <ion-label slot="end"> <b>{{item.value}}</b> </ion-label>
                        </ion-item>
                    </div>
                </ion-list>
                <!-- Program Information TAB -->
                <ion-list v-if="activeTab === 3"> 
                    <div class="his-card info-card-item"
                        v-for="(item, rIndex) in programCardInfo" 
                        :key="rIndex">
                        <ion-item lines="none"> 
                            <ion-label> {{item.label}} </ion-label>
                            <ion-label slot="end"> <b>{{item.value}}</b> </ion-label>
                        </ion-item>
                        <p/>
                    </div>
                </ion-list>
                <!-- Dates TAB -->
                <ion-list v-if="activeTab === 4"> 
                    <div class="his-card info-card-item"> 
                        <ion-item lines="none"> 
                            <ion-label> Today </ion-label>
                            <ion-label slot="end"> <b>{{currentDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                    <div class="his-card info-card-item">     
                        <ion-item lines="none"> 
                            <ion-label> Session </ion-label>
                            <ion-label slot="end"> <b>{{sessionDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                    <div class="his-card info-card-item"> 
                        <ion-item lines="none"> 
                            <ion-label> Current visit date </ion-label>
                            <ion-label slot="end"> <b>{{activeVisitDate}}</b> </ion-label>
                        </ion-item>
                    </div>
                </ion-list>
            </div>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark" v-if="screenBreakPoint==='sm'"> 
                <ion-button color="primary" size="medium" slot="end" @click="showTasks"> 
                    <ion-icon :icon="clipboard"> </ion-icon>
                </ion-button>
                <ion-button color="primary" size="medium" slot="end" @click="showOptions">
                    <ion-icon :icon="folder"> </ion-icon>
                </ion-button>
                <ion-button color="primary" size="medium" slot="end" @click="changeApp"> 
                    <ion-icon :icon="apps"> </ion-icon>
                </ion-button>
                <ion-button color="success" size="medium" slot="end" @click="onCancel">
                    <ion-icon :icon="logOut"> </ion-icon>
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
    <!-- END SMALL SCREEN BREAKPOINT-->

    <!-- LARGE SCREEN BREAKPOINT -->
    <ion-page v-if="screenBreakPoint === 'lg'"> 
        <full-toolbar
            :app="app"
            :appVersion="appVersion"
            :appIcon="app.applicationIcon"
            :patientCardInfo="patientCardInfo"
            :programCardInfo="programCardInfo"
        />
        <ion-content id="main-content"> 
            <ion-grid class='grid-custom vertically-align'>
                <ion-row>
                    <ion-col size="2.4">
                        <visit-dates-card :title="visitDatesTitle" :items="visitDates" @onselect="onActiveVisitDate"> </visit-dates-card>
                    </ion-col>
                    <ion-col size="9.6">
                        <div class="his-sm-text his-card"> 
                        <ion-row> 
                           <ion-col size-md="4" size-sm="6"> 
                               Today's Date: <b>{{ currentDate }}</b>
                            </ion-col> 
                            <ion-col size-md="4" size-sm="6"> 
                                <span v-if="nextTask.name"> 
                                    <ion-chip class="next-task" color="success" @click="goToNextTask">Next Task: {{ nextTask.name.toUpperCase() }}</ion-chip>
                                </span>
                                <span v-else> 
                                    Next Task: <b>NONE</b>
                                </span>
                            </ion-col>
                            <ion-col size-md="4" size-sm="12">
                                <span v-if="isBDE"> 
                                    <ion-chip :style="{marginTop: '-8px'}" color="danger" @click="$router.push({name: 'Session Date'})"><b> BDE: {{ sessionDate.toUpperCase() }}</b> </ion-chip>
                                </span>
                                <span v-else> 
                                    Set Date: <b>{{ sessionDate }}</b>
                                </span>
                            </ion-col>
                        </ion-row>
                        <!--Custom Dashboard content-->
                        <component
                            v-if="appHasCustomContent && patientIsset" 
                            v-bind:is="customDashboardContent"
                            :patient="patient"
                            :visitDate="activeVisitDate"
                            >  
                        </component>
                        <!--Default patient dashboard content-->
                        <div v-if="!appHasCustomContent">
                            <ion-row> 
                                <ion-col 
                                    size="6"
                                    v-for="(card, cardIndex) in patientCards"
                                    :key="cardIndex">
                                    <primary-card
                                        :key="card.label"
                                        :isEnabled="card.isEnabled"
                                        :counter="card.items.length"
                                        :icon="card.icon"
                                        :title="card.label"
                                        :titleColor="card.color"
                                        :items="card.items"
                                        :isLoading="card.isLoading"
                                        @click="card.onClick(card)"
                                        > 
                                    </primary-card>
                                </ion-col>
                            </ion-row>
                        </div>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
        <ion-toolbar color="dark"> 
            <ion-button color="primary" size="large" slot="end" @click="showTasks"> 
                <ion-icon :icon="clipboardOutline"> </ion-icon>
                Tasks
            </ion-button>
            <ion-button color="primary" size="large" slot="end" @click="showOptions">
                <ion-icon :icon="folderOutline"> </ion-icon>
                Printouts/Other
            </ion-button>
            <ion-button color="primary" size="large" slot="end" @click="changeApp"> 
                <ion-icon :icon="appsOutline"> </ion-icon>
                Applications
            </ion-button>
            <ion-button @click="onCancel" color="success" size="large" slot="end">
                <ion-icon :icon="logOutOutline"> </ion-icon>
                Finish
            </ion-button>
        </ion-toolbar>
    </ion-page>
    <!--END LARGE SCREEN BREAKPOINT-->
</template>
<script lang="ts">
import HisApp from "@/apps/app_lib"
import { defineAsyncComponent, defineComponent, ref, watch } from 'vue'
import HisDate from "@/utils/Date"
import { Encounter } from "@/interfaces/encounter"
import { Option } from "@/components/Forms/FieldInterface"
import { Patientservice } from "@/services/patient_service"
import { ProgramService } from "@/services/program_service"
import { ObservationService } from "@/services/observation_service"
import { DrugOrderService } from "@/services/drug_order_service"
import { OrderService } from "@/services/order_service"
import TaskSelector from "@/components/DataViews/TaskSelectorModal.vue"
import EncounterView from "@/components/DataViews/DashboardEncounterModal.vue"
import CardDrilldown from "@/components/DataViews/DashboardTableModal.vue"
import { WorkflowService } from "@/services/workflow_service"
import { toastSuccess, toastDanger, toastWarning } from "@/utils/Alerts";
import { isArray, isEmpty } from "lodash"
import {
    man,
    time,
    person,
    calendar,
    medical,
    woman,
    clipboardOutline, 
    appsOutline, 
    folderOutline,
    logOutOutline, 
    clipboard, 
    apps, 
    folder,
    logOut,
    alertCircle,
    timeOutline, 
    warningOutline 
} from "ionicons/icons";
import {
  IonSegment,
  IonSegmentButton,
  IonPage,
  IonIcon,
  IonChip,
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonToolbar,
  modalController,
  loadingController
} from "@ionic/vue";
import { EncounterService } from '@/services/encounter_service'
import { ConceptService } from "@/services/concept_service"
import { PersonService } from "@/services/person_service"
import { TaskInterface } from "@/apps/interfaces/TaskInterface"
import { nextTask } from "@/utils/WorkflowTaskHelper"
import App from "@/apps/app_lib"
import PrimaryCard from "@/components/DataViews/DashboardPrimaryCard.vue"
import VisitDatesCard from "@/components/DataViews/VisitDatesCard.vue"
import Display from "@/composables/display"
import FullToolbar from "@/components/PatientDashboard/Poc/FullToolbar.vue"
import Store from "@/composables/ApiStore"
import { GeneralDataInterface } from "@/apps/interfaces/AppInterface"
import { PatientProgramService } from "@/services/patient_program_service"

export default defineComponent({
    components: {
        IonSegment,
        IonSegmentButton,
        IonChip,
        IonPage,
        IonIcon,
        IonFooter,
        IonContent,
        IonButton,
        IonToolbar,
        IonGrid,
        IonRow,
        IonCol,
        FullToolbar,
        PrimaryCard,
        VisitDatesCard,
        MinimalToolbar: defineAsyncComponent(() => import("@/components/PatientDashboard/Poc/MinimalToolbar.vue"))
    },
    setup() {
        const screenBreakPoint = ref('lg' as 'lg' | 'sm')
        const { resolution } = Display()
        watch(() => resolution.value, (dimensions) => {
            if (dimensions && dimensions.width <= 900) {
                screenBreakPoint.value = 'sm'
            } else {
                screenBreakPoint.value = 'lg'
            }
        }, { immediate: true, deep: true })
        return {
            time,
            person,
            calendar,
            medical,
            clipboard, 
            apps, 
            folder,
            logOut, 
            clipboardOutline, 
            appsOutline, 
            folderOutline,
            logOutOutline,
            alertCircle,
            screenBreakPoint
        }
    },
    data: () => ({
        activeTab: 1 as number,
        app: {} as any,
        dashboardComponent: {} as any,
        isBDE: false as boolean,
        currentDate: '',
        sessionDate: '',
        nextTask: {} as any,
        programId: 0 as any,
        patientId: 0,
        patient: {} as any,
        patientProgram: {} as any,
        patientCardInfo: [] as Array<Option>,
        programCardInfo: [] as GeneralDataInterface[] | [],
        visitDates: [] as Array<Option>,
        activeVisitDate: '' as string | number,
        patientCards: [] as Array<any>,
        appVersion: ProgramService.getFullVersion(),
        sessionEncounterMap: {} as Record<string, any>,
        savedEncounters: [] as string[]
    }),
    computed: {
        patientIsset(): boolean {
            return !isEmpty(this.patient)
        },
        patientName(): string {
            return !isEmpty(this.patient) 
                ? this.patient.getFullName()
                : 'N/A'
        },
        appHasCustomContent(): boolean {
            return !isEmpty(this.app.customPatientDashboardContentComponent)
                ? true
                : false
        },
        customDashboardContent(): any {
            return this.app.customPatientDashboardContentComponent
        },
        visitDatesTitle(): string {
            return `${this.visitDates.length} Visits`
        }
    },
    watch: {
        activeVisitDate(date: string) {
            if (!(this.appHasCustomContent)) this.updateCardVisitData(date)
        }
    },
    created() {
        this.app = App.getActiveApp()
        this.patientCards = [
            {
                items: [],
                cache: {},
                label: 'Activities',
                color: 'primary',
                isLoading: false,
                icon: timeOutline,
                isEnabled: this.isCardEnabled('activitiesEnabled'),
                onVisitDate: (card: any, date: string) => {
                    card.isLoading = true
                    EncounterService.getEncounters(this.patientId, {date})
                        .then((encounters) => {
                            card.items = this.getActivitiesCardInfo(encounters)
                            card.cache[date] = card.items
                            card.isLoading = false
                            this.sessionEncounterMap = {}
                            // Preserve today's encounters (BY SESSION DATE) in a hash object
                            if (date === ProgramService.getSessionDate() && !isEmpty(encounters)) {
                                this.sessionEncounterMap = encounters.reduce((accum: any, encounter: Encounter) => {
                                    accum[encounter.type.name.toLowerCase()] = encounter.observations
                                        .reduce((concepts: any, obs: any) => concepts.concat(obs.concept.concept_names), [])
                                        .map((concept: any) => concept.name.toLowerCase())
                                    return accum
                                }, {})
                            }
                        }).catch(() => {
                            card.items = []
                            card.cache[date] = card.items
                            card.isLoading = false
                        })
                },
                onClick: (card: any) => {
                    if (!card.isEnabled) 
                        return
                    if (!card.isLoading) {
                        this.openModal(
                            card.items, 'Select Activities', EncounterView
                        )
                    } else {
                        toastWarning('Please wait...')
                    }
                } 
            },
            {
                items: [],
                cache: {},
                color: 'success',
                isLoading: false,
                label: 'Lab Orders',
                icon: timeOutline,
                isEnabled: this.isCardEnabled('labEnabled'),
                onVisitDate: (card: any, date: string, invalidateCache: boolean, voidedEncounter: string) => {
                    if (invalidateCache && voidedEncounter === 'LAB ORDERS') {
                        Store.invalidate('PATIENT_LAB_ORDERS')
                    }
                    card.isLoading = true
                    this.getLabOrderCardInfo(date)
                        .then((data) => {
                            card.items = data
                            card.cache[date] = card.items
                            card.isLoading = false
                        }).catch(() => {
                            card.items = []
                            card.cache[date] = card.items
                            card.isLoading = false
                        })
                },
                onClick: (card: any) => card.isEnabled && this.$router.push(
                    this.app?.getPatientDashboardLabCardRoute
                        ? `${this.app.getPatientDashboardLabCardRoute}/${this.patient.getID()}?date=${this.activeVisitDate}`
                        : `/art/encounters/lab/${this.patient.getID()}`
                )
            },
            {
                items: [],
                label: 'Alerts and Clinic Notes',
                color: 'danger',
                icon: warningOutline,
                isLoading: false,
                isInit: false,
                isEnabled: this.isCardEnabled('alertsEnabled'),
                onVisitDate: (card: any) => {
                    if (card.isInit) return
                    const d  = this.getPatientAlertCardInfo()
                    if(typeof d === 'object' && typeof d.then === 'function') {
                        card.isLoading = true
                        this.getPatientAlertCardInfo()
                        .then((data) => {
                                if (data) card.items = data
                                card.isInit = true
                                card.isLoading = false
                            }).catch(() => {
                                card.items = []
                                card.isInit = true
                                card.isLoading = false
                            }) 
                    }
                    if (d) card.items = d
                },
                onClick: () => { /* TODO, list all alerts */ }
            },
            {
                items: [],
                cache: {},
                label: 'Medications',
                color: 'warning',
                icon: timeOutline,
                isLoading: false,
                isEnabled: this.isCardEnabled('medicationsEnabled'),
                onVisitDate: (card: any, date: string) => {
                    card.isLoading = true
                    DrugOrderService.getOrderByPatient(this.patientId, {'start_date': date})
                        .then((medications) => {
                            card.items = this.getMedicationCardInfo(medications)
                            card.cache[date] = card.items
                            card.isLoading = false
                        }).catch(() => {
                            card.data
                            card.items = []
                            card.cache[date] = card.items
                            card.isLoading = false
                        })
                },
                onClick: (card: any) => {
                    if (!card.isEnabled) 
                        return
                    if (card.isLoading) return toastWarning('Please wait..')
                    const columns = ['Medication', 'Start date', 'End date', 'Amount given']
                    const rows = card.items.map((medication: any) => ([
                        `${medication.other.drug.name}${medication.other.regimen ? ` (${medication.other.regimen})` : ''}`.trim(), 
                        this.toDate(medication.other.order.start_date),
                        this.toDate(medication.other.order.auto_expire_date),
                        medication.other.quantity
                    ]))
                    this.openTableModal(columns, rows, 'Medication History')
                }
            }
        ]
    },
    mounted() {
        this.patientId = parseInt(`${this.$route.params.id}`)
        if (this.patientId) {
            App.doAppManagementTasks().then(() =>{
                this.app = App.getActiveApp()
                this.programId = this.app.programID
                if (this.appHasCustomContent) {
                    this.patientCards = []
                }
                this.initData()
            })
        }
    },
    methods: {
        initData() {
            this.programCardInfo = typeof this.app?.patientProgramInfoData === 'function' 
                ? this.app?.patientProgramInfoData(this.patientId) 
                : []
            this.currentDate = HisDate.currentDisplayDate()
            this.sessionDate = this.toDate(ProgramService.getSessionDate())
            this.isBDE = ProgramService.isBDE() || false
            Store.get('ACTIVE_PATIENT', { patientID: this.patientId })
                .then(async (patient) => {
                    this.patient = patient
                    this.patientCardInfo = this.getPatientCardInfo(patient)
                this.getNextTask().then((task) => this.nextTask = task)
                this.getPatientVisitDates(this.patientId)
                    .then((dates) => {
                        this.visitDates = dates
                        this.loadSavedEncounters()
                    }).catch((e) => {
                        console.error(e)
                    })
                for(const p of this.programCardInfo) {
                    if (typeof p.init === 'function') {
                        await p.init()
                    }
                    if (typeof p.asyncValue === 'function') {
                        p.asyncValue().then(value => p.value = value)
                    } else if (typeof p.staticValue === 'function') {
                        p.value = p.staticValue()
                    }
                }
            }).catch((e) => toastDanger(`${e}`))
        },
        isCardEnabled(setting: 'activitiesEnabled' | 'alertsEnabled' | 'medicationsEnabled' | 'labEnabled') {
            const conf = this.app?.configDefaultPatientDashboardCards 
            return conf && setting in conf  ? conf[setting] || false : true 
        },
        async showLoader() {
            (await loadingController.create({
                message: 'Please wait....',
                backdropDismiss: false
            })).present()
        },
        clearLoader() {
            loadingController.getTop().then(v => v ? loadingController.dismiss() : null)
        },
        toDate(date: string | Date) {
            return HisDate.toStandardHisDisplayFormat(date)
        },
        toTime(date: string | Date) {
            return HisDate.toStandardHisTimeFormat(date)
        },
        loadSavedEncounters() {
            EncounterService.getSavedEncounters(this.patientId)
                .then((encounters) => {
                    this.savedEncounters = encounters
                })
        },
        updateCardVisitData(visitDate: string, invalidateCache=false, voidedEncounter='') {
            this.patientCards.forEach((card) => {
                if (card.isEnabled && typeof card.onVisitDate === 'function') {
                    if (typeof card.cache === 'object' && card.cache[visitDate] && !invalidateCache) {
                        card.items = card.cache[visitDate]
                        return
                    }
                    card.onVisitDate(card, visitDate, invalidateCache, voidedEncounter)
                }
            })
        },
        async getPatientVisitDates(patientId: number) {
            return (await Patientservice.getPatientVisits(patientId, false))
                .map((date: string) => ({
                    label: this.toDate(date), 
                    value: date,
                    other: {
                        isActive: date === ProgramService.getSessionDate()
                    }
                }))
        },
        getNextTask() {
            return WorkflowService.getNextTaskParams(this.patientId)
        },
        goToNextTask() {
            nextTask(this.patientId, this.$router)
        },
        onActiveVisitDate(data: Option) {
            this.activeVisitDate = data.value
        },
        getPatientCardInfo(patient: any) {
            const birthDate = patient.getBirthdate()
            const genderIcon = patient.getGender() === 'M' ? man : woman
            return [
                { label: "Name", value: patient.getFullName(), other: { icon: genderIcon}},
                { label: "Birthdate", value: `
                    ${this.toDate(birthDate)}
                    (${patient.getAge()}) 
                    (${patient.getNationalID()})`
                },
                { label: "Current Village", value: patient.getCurrentVillage() },
                { label: "Phone#", value: patient.getPhoneNumber()}
            ]
        },
        getActivitiesCardInfo(encounters: Array<Encounter>) {
           return encounters.map((encounter: Encounter) => {
                return {
                label: encounter.type.name,
                value: this.toTime(encounter.encounter_datetime),
                other: {
                    provider: PersonService.getPersonFullName(encounter.provider_id),
                    isBDE: EncounterService.isEncounterInBDE(encounter),
                    id: encounter.encounter_id,
                    columns: ['Observation', 'Value', 'Time'],
                    onVoid: async (reason: any) => {
                        await this.showLoader()
                        EncounterService.voidEncounter(encounter.encounter_id, reason)
                            .then(() => {
                                this.clearLoader()
                                this.loadSavedEncounters()
                                this.updateCardVisitData(this.activeVisitDate as string, true, encounter.type.name)
                                this.getNextTask().then((task) => this.nextTask = task)
                                toastSuccess('Encounter has been voided!', 2000)
                            }).catch((e) => {
                                this.clearLoader()
                                toastDanger(`${e}`, 32000)
                            })
                    },
                    getRows: async () => {
                        const data = []
                        const { observations } = encounter
                        for(const index in observations) {
                            let concept = '<UNKNOWN CONCEPT>'
                            const obs =  observations[index]
                            try {
                                if (obs?.concept?.concept_names) {
                                    const drugName = obs?.drug?.drug_cms?.short_name ?? obs?.drug?.name ?? '';
                                    const drugNameFormatted = drugName ? `(${drugName})` : "";
                                    concept = `${obs.concept.concept_names[0].name} ${drugNameFormatted}`.trim();
                                } else {
                                    concept = await ConceptService.getConceptName(obs.concept_id)
                                }
                            } catch (e) {
                                console.error(obs, e)
                            }
                            const value = await ObservationService.resolvePrimaryValue(obs)
                            const time = HisDate.toStandardHisTimeFormat(obs.date_created)
                            data.push([concept, value, time])
                        }
                        return data
                    }
                }
                }
            })
        },
        getMedicationCardInfo(medications: any) {
            return medications.map((medication: any) => ({
                label:  `${medication.drug.name}${medication.regimen ? ` (${medication.regimen})` : ''}`,
                value: this.toTime(medication.order.start_date),
                other: medication
            }))
        },
        async getLabOrderCardInfo(date: string) {
            if (typeof this.app.getPatientDashboardLabOrderCardItems === 'function') {
                return this.app.getPatientDashboardLabOrderCardItems(this.patientId, date)
            }
            const labOrders = await OrderService.getOrders(this.patientId, {date})
            return labOrders.map((order: any) => ({
                label: order.specimen.name,
                value: this.toTime(order.order_date)
            }))
        },
        async getPatientAlertCardInfo(){
            if ('getPatientDashboardAlertsAndNotes' in this.app) {
                return this.app.getPatientDashboardAlertsAndNotes(this.patient)
            }
        },
        async changeApp() {
            const app = await HisApp.selectApplication('PatientDashboard', true);
            if (!app) return
            if (app.programID != this.programId) {
                this.programId = app.programID
                this.$router.push(`/patients/confirm?patient_barcode=${this.patient.getNationalID()}`)
            } else {
                this.initData()
            }
        },
        /** 
         * Loads all patient program tasks. Perfoms additional checks
         * to ensure that tasks completed on current session date are marked
        */
        async showTasks() {
            if ('primaryPatientActivites' in this.app) {
                const tasks = [...this.app.primaryPatientActivites].map(
                    (task: TaskInterface) => {
                        const taskName = (task.encounterTypeName || task.name).toLowerCase()
                        // check if key concept names from a task are present in encounters
                        // to mark it as completed
                        if (typeof task.taskCompletionChecklist === 'object' && !isEmpty(this.sessionEncounterMap)) {
                            task.taskCompleted = task.taskCompletionChecklist
                                .every(item => isArray(this.sessionEncounterMap[taskName])
                                    && this.sessionEncounterMap[taskName].includes(item.toLowerCase())
                            )
                        } else {
                            // for tasks that dont have key concepts defined, just check presence of 
                            // the encounter itself
                            task.taskCompleted = !isEmpty(this.sessionEncounterMap[taskName])
                        }
                        return task
                    })
                this.openModal(tasks, 'Tasks for', TaskSelector, this.sessionDate)
            }
        },
        showOptions() {
            if ('secondaryPatientActivites' in this.app) {
                const other = this.app.secondaryPatientActivites
                this.openModal(other, 'Select Activity', TaskSelector)
            }
        },
        async startModal(component: any, props: any) {
            (await modalController.create({
                component: component,
                backdropDismiss: false,
                cssClass: "large-modal",
                componentProps: props
            })).present()
        },
        async openModal(items: any, title: string, component: any, date='') {
            if (isEmpty(this.patientProgram)) {
                this.patientProgram = await (new PatientProgramService(this.patientId)).getProgram()
            }
            this.startModal(component, {
                items,
                title: `${title}: ${date || this.toDate(this.activeVisitDate.toString())}`,
                taskParams: { 
                    patient: this.patient.getObj(),
                    program: this.patientProgram,
                    visitDate: this.activeVisitDate,
                    patientID: this.patientId,
                    savedEncounters: this.savedEncounters
                }
            })
        },
        openTableModal(columns: any, rows: any, title: string) {
            this.startModal(CardDrilldown, {
                columns,
                rows,
                title: `${title}: ${this.toDate(this.activeVisitDate.toString())}`
            })
        },
        onCancel() {            
            Store.invalidate('ACTIVE_PATIENT')
            Store.invalidate('PATIENT_PROGRAM')
            Store.invalidate('PATIENT_LAB_ORDERS')
            this.$router.push({path: '/'})
        }
    }
})
</script>
<style scoped>
    ion-icon {
        padding: 0.2em;
    }
    .info-card-item {
        height: 100%!important;
        margin: 1.2em;
    }
    .next-task {
        margin-top: -8px;
        font-weight: 600;
        font-size: 0.74em;
    }

    .grid-custom {
        overflow-y: auto;
        font-size: 0.9em;
    }

    .his-card {
        height: 75vh;
        padding: 1.0%;
    }
    @media (min-width: 1278px) {
        .next-task {
            font-size: 1.0em;
        }
        .grid-custom {
            padding: 0.4%;
            height: 99%;
        }
    }
    @media only screen and (width: 1024px) {
        .grid-custom {
            height: 99%;
            overflow: hidden;
        }   
    }
</style>
