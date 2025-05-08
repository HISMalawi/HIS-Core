<template>
  <div>
    <view-port :showFull="false">
      <ion-grid>
        <ion-row button v-for="(item, index) in filtered" :key="index">
          <ion-col size="6">
            <h1>{{ item.label }}</h1>
          </ion-col>
          <ion-col size="6">
            <ion-segment
              mode="ios"
              @ionChange="segmentChanged($event)"
              v-model="value"
            >
              <ion-segment-button
                class="yes-no"
                v-for="(option, idx) in item.values"
                :key="idx"
                :value="option.value"
              >
                <ion-label>{{ format(`${option.label}`) }}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-col>
        </ion-row>
      </ion-grid>
    </view-port>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import SelectMixin from "@/components/FormElements/SelectMixin.vue";
import {
  IonRow,
  IonGrid,
  IonLabel,
  IonCol,
  IonSegment,
  IonSegmentButton,
} from "@ionic/vue";
import { toSentenceCase } from "@/utils/Strs";

export default defineComponent({
  components: {
    IonRow,
    IonGrid,
    IonLabel,
    IonCol,
    IonSegmentButton,
    IonSegment,
  },
  name: "HisSelect",
  mixins: [SelectMixin],
  watch: {
    clear() {
      this.value = ''
    },
    value : {
      handler(value: any) {
        this.$emit('onValue', value)
      },
      immediate: true
    }
  },
  data: () => ({
    value: '' as string,
  }),
  activated() {
    this.init()
  },
  async mounted() {
    await this.init()
    if (typeof this.defaultValue === 'function') {
      const value = await this.defaultValue(this.fdata, this.cdata)
      if (value != null || value != undefined) this.value = `${value}`
    }
  },
  methods: {
    format(str: string) {
      return toSentenceCase(str)
    },
    async init() {
      this.$emit('onFieldActivated', this)
      this.listData = await this.options(this.fdata);
    },
    onselect(data: any): void {
      this.$emit("onValue", data);
    },
    segmentChanged(ev: CustomEvent) {
      this.onselect(ev.detail.value);
    }
  }
});
</script>
<style scoped>
ion-segment-button {
  height: 50px;
  margin: 1%;
  font-size: 1.6em;
  --indicator-color: #028000;
  --border-color: red;
  --background: white;
}

.segment-button-checked {
  color: white;
}
</style>