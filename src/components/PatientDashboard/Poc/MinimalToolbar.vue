<template>
  <div>
  <ion-menu menu-id="app-menu" content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title> {{ menuTitle }} </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item
          v-for="(item, i) in menuItems" :key="i"
          detail="true" 
          class="hydrated"
          @click="onClickItem(item)"
          >
          <ion-label>{{ item.label }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
  <ion-header> 
    <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
          <ion-title> {{ title }} </ion-title>
        </ion-buttons>
        <ion-buttons slot="end"> 
            <ion-thumbnail> 
                <img :src="appIconPath" class="logo" alt="Master card logo"/>
            </ion-thumbnail>
        </ion-buttons>
    </ion-toolbar>
  </ion-header>
</div>
</template>
<script lang="ts">
import Img from "@/utils/Img"
import { defineComponent } from "vue";
import {
  IonContent,
  IonItem,
  IonList,
  IonMenu,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonThumbnail,
  IonToolbar,
  IonHeader,
  IonLabel,
  menuController
} from "@ionic/vue";
import { Option } from "../../Forms/FieldInterface";
export default defineComponent({
  name: "App",
  emits: [ 'onClickMenuItem'],
  props: {
    title: String,
    menuTitle: String,
    menuItems: {
        type: Array,
        default: () => ([])
    },
    appIcon: {
        type: String,
        required: true
    }
  },
  components: {
    IonContent,
    IonItem,
    IonList,
    IonTitle,
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonThumbnail,
    IonToolbar,
    IonHeader,
    IonLabel
  },
  setup(props, context) {
    function onClickItem(item: Option) {
        menuController.close('app-menu')
        context.emit('onClickMenuItem', item)
    }
    return {
      onClickItem,
      appIconPath: Img(props.appIcon)
    }
  },
});
</script>