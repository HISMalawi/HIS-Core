<template>
  <div>
    <div v-if="hasNotifications">
      <ion-segment mode="ios" v-model="activeTab" class="ion-justify-content-center">
        <ion-segment-button @click="stream('highVL')" value="highVL">
          <ion-label class="his-sm-text" style="font-weight: bold;">High Vl</ion-label>
          <ion-badge color="danger">{{ reportData.stats?.highVL ?? '-' }}</ion-badge>
        </ion-segment-button>
        <ion-segment-button @click="stream('rejectedVL')" value="rejectedVL">
          <ion-label class="his-sm-text" style="font-weight: bold;">Rejected</ion-label>
          <ion-badge color="warning">{{ reportData.stats?.rejectedVL ?? '-' }}</ion-badge>
        </ion-segment-button>
        <ion-segment-button @click="stream('normalVL')" value="normalVL">
          <ion-label class="his-sm-text" style="font-weight: bold;">Normal Results</ion-label>
          <ion-badge color="success">{{ reportData.stats?.normalVL ?? '-' }}</ion-badge>
        </ion-segment-button>
      </ion-segment>
      <p></p>
      <v2LiteTable
        :key="activeTab"
        :columns="columns"
        :column-data="reportData[activeTab]"
        :rows-per-page="7"
      />
    </div>
    <div v-else class="his-card ion-text-center his-lg-text">
      No notifications
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v2ColumnInterface } from '@/components/DataViews/tables/v2PocDatatable/types';
import v2LiteTable from '../DataViews/tables/v2PocDatatable/v2LiteTable.vue';
import { Notification } from '@/composables/notifications';
import { computed, watch, reactive, ref } from 'vue'
import { 
  IonSegmentButton,
  IonSegment,
  IonBadge,
  IonLabel
} from "@ionic/vue";
import { chunk } from 'lodash';
import { delayPromise } from '@/utils/Timers';
import { toDate } from '@/utils/Strs';

const { sortedNotifications, hasNotifications, clearNotification, openNotification } = Notification()

const activeTab = ref<'highVL'|'rejectedVL'|'normalVL'>('highVL')

const reportData = reactive<any>({
  highVL: [],
  rejectedVL: [],
  normalVL: [],
  initiatedData: {} as any,
  stats: {} as any
})

const columns = computed(() => {
  return [
    [
      { ref: 'arv', label: 'ARV #' },
      { ref: 'accession', label: 'Accession #' },
      { ref: 'order_date', label: "Order Date", toValue: (data: any) => `${toDate(data)}` },
      ...(() => {
        if (activeTab.value === 'rejectedVL') {
          return [{ ref: 'rejection_reason', label: "Rejection Reason" }]
        }
        return []
      })(),
      { 
        ref: 'id',
        label: 'View',
        toValue: () => "View",
        tdClick: (row: any) => openNotification(row.data)
      },
      { 
        ref: 'id',
        label: "Clear",
        toValue: () => "Clear",
        tdClick: (row: any) => clearNotification(row.refData, (id: any) => {
          reportData[activeTab.value] = reportData[activeTab.value]
            .filter((notice: any) => notice.id != id)
        })
      }
    ]
  ] as Array<v2ColumnInterface[]>
})

async function stream(tab: any, data=sortedNotifications.value) {
  if (data.length && reportData.initiatedData[tab]) return
  let debounce = 6000
  const chunks = chunk(data?.[0]?.['vlMessageObs']?.[tab]??{}, 7)
  reportData.initiatedData[tab] = data.length > 0
  reportData[tab] = []
  for (const stream of chunks) {
    reportData[tab] = [...reportData[tab], ...stream]
    // Lazy loading technique to reduce strain on lowend devices
    await delayPromise(debounce)
    debounce = 80
  }
}

watch(sortedNotifications, async (data) => {
  stream(activeTab.value, data)
  setTimeout(() => {
    const res = data?.[0]?.['vlMessageObs']??{}
    reportData.stats['highVL'] = (res.highVL??[]).length
    reportData.stats['normalVL'] = (res.normalVL??[]).length
    reportData.stats['rejectedVL'] = (res.rejectedVL??[]).length
  }, 450)
}, { immediate: true, deep: true })
</script>