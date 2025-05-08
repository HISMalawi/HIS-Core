<template>
  <view-port :showFull="!showKeyboard">
    <his-text-input v-if="showKeyboard" :value="selected" @onValue="onKBValue"/>
    <ion-chip color="danger" v-for="(item, index) in checkedItems" :key="index" @click="unCheck(item)">
      {{ item.label }}
    </ion-chip>
    <ion-content style="width: 100%;" class="ion-padding-bottom view-port-content">
      <ion-list>
        <ion-item v-for="(entry, index) in listData" :key="index" :color="entry.isChecked ? 'lightblue':''" :lines="entry.isChecked ? 'none': undefined">
          <ion-label> 
            <ion-text class="his-md-text">{{ entry.label }} </ion-text>
            <ion-text :color="entry.description?.color" v-if="entry.description && entry.isChecked"> 
              <p><i>{{ entry.description.text }}</i></p>
            </ion-text>
          </ion-label>
          <ion-checkbox
            slot="start"
            v-model="entry.isChecked"
            @ionChange="onSelect(entry)"
            :disabled="entry.disabled"
          />
        </ion-item>
      </ion-list>
      <ion-infinite-scroll @ionInfinite="pushData" threshold="100px" :disabled="disableScroll" >
        <ion-infinite-scroll-content loading-spinner="crescent" loading-text="Loading more data..." />
      </ion-infinite-scroll>
    </ion-content >
  </view-port>
  <his-keyboard v-if="showKeyboard" :kbConfig="keyboard" :onKeyPress="keypress"/>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Option } from "../Forms/FieldInterface";
import { QWERTY } from "../Keyboard/HisKbConfigurations";
import ViewPort from "../DataViews/ViewPort.vue";
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import FieldMixinVue from './FieldMixin.vue';
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import { 
  IonCheckbox, 
  IonText, 
  IonChip, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonInfiniteScroll, 
  IonInfiniteScrollContent, 
  InfiniteScrollCustomEvent
} from "@ionic/vue";
import { uniqueBy } from "@/utils/Arrays";

export default defineComponent({
  name: "HisInfiniteScrollMultipleSelect",
  mixins: [FieldMixinVue],
  components: { 
    IonCheckbox, 
    IonText, 
    IonChip,
    ViewPort,
    HisTextInput,
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    HisKeyboard,
    IonInfiniteScroll, 
    IonInfiniteScrollContent 
  },
  data: () => ({
    showKeyboard: false,
    keyboard: QWERTY,
    listData: [] as Array<Option>,
    checkedItems: [] as Array<Option>,
    disableScroll: false,
    filter: '',
    selected: '',
    page: 1,
    limit: 10,
  }),
  watch: {
    clear(){
      this.checkedItems = [],
      this.filter = ''
      this.selected = ''
    },
    checkedItems: {
      handler(newValue: Array<Option>) {
        this.listData.forEach(entry => {
          if (newValue.find(item => item.value === entry.value)) {
            entry.isChecked = true;
          } else {
            entry.isChecked = false;
          }
        });
        this.$emit("onValue", newValue);
      },
      deep: true,
      immediate: true
    },
    filter: {
      async handler() {
        this.page = 1;
        this.disableScroll = false;
        const data = await this.getListData();
        [...this.checkedItems].forEach(item => {
          const index = data.findIndex(entry => entry.value === item.value);
          if(index === -1) {
            data.push(item);
          } else {
            data[index].isChecked = true;
          }
        })
        this.listData = data;
      },
    },
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  methods: {
    async init() {
      this.$emit('onFieldActivated', this);
      this.listData = await this.getListData();
    },
    async getListData(): Promise<Array<Option>> {
      return await this.options(this.fdata, this.filter, this.page, this.limit);
    },
    async keypress(value: string) {
      if (!this.filter) this.selected = ''
      this.filter = handleVirtualInput(value, this.selected)
      this.selected = this.filter
    },
    async onKBValue(value: string) {
      if (!this.listData || this.selected === value) return
      this.filter = value
      this.selected = this.filter
    },
    async pushData(ev: InfiniteScrollCustomEvent) {
      this.page++;
      const data = await this.getListData();
      if (data.length > 0) {
        this.listData = uniqueBy([
          ...this.listData, 
          ...data.filter(entry => !this.listData.find(item => item.value === entry.value))
        ], 'label');
      } else {
        this.disableScroll = true;
      }
      setTimeout(() => ev.target.complete(), 500);
    },
    onSelect(entry: Option) {
      this.$nextTick(async () => {
        if (entry.isChecked) {
          if((this.checkedItems.findIndex(item => item.value === entry.value)) === -1) {
            this.checkedItems.push(entry);
          }
        } else {
          this.unCheck(entry);
        }
        if(typeof this.onValueUpdate === 'function') {
          this.checkedItems = await this.onValueUpdate([...this.checkedItems]);
        }
      });
    },
    unCheck(entry: Option) {
      this.checkedItems = this.checkedItems.filter(item => item.value !== entry.value);
    },
  },
  created() {
    this.showKeyboard = this.config?.showKeyboard ?? false;
    this.keyboard = this.config?.keyboard ?? QWERTY;
    this.page = this.config?.page ?? 1;
    this.limit = this.config?.limit ?? 10;
  }
});
</script>