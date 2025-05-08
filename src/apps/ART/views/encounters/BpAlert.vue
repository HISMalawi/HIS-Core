<template>
    <ion-page> 
        <ion-content>
            <h1 class="ion-text-center"> 
                HTN Alert 
            </h1>
            <div v-if="hasPressureReading" class="vertically-align ion-text-center">
                <h2 v-show="patientOnBpDrugs" style="font-weight:bold;">
                    (Patient already on BP drugs)
                </h2>
                <h2>
                    <span class="name"> {{ patientName }} </span> has <span v-show="highBP"> a high </span> blood pressure of 
                    <span class="bp"> 
                        {{sysBp}} / {{dsBP}}
                    </span>
                    <br/>
                    <span>
                        Retesting BP is <span style="font-weight: bold; color: #000000;text-decoration: underline;">optional</span>. <br>
                        Do you want to test BP?
                    </span>

                </h2>
            </div>
            <div v-if="!hasPressureReading" class="vertically-align ion-text-center">
                No BP Reading found
                <br/>
                <h1>
                    Do you want to test BP?
                </h1>
            </div>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button @click="() => hasPressureReading ? showRiskFactors() : nextTask()"
                    size="large"
                    color="danger"
                    slot="start">
                    No
                </ion-button>
                <ion-button @click="recaptureBp"
                    size="large"
                    color="success"
                    slot="end">
                    Yes
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
    
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import EncounterMixinVue from '../../../../views/EncounterMixin.vue'
import {
    IonFooter,
    IonContent,
    IonPage,
    IonButton,
    IonToolbar,
    loadingController,
    modalController
} from "@ionic/vue"
import ART_PROP from "@/apps/ART/art_global_props"
import { BPManagementService } from '../../services/htn_service'
import { ConceptService } from "@/services/concept_service";
import RiskFactorModal from "@/components/DataViews/RiskFactorModal.vue";
import { ObservationService } from "@/services/observation_service";
import { isEmpty } from "lodash";

export default defineComponent({
    mixins: [EncounterMixinVue],
    components: { 
        IonFooter,
        IonContent,
        IonPage,
        IonButton,
        IonToolbar
    },
    data: () => ({
        sysBp: 0 as number,
        dsBP: 0 as number,
        riskFactors: [] as any,
        patientOnBpDrugs: false as boolean,
        isPregnant: false as boolean,
        systolicThreshold: 145,
        diastolicTheshold: 94
    }),
    methods: {
        async showRiskFactors() {
            const modal = await modalController.create({
                component: RiskFactorModal,
                backdropDismiss: false,
                cssClass: "large-modal",
                componentProps: {
                    factors: this.riskFactors
                }
            })
            modal.present()
            const { data } = await modal.onDidDismiss();
            if (!isEmpty(data)) this.nextTask()
        },
        async getRiskFactors() {
            const concepts = ConceptService.getConceptsByCategory("risk factors");
            const j = concepts.map(async (concept) => {
            const val = await ObservationService.getFirstValueCoded(this.patientID, concept.name)
                return {
                    concept: concept.name, value: val
                }
            })
            return Promise.all(j);
        },
        recaptureBp() {
            this.$router.push(`/art/encounters/vitals/${this.patientID}?vital_options=BP`)
        }
    },
    watch: {
        ready: {
            async handler(r: boolean) {
                if (!r) return
                const loading = await loadingController.create({
                    message: 'Verifying Blood Pressure...',
                    backdropDismiss: false
                })
                await loading.present()
                const htn = new BPManagementService(this.patientID, this.providerID)
                this.riskFactors = await this.getRiskFactors();
                this.systolicThreshold = (await ART_PROP.systolicThreshold()) || 145
                this.diastolicTheshold = (await ART_PROP.diastolicThreshold()) || 94
                this.dsBP = (await htn.getDiastolicBp()) || 0
                this.sysBp = (await htn.getSystolicBp()) || 0
                this.patientOnBpDrugs = (await htn.onBpDrugs()) || false
                this.isPregnant = this.patient.isChildBearing()
                    ? (await this.patient.isPregnant()) || false
                    : false
                loadingController.dismiss()
            },
            immediate: true
        }
    },
    computed: {
        patientName(): string {
            return this.ready ? this.patient.getFullName() : 'Patient'
        },
        hasPressureReading(): boolean {
            return this.sysBp > 0 && this.dsBP > 0
        },
        highBP(): boolean {
            return (this.sysBp >= this.systolicThreshold
                && this.dsBP >= this.diastolicTheshold || this.dsBP >= this.diastolicTheshold)
                && !this.isPregnant
        }
    }
})
</script>

<style scoped>
    div {
        color: gray;
    }
    .bp{
        color: red;
        font-style: italic;
    }
    .name{
        color: blue;
        font-style: italic;
    }
    .green{
        width: 170px;
    }

</style>