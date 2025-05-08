<template>
    <div>
      <view-port :showFull="!showKeyboard" style="padding: 0;">
        <ion-grid>
          <ion-row>
            <ion-col size="12">
              <span v-for="(item, index) in checkedItems" :key="index"> 
                <ion-chip color="danger" @click="uncheck(item)">
                  <ion-label>
                    <ion-text class="his-md-text">
                      {{item.label}}
                    </ion-text>
                  </ion-label>
                </ion-chip>
              </span>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="4">
              <ion-list :style="{overflowY: 'auto', height:'80vh', margin: 0}"> 
                <ion-item
                  v-for="(data, index) in listData" :key="index"
                  @click="getSpecificRadiologyOrders(data.value)"
                  :detail="true"
                  :color="ActiveCategory === data.label ? 'lightblue':''"
                > 
                  <ion-label>
                    <ion-text class="his-md-text">
                      {{ data.label }}
                    </ion-text>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-col>
            <ion-col :style="{overflowY: 'auto', height:'78vh'}" v-if="ActiveCategory">
              <div style="">
                <ion-list class='view-port-content'>
                  <ion-item v-for="(entry, index) in activeCategoryItems" :key="index" :color="entry.isChecked ? 'lightblue':''">
                    <ion-label> 
                      <ion-text class="his-md-text">
                        {{ entry.label }} 
                      </ion-text>
                    </ion-label>
                    <ion-checkbox
                      slot="end"
                      v-model="entry.isChecked"
                      @ionChange="(e) => onselect(entry, e)"
                      :disabled="entry?.disabled"/>
                  </ion-item>
                </ion-list>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </view-port>
    </div>
</template>
<script lang="ts">
import { Option } from "../Forms/FieldInterface";
import { defineComponent } from "vue";
import { IonCheckbox, IonText, IonChip } from "@ionic/vue";
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import { PatientRadiologyService } from "@/apps/OPD/services/patient_radiology_service"
import { isEmpty } from "lodash";
import { ConceptName } from "@/interfaces/conceptName";

export default defineComponent({
  components: { IonCheckbox, IonText, IonChip },
  name: "HisRadiologyPicker",
  mixins: [SelectMixin],
  data: () => ({
    radiologyOrdersList: {} as Record<string, Option[]>,
    ActiveCategory: '',
  }),
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
      const data = await PatientRadiologyService.getRadiologyList('Radiology Orders')
      this.listData = this.mapListToOptions(data)
      this.$emit('onValue', this.getChecked(this.radiologyOrdersList))
    },
    async onselect(option: Option, event: any){
      this.$nextTick(async ()=> {
        const opt = {...option}
        opt.isChecked = event.target.checked

        if (this.onValue && opt.isChecked) {
          const ok = await this.onValue(opt)
          if (!ok) {
            return event.target.checked = false
          }
        }
        if (this.onValueUpdate) {
          this.radiologyOrdersList = await this.onValueUpdate({...this.radiologyOrdersList}, opt)
        }
        this.$emit('onValue', this.getChecked(this.radiologyOrdersList))
      })
    },
    async getSpecificRadiologyOrders(category: string) {
      if (!(category in this.radiologyOrdersList)) {
        const radiologyOrders = await PatientRadiologyService.getRadiologyList(category)
        this.radiologyOrdersList[category] = this.mapListToOptions(radiologyOrders, category)
      }
      this.ActiveCategory = category
    },
    mapListToOptions(list: ConceptName[], category = ''){
      if(isEmpty(list)) return []
      return list.map(item => {
        const option: Option = {
          label: item.name,
          value: item.name,
          isChecked: false,
          other: item
        }
        if(category) option.other.parent = category
        return option
      })
    },
    uncheck(option: Option){
      this.radiologyOrdersList[option.other.parent].forEach(opt => {
        if(opt.label === option.label) opt.isChecked = false
      })
    },
    getChecked(list: Record<string, Option[]>) {
      const checkedItems: Array<Option> = [];
      for (const group in list) {
        checkedItems.push(
          ...list[group].filter(option => option.isChecked)
        )
      }

      return checkedItems
    },
  },
  computed: {
    checkedItems(): Option[] {
      return this.getChecked(this.radiologyOrdersList)
    },
    activeCategoryItems(): Option[] {
      return this.radiologyOrdersList[this.ActiveCategory]
    }
  },
  watch: {
    clear(){
      for (const group in this.radiologyOrdersList) {
        this.radiologyOrdersList[group] = this.radiologyOrdersList[group].map(option => {
          option.isChecked = false
          return option
        })
      }
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  }
})
</script>
<style scoped>
ion-col {
  padding: 0;
  margin: 0;
  border-right: 1px solid lightgray;
}
</style>