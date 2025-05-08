<template>
    <ion-modal :is-open="showFullscreenNotice" cssClass="void-modal"> 
        <ion-page> 
            <ion-header> 
                <ion-toolbar> 
                    <ion-title class="ion-text-center"> 
                       Confirmation           
                    </ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding ion-text-center"> 
                <h1 class="vertically-align">Do you want to enter fullscreen mode?</h1>
            </ion-content>
            <ion-footer> 
                <ion-toolbar> 
                    <ion-button slot="start" @click="closeModal" size="large" color="danger"> 
                        No
                    </ion-button>
                    <ion-button slot="end" @click="enterFullscreen" size="large" color="success">
                        Yes
                    </ion-button>
                </ion-toolbar>
            </ion-footer>
        </ion-page>
    </ion-modal>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
    IonModal,
    IonPage,
    IonHeader,
    IonTitle,
    IonButton,
    IonToolbar,
    IonContent,
    IonFooter,
    modalController,
} from "@ionic/vue"
export default defineComponent({
    components: {
        IonModal,
        IonPage,
        IonHeader,
        IonTitle,
        IonButton,
        IonToolbar,
        IonContent,
        IonFooter
    },
    setup() {
        const showFullscreenNotice = ref(!document.fullscreenElement)

        document.addEventListener('fullscreenchange', () => {
            showFullscreenNotice.value = !document.fullscreenElement 
        })

        function closeModal() {
            modalController.dismiss()
        }

        function enterFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen({ navigationUI: 'hide' });
            }
            showFullscreenNotice.value = false
        }
        return {
            closeModal,
            enterFullscreen,
            showFullscreenNotice
        }
    }
})
</script>
<style scoped>
    ion-button {
        width: 100%
    }
</style>