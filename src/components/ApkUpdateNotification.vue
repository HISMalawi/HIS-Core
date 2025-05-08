<template>
    <div id="update-notification" v-if="hasUpdate"> 
      New version (<strong>{{ newVersion  }}</strong>) update is available
      <br/>
      <br/>
      <ion-button @click="onVersionUpdate" color="success">
        Download Update
      </ion-button>
      &nbsp;&nbsp;&nbsp;
      <ion-button @click="onCancelVersionUpdate" color="danger">
        Cancel
      </ion-button>
      <ion-loading :is-open="isLoading" :message="loadingMsg"></ion-loading>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, computed } from 'vue'
import { IonButton, isPlatform, IonLoading } from "@ionic/vue"
import { AuthService } from '@/services/auth_service'
import { toastSuccess, toastWarning } from '@/utils/Alerts'
import { Directory, Filesystem } from '@capacitor/filesystem';
import { CapacitorAppInstaller } from 'capacitor-app-installer';

const props = defineProps({
    checkInterval: {
        type: Number,
        default: 3600000
    },
})

const isLoading = ref(false);
const activeVersion = ref('');
const newVersion = ref('')
const auth = new AuthService();

const hasUpdate = computed(() => !!newVersion.value && 
    newVersion.value != '-' && 
    newVersion.value !== activeVersion.value
);

const loadingMsg = ref("");

onMounted(initializeUpdateInterval);

function initializeUpdateInterval() {
    if(isPlatform("mobile") && isPlatform("android")) {
        setInterval(async () => {
            if (!hasUpdate.value) {
                newVersion.value = await auth.getApkVersion();
                activeVersion.value = auth.getHeadVersion();
            }
        }, props.checkInterval)
    }
}

function onCancelVersionUpdate () {
    newVersion.value = activeVersion.value
}

async function onVersionUpdate () {
    try{
        if(await isPermissionGranted()) {
            isLoading.value = true;
            addProgressListener();
            const path = await downloadAPK()
            isLoading.value = false;
            if(!path) throw new Error("Unable to download the app");
            toastSuccess("Download completed. Installing the app...");
            await installAPK(path);   
            activeVersion.value = newVersion.value;
        }
    } catch (error) {
        isLoading.value = false;
        console.error(error)
        toastWarning("Unable to update the app");
    }
}

async function isPermissionGranted() {
    try {
        const { publicStorage } = await Filesystem.checkPermissions();
        if (publicStorage !== "granted") {
            const { publicStorage: newPermission } = await Filesystem.requestPermissions();
            if (newPermission !== "granted") {
                toastWarning("Permission to access storage is required to download the app.");
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error(error);
        toastWarning("Unable to download the app. Please try again later");
        return false;
    }
}

async function downloadAPK() {
    try {
        const result = await Filesystem.downloadFile({
            url: await auth.getApkDownloadLink(newVersion.value),
            path: `Download/emr-${newVersion.value}.apk`,
            directory: Directory.ExternalStorage,
            recursive: true,
            progress: true,
        });
        return result.path;
    } catch (error: any) {
        console.error(error);
        toastWarning(error.toString());
    }
}

/**
 * Add progress listener to update the progress status of the APK download
 * 
 * @returns void
 */
function addProgressListener() {
    Filesystem.addListener("progress", (p) => {
        const totalBytes = Math.round(p.contentLength / 1024);
        const bytesTransferred = Math.round(p.bytes/ 1024);
        const percentage = Math.round((p.bytes / p.contentLength) * 100);
        loadingMsg.value = `Downloading... ${bytesTransferred}KB / ${totalBytes}KB (${percentage}%)`;
    });
}

async function installAPK(file: string) {
    try {
        await CapacitorAppInstaller.install({ file });
    } catch (error) {
        console.error(error);
        toastWarning("Unable to install the app. Please try again later");
    }
}
</script>

<style scoped>
  #update-notification {
    opacity: 0.95;
    position: absolute;
    background: #e1fef2;
    color: black;
    width: 100vw;
    margin: auto;
    padding: 1.6em;
    font-size: 1.8rem;
    top: 10%;/* Position Y halfway in */
    left: 50%; /* Position X halfway in */
    transform: translate(-50%,-50%); /* Move it halfway back(x,y) */
    text-align: center;
    z-index: 40;
  }
</style>
