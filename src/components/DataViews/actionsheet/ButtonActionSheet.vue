<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"> </action-header>
    <ion-content class="ion-text-center">
        <ion-list> 
            <ion-item 
                class="his-md-text"
                button
                :color="activeLabel === label ? 'secondary' : ''"
                v-for="(label, index) in list" 
                @click="onclick(label)"
                detail
                :key="index"> 
                {{label}} 
            </ion-item>
        </ion-list>
    </ion-content>
    <action-footer :buttons="buttons"> </action-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"
import { NavBtnInterface } from '@/components/HisDynamicNavFooterInterface'
import { modalController } from '@ionic/vue';
import { toastWarning } from "@/utils/Alerts"
import { 
    IonList, 
    IonItem,
    IonContent
} from "@ionic/vue"

export default defineComponent({
    components: { IonList, IonItem, IonContent },
    mixins: [ActionSheetMixin],
    data: () => ({
        activeLabel: '' as string
    }),
    props: {
        list: {
            type: Object as PropType<string[]>,
            required: true
        }
    },
    methods: {
        onclick(label: string){
            this.activeLabel = label
        }
    },
    computed: {
        buttons(): Array<NavBtnInterface> {
            return this.actionButtons.map((b: NavBtnInterface) => ({
                ...b,
                onClick: async () => {
                    if (b.role && b.role.match(/action/i) && !this.activeLabel) {
                        return toastWarning('Please select something chonde!')
                    }
                    await modalController.dismiss({ 
                        selection: this.activeLabel, action: b.name 
                    })
                }
            }))
        }
    }
})
</script>
<style scoped>
    .his-card {
        margin: auto;
        width: 98%;
    }
    .active-card-color {
        color: white !important;
        border-color: white !important;
    }
</style>
