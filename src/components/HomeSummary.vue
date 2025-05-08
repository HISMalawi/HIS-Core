<template>
    <ion-page>
        <ion-header> 
            <ion-toolbar>
                <ion-title class="his-lg-text"> 
                    {{dialogTitle}}
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <text-skeleton v-if="isLoading" :itemCount="5"/>
            <ion-list v-if="!isLoading"> 
                <ion-item class="his-md-text" v-for="(item, index) in items" :key="index"> 
                    <ion-label>
                        {{item.label}}
                    </ion-label>
                    <b :style="{ backgroundColor: item.color || '', padding: '0.4em'}" v-html="item.value"></b>
                </ion-item>
            </ion-list>
        </ion-content>
        <ion-footer>
            <ion-toolbar> 
                <ion-button :disabled="isLoading" @click="updateData" color="success" size="large" slot="end"> 
                    Refresh
                </ion-button>
                <ion-button :disabled="isLoading" @click="onClose" size="large" slot="end"> 
                    Close
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>    
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { 
    IonPage,
    IonTitle,
    IonHeader,
    IonContent,
    IonFooter,
    IonToolbar,
    IonItem,
    IonList,
    IonButton
} from "@ionic/vue"
import { toastDanger } from '@/utils/Alerts'
import { Option } from './Forms/FieldInterface'
import TextSkeleton from '@/components/TextSkeleton.vue'

export default defineComponent({
    setup: (props) => {
        const dialogTitle = ref(props.title)
        const isLoading = ref(false)
        const items = ref([] as Option[])
        async function updateData() {
            isLoading.value = true
            if (typeof props.loadData === 'function') {
                try {
                    items.value = await props.loadData(dialogTitle)
                } catch (e) {
                    toastDanger(`${e}`)
                }
            }
            isLoading.value = false
        }
        onMounted(() => {
            updateData()
        })
        return {
            items,
            dialogTitle,
            isLoading,
            updateData
        }
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        loadData: {
            type: Function,
            required: true
        },
        onClose: {
            type: Function,
            required: true
        }
    },
    components: {
        TextSkeleton,
        IonPage,
        IonTitle,
        IonHeader,
        IonContent,
        IonFooter,
        IonToolbar,
        IonButton,
        IonItem,
        IonList
    }
})
</script>
