<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{title}}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-grid class="selector">
    <ion-row>
      <ion-col 
        size-lg="4"
        size-sm="6" 
        v-for="(taskItem, index) in filteredItems" 
        :key="index">
        <task-card
          @click="doTask(taskItem)"
          :title="taskItem.name.toUpperCase()"
          :description="taskItem.description"
          :taskCompleted="taskItem.taskCompleted"
          :taskDisabled="isDisabled(taskItem.disabled)"
          :icon="img(taskItem.icon)">
        </task-card>
     </ion-col>
    </ion-row>
  </ion-grid>
  <ion-footer>
    <ion-toolbar> 
      <ion-button class="close-btn" color="danger" size="large" @click="closeModal" slot="end"> Close </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import Img from "@/utils/Img"
import { defineComponent, PropType } from "vue";
import TaskCard from "@/components/DataViews/TaskCard.vue";
import { TaskInterface } from "@/apps/interfaces/TaskInterface";
import { GlobalPropertyService } from "@/services/global_property_service"
import {
  IonGrid,
  IonFooter,
  IonToolbar,
  IonButton,
  IonHeader,
  IonTitle,
  IonRow, 
  IonCol, 
  modalController 
} from "@ionic/vue"; 
import { isEmpty } from "lodash";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";

export default defineComponent({
  components: { 
    IonGrid, 
    IonRow, 
    IonCol, 
    TaskCard,
    IonFooter,
    IonToolbar,
    IonButton,
    IonHeader,
    IonTitle,
  },
  props: {
    title: {
      type: String,
      default: 'Select Activity'
    },
    items: {
      type: Object as PropType<TaskInterface[]>,
      required: true,
    },
    taskParams: {
      type: Object,
      required: false
    }
  },
  data: () => ({
    filteredItems: [] as TaskInterface[]
  }),
  watch: {
    items: {
      async handler(items: TaskInterface[]) {
        if (!items || isEmpty(items)) 
          return 
        for(const i in items){
          const item = items[i]
          if (item.globalProperty) {
            if (!(await GlobalPropertyService.isProp(
              item.globalProperty
              )))
             continue
          }
          if (item.condition) {
            if (!(await item.condition(this.taskParams))) {
              continue
            }
          }
          this.filteredItems.push(item)
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    img(name: string) {
      return Img(name)
    },
    isDisabled(disabled: ((tasksParams?: Record<string, any>) => any) | undefined) {
      if (typeof disabled === 'function') {
        return disabled(this.taskParams)
      }
      return false
    },
    closeModal() {
      modalController.dismiss({})
    },
    async doTask(taskItem: TaskInterface) {
      if (this.isDisabled(taskItem.disabled)) {
        return toastWarning('This task is disabled')
      }
      if (typeof taskItem.taskCompleted === 'boolean' 
        && taskItem?.taskCompleted) {
        if (!(await alertConfirmation(
          'This task was already completed. Do you want to continue?'
          ))) { 
          return
        }
      }
      if (taskItem.action) {
        taskItem.action(this.taskParams, this.$router)
      } else if (taskItem.url) {
        this.$router.push({ path: taskItem.url })
      } else {
        this.$router.push({ 
          name: taskItem.id,
          params: {
            'patient_id': this.taskParams?.patient.patient_id
          }
        })
      }
      this.closeModal()
    }
  }
})
</script>
<style scoped>
  .selector{
    width: 100%;
    height: 90%;
    overflow-y: auto;
  }
  .close-btn {
    margin: 2%;
  }
</style>