<template>
  <ion-page>
    <ion-header> 
      <ion-toolbar>
        <ion-title> 
          <ion-label :style="{fontWeight: 'bolder', fontSize: '1.9em'}"> 
            <b style="color: #8b4513">National </b>
            <b style="color: #cd853f">EMR</b>
          </ion-label>
        </ion-title>
        <ion-label class="ion-padding" slot="end">
          Version: <b>{{ version }}</b>
        </ion-label>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="false" style="width: 100%;">
      <inputs :useVirtualInput="useVirtualInputOnly"/>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <span slot="start">
          <img
            id="coat"
            :src="coatImg"
            alt="Malawi Coat of Arms logo"
          />
          <img
            id="pepfar"
            :src="pepfarImg"
            alt="PEPFAR logo"
          />
        </span>
        <ion-button
          color="dark"
          fill="outline"
          size="large"
          slot="end"
          id="configuration"
        >
          <ion-icon slot="end" :icon="chevronUp"></ion-icon> 
          Quick Actions
        </ion-button>
        <ion-popover trigger="configuration" dismiss-on-select style="--width: 300px;">
          <ion-content>
            <ion-list>
              <ion-item button router-link="/reset_password" class="his-sm-text">
                <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
                <ion-label>Reset Password</ion-label>
              </ion-item>
              <ion-item button router-link="/settings/host" class="his-sm-text">
                <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
                <ion-label>Network Settings</ion-label>
              </ion-item>
              <ion-item button detail id="devices" class="his-sm-text">
                <ion-icon :icon="albumsOutline" slot="start"></ion-icon>
                <ion-label>Device Profile</ion-label>
              </ion-item>
              <ion-popover trigger="devices" dismiss-on-select side="end">
                <ion-item 
                  v-for="device of deviceProfiles" 
                  :key="device.label" 
                  :color="device.label === profile ? 'primary' : 'light'"
                  button @click="() => profile = device.label"
                >
                  <ion-label>{{ device.label }}</ion-label>
                </ion-item>
              </ion-popover>
              <ion-item button @click="openSelect" class="his-sm-text">
                <ion-icon :icon="appsOutline" slot="start"></ion-icon>
                <ion-label>Other Applications</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>
<script lang="ts" setup>
import Inputs from "./LoginCustomPage.vue";
import {
  IonItem,
  IonButton, 
  IonPage, 
  IonContent, 
  IonFooter,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel,
  IonPopover,
  IonList,
  IonIcon,
} from "@ionic/vue";
import img from '@/utils/Img';
import { onMounted, ref } from 'vue';
import { AuthService } from '@/services/auth_service';
import usePlatform from '@/composables/usePlatform';
import { computed, watch } from 'vue';
import { KeyboardType } from "@/composables/usePlatform"
import { find } from 'lodash';
import { optionsActionSheet } from "@/utils/ActionSheets";
import { refreshOutline, albumsOutline, settingsOutline, appsOutline, chevronUp } from "ionicons/icons";

const coatImg = img('login-logos/Malawi-Coat_of_arms_of_arms.png');
const pepfarImg = img('login-logos/PEPFAR.png');
const otherApps = ref<Array<any>>([]);

const openSelect = async () => {
  const modal = await optionsActionSheet(
    'Application Selection',
    'Please specify the application you wish to use',
    otherApps.value.map((app) => app.name),
    [
      { name: 'Cancel', color: 'danger',  slot:'start'},
      { name: 'Confirm', color: 'primary', slot:'end', role: 'action'}
    ]
  )
  if (modal.selection && modal.action != 'Cancel') {
    const app = otherApps.value.find(app => app.name === modal.selection)
    window.open(`${app.protocol || 'http'}://${app.IP}:${app.port || 80}`, '_blank');
  }
};

const {
  activePlatformProfile,
  platformProfiles
} = usePlatform()
const version = ref('')
const profile = ref('' as string)
const useVirtualInputOnly = computed(
  () => activePlatformProfile.value.keyboard === KeyboardType.HIS_KEYBOARD_ONLY
)
const deviceProfiles: any = Object.keys(platformProfiles.value).map(key => ({
  label: key,
  value: { profileName: key, ...platformProfiles.value[key] },
}))
watch(profile, (v: string) => {
  activePlatformProfile.value = (find(deviceProfiles, { label: v }) || {}).value
})

onMounted(async () => {
  const auth = new AuthService()
  otherApps.value = (await auth.loadConfig())?.otherApps || []
  const appV = auth.getHeadVersion()
  auth.setActiveVersion(appV)
  const apiV = await auth.getApiVersion()
  version.value = `${appV} / ${apiV}`
  profile.value = activePlatformProfile.value?.profileName || ''
})

</script>
<style scoped>
#coat {
  width: 8vw;
  height: 8vw;
}
#pepfar {
  width: 6vw;
  height: 6vw;
}
.devices {
  background-color: var(--ion-color-primary);
  color: #fff;
  border: 1px solid lightblue;
  font-size: 1.3em;
  padding: 1rem;
  margin-right: .5rem;
}
.devices>option {
  background: #fff;
  color: black;
}
</style>
