<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-thumbnail slot="start">
                    <ion-img :src="logo"></ion-img>
                </ion-thumbnail>
                <ion-title>
                    <h1> {{app.applicationName}} Release Notes ({{ appVersion }})</h1>
                </ion-title>
                <ion-button
                    @click="() => typeof onCloseAction === 'function' ? onCloseAction() : null" 
                    color="danger"
                    slot="end">
                    Close
                </ion-button>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div class="ion-padding" v-html="notes"></div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import HisApp from "@/apps/app_lib"
import Img from "@/utils/Img"
import { Service } from "@/services/service"
import {
    IonPage,
    IonHeader,
    IonImg,
    IonTitle,
    IonThumbnail,
    IonContent,
    IonToolbar,
    IonButton
} from "@ionic/vue"
export default defineComponent({
    name: 'ReleaseNotesComponent',
    components: {
        IonPage,
        IonHeader,
        IonImg,
        IonTitle,
        IonThumbnail,
        IonContent,
        IonToolbar,
        IonButton
    },
    props: {
        app: {
            type: Object,
            required: true
        },
        onCloseAction: {
            type: Function,
            required: true
        }
    },
    setup(props) {
        const notes = ref('')
        const logo = ref('')
        const appVersion = Service.getAppVersion()
        watch(() => props.app, async (app) => {
            logo.value = Img(app.applicationIcon)
            HisApp.getReleaseNotes(app.applicationName)
                .then((d: any) => { if (d) notes.value = d })
        }, { deep: true, immediate: true })
        return {
            apiVersion: Service.getApiVersion(),
            appVersion,
            Img,
            logo,
            notes
        }
    }
})
</script>
<style scoped>
    h1 {
        color: green;
    }
    .text-center {
        text-align: center;
    }
</style>