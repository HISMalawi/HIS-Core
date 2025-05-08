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
import EncounterMixinVue from '@/views/EncounterMixin.vue'
import { defineComponent } from 'vue'
import { AncSocialHistoryService } from "@/apps/ANC/Services/anc_social_history_service"
import { IonPage } from "@ionic/vue"
import { Field, Option } from '@/components/Forms/FieldInterface'
import { FieldType } from '@/components/Forms/BaseFormElements'

export default defineComponent({
    components: { IonPage },
    mixins: [EncounterMixinVue],
    data: () => ({
        service: {} as any,
    }),
    watch: {
        ready: {
            handler(ready: boolean){
                if (ready) {
                    this.service = new AncSocialHistoryService(this.patientID, this.providerID)
                    this.fields = this.getFields()
                }
            }
        }
    },
    methods: {
        async onFinish(f: any, c: any){
            const obs = await this.resolveObs(c)
            await this.service.createEncounter()
            await this.service.saveObservationList(obs)
            await this.service.printSocialHistory()
            this.nextTask()
        },
        getFields(): Field[] {
            return [
                {
                    id: 'history',
                    helpText: 'Social history',
                    type: FieldType.TT_MULTI_SELECT_GRID,
                    validation: (v: Option[]) => {
						return v.map(v => v.value==='').some(Boolean)
							? ['Please complete selection!!'] 
							: null
                    },
                    computedValue: (v: Option[]) => v.filter(d => d.value != '')
                        .map(d => this.service.buildValueCoded(d.other.concept, d.value)),
                    options: () => {
                        return [
                            {
                                label: 'Currently Smoking',
                                value: '',
                                other: {
                                    concept: 'patient smokes',
                                    options: this.yesNoOptions()
                                }
                            },
                            {
                                label: 'Currently taking alcohol',
                                value: '',
                                other: {
                                    concept: 'Currently taking alcohol',
                                    options: this.yesNoOptions()
                                }
                            },
                            {
                                label: 'Marital status',
                                value: '',
                                other: {
                                    concept: 'Marital status',
                                    options: [
                                        this.toOption('Never Married'),
                                        this.toOption('Married'),
                                        this.toOption('Seperated'),
                                        this.toOption('Divorced')
                                    ]
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

