<template>
  <div>
    <view-port :showFull="true">
      <ion-grid class="view-port-content">
        <ion-row >
          <ion-col :size="getSize" v-for="(item, index) in listData" :key="index">
            <ion-grid>
            <ion-row>
            <ion-col size="6" class="ion-col">
            <span class="his-lg-text">{{ item.label }}</span>
          </ion-col>
          <ion-col size="6">
            <ion-segment
              mode="ios"
              v-model="item.value"
              @ionChange="() => onChange(item)"
            >
              <ion-segment-button
                class="yes-no his-lg-text"
                v-for="(option, idx) in item.other.values"
                :key="idx"
                :value="option.value"
              >
                <ion-label>{{ option.label }}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-col>

            </ion-row>
            </ion-grid>
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
import { FooterBtnEvent, Option } from "../Forms/FieldInterface";
import { isEmpty } from "lodash";
export default defineComponent({
  components: {
    IonRow,
    IonGrid,
    IonLabel,
    IonCol,
    IonSegmentButton,
    IonSegment,
  },
  name: "HisMultiYesNo",
  mixins: [SelectMixin],
  watch: {
    footerButtonEvent: {
      handler(event: FooterBtnEvent) {
        if (event && typeof event.onClickComponentEvents?.refreshOptions === 'function') {
          this.listData = event.onClickComponentEvents?.refreshOptions(
            event, this.listData, this.fdata, this.cdata
          )
          this.$emit('onValue', !isEmpty(this.listData) ? this.listData : null)
        }
      },
      deep: true,
      immediate: true
    },
    clear() {
      this.listData = this.listData.map(i => {
        i.value = ''
        return i
      })
    }
  },
  computed: {
    getSize(): string {
      return this.listData.length > 6 ? '6' : '12'
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
      const values = this.listData.filter(i => i.value != '')
      this.listData = await this.options(this.fdata, values);
    },
    onChange(val: Option): void {
      this.$nextTick(async () => {
        if (typeof this.onValue === 'function') {
          const ok = await this.onValue(val, this.fdata, this.cdata)
          if (!ok) {
            val.value = ""
            return
          }
        }
        if(typeof this.onValueUpdate === 'function') {
          this.listData = await this.onValueUpdate(this.listData, val)
        }
        if (this.listData.every(i => i.value != '')) {
          this.$emit("onValue", this.listData)
        }
      })
    }
  }
})
</script>
<style scoped>
ion-segment-button {
  height: 50px;
  margin: 1%;
  --indicator-color: #028000;
  --background: white;
}

.segment-button-checked {
  color: white;
}
.ion-col{
  margin: auto;
}
</style>