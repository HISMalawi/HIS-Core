<template>
  <view-port :showFull="!showKeyboard">
    <his-text-input v-if="showKeyboard" :value="filter" @onValue="(value: any) => onKbValue(value, showKeyboard)" :disabled="false"/>
    <span v-for="(item, index) in checkedItems" :key="index"> 
      <ion-chip 
        class="his-md-text" 
        color="primary" 
        @click="uncheck(item.label)">
        {{item.label}}
        <ion-icon :icon="closeIcon"></ion-icon>
      </ion-chip>
    </span>
    <ion-list class='view-port-content'>
      <ion-item 
        v-for="(entry, index) in listValues" 
        @click="() => onselect(entry)"
        :key="index" 
        :color="entry.isChecked ? 'lightblue':''" 
        :lines="entry.isChecked ? 'none':''">
        <ion-checkbox
          slot="start"
          v-model="entry.isChecked"
          :disabled="entry?.disabled" />
        <ion-label>
          <ion-text class="his-md-text">
            {{ entry.label }}
          </ion-text>
          <ion-text
            :color="entry.description.color"
            v-if="isDescription(entry.description, entry.isChecked)">
            <p><i>{{ entry.description.text }}</i></p>
          </ion-text>
        </ion-label>
      </ion-item>
    </ion-list>
  </view-port>
  <his-keyboard v-if="showKeyboard" :kbConfig="keyboard" :onKeyPress="keypress"/>
</template>
<script lang="ts">
import { FooterBtnEvent, Option, OptionDescriptionInterface } from "../Forms/FieldInterface";
import { defineComponent } from "vue";
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { isEmpty } from "lodash";
import { 
  IonCheckbox, 
  IonText, 
  IonChip,
  IonItem,
  IonList,
  IonLabel,
  IonIcon
} from "@ionic/vue";
import {
  close
} from "ionicons/icons"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import Fuse from "fuse.js";

export default defineComponent({
  components: { 
    IonCheckbox, 
    IonText, 
    IonChip,
    IonItem,
    IonList,
    IonLabel,
    IonIcon
  },
  data: () => ({
    listData: [] as Option[],
    filter: '' as string
  }),
  name: "HisMultipleSelect",
  mixins: [SelectMixin],
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
      // Optionally Prevent from rebuilding options everytime the component is activated
      if (!isEmpty(this.listData) && this.config.buildOptionsOnce) return
      this.listData = await this.options(this.fdata, this.getChecked(this.listData), this.cdata, this.listData)
      this.$emit('onValue', this.getChecked(this.listData))
    },
    async onselect(entry: Option) {
      setTimeout(() => this.filter='', 30)
      if (typeof entry?.other?.onEvent === 'function') {
        await entry.other.onEvent(entry.isChecked)
      }
      if (this.onValue && entry.isChecked) {
        const ok = await this.onValue(entry, this.fdata, this.cdata)
        if (!ok) {
          entry.isChecked = false
          return
        }
      }
      this.updateParent(entry)
    },
    async updateParent(newEntry: any) {
      if (this.onValueUpdate) {
        this.listData = await this.onValueUpdate([...this.listData], newEntry, this.fdata, this.cdata)
      }
      this.$emit('onValue', this.getChecked(this.listData))
    },
    onKbValue(text: any) {
      this.filter = text
    },
    keypress(text: any){
      this.filter = handleVirtualInput(text, this.filter)
    },
    uncheck(label: string) {
      let entry: any = null
      this.listData.forEach(option => {
        if (option.label === label && !option.disabled) {
          entry = option
          option.isChecked = false
        } 
      })
      this.updateParent(entry)
    },
    getChecked(list: Array<Option>) {
      return list.filter((item: Option) => item.isChecked)
    },
    isDescription(description: OptionDescriptionInterface, isChecked=false) {
      if (!description) 
        return false

      if (description?.show) {
          return (description.show === 'onChecked' && isChecked || description.show === 'always')
      }
      return true
    },
  },
  computed: {
    closeIcon: () => close,
    listValues() {
      if (this.filter) {
        const fuse = new Fuse(this.listData, {
					threshold: 0.3,
					keys: ['label'],
					useExtendedSearch: true
				})
				return fuse.search(this.filter).map((i: any) => i.item)
      }
      return this.listData
    },
    checkedItems(): Array<Option> {
      return this.getChecked(this.listData)
    }
  },
  watch: {
    clear() {
      this.listData.forEach((item) => item.isChecked = false)
    },
    footerButtonEvent: {
      async handler(event: FooterBtnEvent) {
        if (event && typeof event.onClickComponentEvents?.refreshOptions === 'function') {
          this.listData = await event.onClickComponentEvents?.refreshOptions(
            event, this.listData, this.fdata, this.cdata
          )
          this.$emit('onValue', this.getChecked(this.listData))
        }
      },
      deep: true,
      immediate: true
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