<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="his-lg-text"> {{ title }} </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <ion-list> 
                <ion-item class="his-md-text"
                    v-for="(item, index) in items" :key="index"
                    >
                    <ion-checkbox
                        v-if="ddeEnabled"
                        slot="start"
                        v-model="item.isChecked"
                        >
                    </ion-checkbox>
                    <ion-label :color="!item.isComplete ? 'danger' : ''">
                        {{item.name}} ({{item.gender}}) {{item.birthdate}} <br/> 
                        Current District: <b>{{item.curDistrict || 'Unknown'}}</b> 
                        Home Village: <b>{{item.homeVillage || 'Unknown'}}</b> 
                    </ion-label>
                    <ion-button
                        size="medium"
                       @click="() => reassignIdentifier(item)"> 
                        Re-Assign 
                    </ion-button>
                    <ion-button
                        size="medium"
                        color="warning"
                        v-if="!item.isComplete"
                       :router-link="`/patient/registration?edit_person=${item.patientID}`"> 
                        Update Missing Data
                    </ion-button>
                </ion-item>
            </ion-list>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark"> 
                <ion-button 
                    router-link="/"
                    color="danger" 
                    slot="start" 
                    size="large">
                    Cancel
                </ion-button>
                <ion-button 
                    v-if="itemsChecked.length > 0"
                    @click="clear" 
                    color="warning" 
                    slot="end" 
                    size="large">
                    Clear
                </ion-button>
                <ion-button 
                    v-if="itemsChecked.length > 1"
                    @click="onAction(mergeSelected, 'merge')"
                    color="primary"
                    size="large"
                    slot="end"
                    >
                    Merge ({{itemsChecked.length}})
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonPage,
    IonButton,
    IonList,
    IonItem,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonContent,
    IonFooter,
    IonCheckbox,
} from "@ionic/vue"
import { PatientDemographicsExchangeService } from "@/services/patient_demographics_exchange_service"
import { Patientservice } from '@/services/patient_service'
import { alertConfirmation, toastDanger, toastWarning } from '@/utils/Alerts'
import { nextTask } from "@/utils/WorkflowTaskHelper"
import HisDate from "@/utils/Date"

export default defineComponent({
    components: {
        IonPage,
        IonCheckbox,
        IonButton,
        IonList,
        IonItem,
        IonToolbar, 
        IonHeader,
        IonTitle,
        IonContent,
        IonFooter
    },
    data: () => ({
        dde: {} as any,
        ddeEnabled: false as boolean,
        items: [] as any,
        title: '' as string,
        npid: '' as string,
    }),
    watch: {
        $route: {
            handler({params}: any) {
                if (params){
                    this.npid = params.npid
                    this.title = `Duplicates for NPID (${this.npid})`
                    this.init(this.npid)
                }
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        itemsChecked(): any {
            return this.items.filter((i: any) => i.isChecked)
        }
    },
    methods: {
        async onAction(action: () => any, context='proceed') {
            const ok = await alertConfirmation(`
                Are you sure you want to ${context}?
            `)
            if (ok) {
                try {
                    await action()
                } catch(e) {
                    toastWarning(`${e}`)
                    console.error(e)
                }
            }
        },
        async mergeSelected() {
            if (!this.itemsChecked.every((i: any) => i.isComplete)) {
                return toastWarning('One or more patients have missing data. Please update them before merging.', 5000) 
            }
            if ((await this.dde.postMerge(this.itemsChecked))) {
                await this.dde.printNpid(this.dde.patientID)
                nextTask(this.dde.patientID, this.$router)
            }
        },
        async reassignIdentifier(item: any) {
            /**
             * DDE requires that patients should have complete data. Redirect the user
             * immediately to update this information
             */
            if (!item.isComplete && this.ddeEnabled) {
                const ok = await alertConfirmation('Do you want to update missing information?', {
                    header: 'Incomplete Demographics'
                })
                if (ok) {
                    let params = `edit_person=${item.patientID}`
                    params += '&dde_reassign=true'
                    params += `&doc_id=${item.docID}`
                    this.$router.push(`/patient/registration?${params}`)
                }
            } else {
                this.onAction(async () => {
                    if (this.ddeEnabled) {
                        if ((await this.dde.reassignNpid(item.docID, item.patientID))) {
                            await this.dde.printNpid(item.patientID)
                        }
                    } else {
                        if (typeof item.assignLocalNpidAndPrint === 'function') {
                            await item.assignLocalNpidAndPrint()
                        }
                    }
                    nextTask(item.patientID, this.$router)
                }, 'Reassign')
            }
        },
        buildItems(items: any) {
            return items.map((i: any) => {
                try {
                    const p = new Patientservice(i)
                    return {
                        isChecked: false,
                        patientID: p.getID(),
                        name: p.getFullName(),
                        gender: p.getGender(),
                        birthdate: HisDate.toStandardHisDisplayFormat(p.getBirthdate()),
                        curDistrict: p.getCurrentDistrict(),
                        homeVillage: p.getHomeVillage(),
                        docID: p.getPatientIdentifier(27),
                        isComplete: p.patientIsComplete(),
                        assignLocalNpidAndPrint: async () => {
                            await p.assignNpid()
                            await p.printNationalID()
                        }
                    }
                } catch (e) {
                    toastDanger(`An error has occured while building data`)
                    console.error(e)
                }
                return {
                    isChecked: false,
                    patientID: 'N/A',
                    name: 'N/A',
                    gender: 'N/A',
                    birthdate: 'N/A',
                    curDistrict: 'N/A',
                    homeVillage: 'N/A',
                    docID: 'N/A',
                    isComplete: false
                }
            })
        },
        clear() {
            this.items = this.items.map((i: any) => {
                i.isChecked = false
                return i
            })
        },
        async init(npid: string) {
            try {
                /**
                 * Load DDE identifier data if service is enabled
                 */
                this.dde = new PatientDemographicsExchangeService()
                await this.dde.loadDDEStatus()
                this.ddeEnabled = this.dde.isEnabled()
                if (this.ddeEnabled) {
                    const {locals, remotes} = await this.dde.findNpid(npid)
                    this.items = [
                        ...this.buildItems(locals), 
                        ...this.buildItems(remotes)
                    ]
                } else {
                    /**
                     * Load Local patient identifier data without DDE Enabled
                     */
                    const duplicates = await Patientservice.findByNpid(npid)
                    if (duplicates) {
                        this.items = this.buildItems(duplicates)
                    }
                }
            } catch (e) {
                toastDanger(`${e}`, 5000)
            }
        }
    }
})
</script>
