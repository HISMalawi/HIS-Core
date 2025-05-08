<template>
    <ion-row>
        <ion-col size="5">
            <div class="large-card">
                <h2> {{ foundRecordsTitle }} ({{listData.length}}):  </h2>
                <ion-list>
                    <ion-item
                        class="his-sm-text"
                        button
                        v-for="(result, index) in listData"
                        :key="index"
                        :detail="true"
                        :color="result.value === selectedResult.value ? 'lightblue' : ''"
                        @click="onSelect(result)" >
                        <ion-avatar>
                          <ion-img src="/assets/images/avatar.svg"/>
                        </ion-avatar>
                        <ion-label> {{ result.label }} </ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-col>
        <ion-col size="7">
            <div class="large-card">
                <h3> {{ detailsTitle }} </h3>
                <ion-list>
                    <ion-item
                      class="his-md-text"
                      v-for="(opt, index) in patientAttributes"
                      :key="index"
                      inset="none"
                      >
                      <ion-label> 
                          {{ opt.label }} 
                      </ion-label>
                      <ion-label slot="end"> 
                        <b>{{ opt.value }}</b> 
                      </ion-label>
                    </ion-item>
                </ion-list>
            </div>
        </ion-col>
    </ion-row>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  IonRow,
  IonLabel,
  IonAvatar,
  IonCol,
  IonImg,
  IonList,
  IonItem,
} from "@ionic/vue";
import FieldMixinVue from "./FieldMixin.vue";
import { Option } from "@/components/Forms/FieldInterface"
import { isArray, isEmpty } from "lodash";

export default defineComponent({
  mixins:[FieldMixinVue],
  components: {
    IonLabel,
    IonAvatar,
    IonRow,
    IonImg,
    IonCol,
    IonList,
    IonItem,
  },
  data: () => ({
    listData: [] as Array<Option>,
    selectedResult: {} as any
  }),
  computed: {
    patientAttributes(): Option[] {
      if (!isEmpty(this.selectedResult) && isArray(this.selectedResult?.other?.options)) {
        return this.selectedResult?.other?.options.filter(
          (i: any) => typeof i?.other?.show === 'function' ? i?.other?.show() : true
        )
      }
      return []
    },
    foundRecordsTitle(): string {
      return this.config?.foundRecordsTitle || 'Found People'
    },
    detailsTitle(): string {
      return this.config?.detailsTitle || 'Details:'
    }
  },
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
      this.listData = await this.options(this.fdata, this)
      this.onSelect((this.listData.length > 0) ? this.listData[0] : {})
    },
    async onSelect(item: any) {
      if (!item) {
        return
      }
      if (this.onValue) {
        const ok = await this.onValue(item, this)
        if (!ok) {
          return
        }
      }
      this.selectedResult = item
      this.$emit('onValue', item)
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()  
  }
});
</script>

<style scoped>
.large-card {
  padding: 5%;
  border-radius: 15px;
  border: 1px solid #ccc;
  height: 82vh;
  background-color: rgb(255, 255, 255);
  overflow-y: auto;
  -webkit-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  -moz-box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
  box-shadow: 0px -2px 19px -2px rgba(196, 190, 196, 1);
}
</style>
