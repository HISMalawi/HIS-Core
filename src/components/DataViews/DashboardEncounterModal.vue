<template>
  <ion-header>
    <ion-toolbar>
      <div class="his-md-text" style="display: flex; justify-content: space-between; width: 100%;">
        <span class="ion-margin-start">{{ title }}</span>
        <ion-text v-if="active.isBDE" color="danger">BDE Record</ion-text>
        <span class="ion-margin-end">Provider: {{ active.provider }}</span>
      </div>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <ion-row>
      <ion-col size="4">
        <ion-list>
          <ion-item
            class="his-sm-text"
            v-for="(item, index) in encounters"
            :key="index"
            :color="item.other.id === active.id ? 'primary' : ''"
            :detail="true"
            @click="() => showDetails(item)"
          >
            {{ item.label }}
          </ion-item>
        </ion-list>
      </ion-col>
      <ion-col size="8">
        <div class='tb'>
        <his-basic-table :columns="active.columns" :rows="active.rows"/>
        </div>
      </ion-col>
    </ion-row>
  </ion-content>
  <ion-footer>
    <ion-toolbar> 
      <ion-button color="danger" @click="voidActiveItem" :disabled="!canVoid" size="large"> Void encounter</ion-button>
      <ion-button @click="closeModal" size="large" slot="end"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import HisBasicTable from "@/components/DataViews/HisBasicTable.vue";
import popVoidReason from "@/utils/ActionSheetHelpers/VoidReason";
import { modalController } from "@ionic/vue"
import { toastDanger } from "@/utils/Alerts"
import { Option } from "@/components/Forms/FieldInterface"
import { isEmpty } from "lodash"
import {
  IonButton,
  IonToolbar,
  IonFooter,
  IonContent,
  IonRow,
  IonCol,
  IonTitle,
  IonHeader,
  IonItem,
  IonList
} from "@ionic/vue"

export default defineComponent({
  components: { 
    HisBasicTable,
    IonButton,
    IonToolbar,
    IonList,
    IonFooter,
    IonContent,
    IonRow,
    IonCol,
    IonTitle,
    IonHeader,
    IonItem
  },
  data: () => ({
    active: {
      id: -1,
      name: '',
      provider: '',
      rows: [],
      columns: []
    } as any,
    encounters: [] as any
  }),
  computed: {
    canVoid(): boolean {
      return !isEmpty(this.active)
    }
  },
  watch: {
    items: {
      handler(items: Option[]){
        if (!isEmpty(items)) {
          this.encounters = items
          this.showDetails(this.encounters[0])
        } 
      },
      immediate: true,
      deep: true
    }
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  methods: {
    closeModal() {
      modalController.dismiss({})
    },
    removeEncounter(id: number) {
      this.encounters = this.encounters.filter(
        (i: any) => i.other.id != id
      )
    },
    voidActiveItem() {
      popVoidReason(async (reason: string) => {
        try {
          await this.active.onVoid(reason)
          this.removeEncounter(this.active.id)
          this.active = {}
          // Set next active item
          if (!isEmpty(this.encounters)) {
            this.showDetails(this.encounters[0])
          }
        } catch (e) {
          toastDanger(`${e}`)
        }
      }, 'void-modal custom-modal-backdrop') 
    },
    async showDetails(item: Option) {
      this.active.id = item.other.id
      this.active.name = item.label
      this.active.columns = item.other.columns;
      this.active.onVoid = item.other.onVoid
      this.active.rows = await item.other.getRows()
      this.active.provider = await item.other.provider
      this.active.isBDE = item.other.isBDE ?? false
    },
  },
});
</script>
<style scoped>
  .tb {
    height: 80vh;
    overflow-y: auto;
  }
</style>