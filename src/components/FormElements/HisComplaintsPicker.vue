<template>
    <div>
      <view-port :showFull="!showKeyboard" style="padding: 0; height:82vh;" >
        <his-text-input :value="selected" :placeholder="'Search'" @onValue="onKBValue" @click="keyboardStatus"/>
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
                  v-for="(data, index) in groupNames" :key="index"
                  @click="getSpecificComplaints(data.value)"
                  :detail="true"
                  :color="ActiveCategory === data.label ? 'light':''"
                  v-show="data.other.display"
                > 
                  <ion-label>
                    <ion-text class="his-md-text">
                      {{ data.label }}
                    </ion-text>
                  </ion-label>
                </ion-item> 
              </ion-list>
            </ion-col>
            <ion-col :style="{overflowY: 'auto', height:'75vh'}" v-if="ActiveCategory">
              <div style="">
                <!-- v-show="entry.isChecked"  -->
                <ion-list class='view-port-content'>
                  <ion-item v-for="(entry, index) in activeCategoryItems" :key="index" v-show="entry.other.display"  :color="entry.isChecked ? 'light':''">
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
            <his-keyboard v-if="showKeyboard" :kbConfig="keyboard" :onKeyPress="keypress"/>
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
import { PatientComplaintsService } from "@/apps/OPD/services/patient_complaints_service";
import { isEmpty } from "lodash";
import { ConceptName } from "@/interfaces/conceptName";
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"

export default defineComponent({
  components: { IonCheckbox, IonText, IonChip,HisKeyboard },
  name: "HisComplaintsPicker",
  mixins: [SelectMixin],
  data: () => ({
    complaintsList: {} as Record<string, Option[]>,
    ActiveCategory: '',
    allComplainList: {} as any,
    displayComplainList: {} as any,
    groupNames: [] as any,
    showKeyboard: false,
    groupData: [] as any
  }),
  methods: {
    async init() {
      this.$emit('onFieldActivated', this)
      const data = await PatientComplaintsService.getComplaintsList('Presenting complaint group')
      this.listData = this.mapListToOptions(data)
      this.groupData = data
      this.groupNames = this.listData
      for(const data in this.listData){
        const category = this.listData[data].label
        if(/other/i.test(category)) {
          this.allComplainList[category] = this.mapListToOptions([{
            name: 'Other (specify)',
            concept_id: 6408,
          } as ConceptName], category)
          continue
        }
        const complaints: Array<ConceptName> = await PatientComplaintsService.getComplaintsList(category)
        const filteredComplaints = complaints.filter(complaint => complaint.name !== "Other")
        this.allComplainList[category] = this.mapListToOptions(filteredComplaints, category)
      }
      this.$emit('onValue', this.getChecked(this.complaintsList))
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
          this.complaintsList = await this.onValueUpdate({...this.complaintsList}, opt)
        }
        this.$emit('onValue', this.getChecked(this.complaintsList))
      })
    },
    async onKBValue(value: string) {
      if(value != ""){
        for(const group in this.groupNames){
          this.groupNames[group].other['display'] =false
        }
        for(const position in this.listData){
          let groupNames = ""
          const category = this.listData[position].label
          const allComplainList = []
          const complaints = this.allComplainList[category]
          for(const item in complaints){
            const complaint =complaints[item].label
            if(complaint.toLowerCase().match(value.toLowerCase())&& category){
              complaints[item].other['display'] = true
              allComplainList.push(complaints[item])
              groupNames = category
              this.ActiveCategory = category
            }
            else{
              complaints[item].other['display'] = false
              allComplainList.push(complaints[item])
            }
          }
          if(groupNames != ""){
            for(const g in this.groupNames){
              if(this.groupNames[g].label == category)
              this.groupNames[g].other['display'] =true
            }
          }
          this.allComplainList[category] = allComplainList
        }
        this.complaintsList[this.ActiveCategory] = this.allComplainList[this.ActiveCategory]
      }
      else
      {
        for(const position in this.listData){
          const category = this.listData[position].label
          const allComplainList = []
          const complaints = this.allComplainList[category]
          for(const item in complaints){
            complaints[item].other['display'] = true
            allComplainList.push(complaints[item])
          }
          this.allComplainList[category] = allComplainList
        }
        this.groupNames = this.mapListToOptions(this.groupData)
        this.ActiveCategory =""
        
      }
    },
    keyboardStatus(){
      this.showKeyboard = !this.showKeyboard
    },
    async getSpecificComplaints(category: string) {
      if (!(category in this.complaintsList)) {
        this.complaintsList[category] = this.allComplainList[category]
      }
      this.ActiveCategory = category
    },
    mapListToOptions(list: ConceptName[], category = ''){
      if(isEmpty(list)) return []
      const display = {display:true}
      return list.map(item => {
        const option: Option = {
          label: item.name,
          value: item.name,
          isChecked: false,
          other: {...item,...display}
        }
        if(category) option.other.parent = category
        return option
      })
    },
    uncheck(option: Option){
      this.complaintsList[option.other.parent].forEach(opt => {
        if(opt.label === option.label) opt.isChecked = false
      })
    },
    getChecked(list: Record<string, Option[]>) {
      const checkedItems: Array<Option> = [];
      for (const group in list) {
        checkedItems.push(
          ...(list[group]||[]).filter(option => option.isChecked)
        )
      }

      return checkedItems
    },
  },
  computed: {
    checkedItems(): Option[] {
      return this.getChecked(this.complaintsList)
    },
    activeCategoryItems(): Option[] {
      return this.complaintsList[this.ActiveCategory]
    }
  },
  watch: {
    clear(){
      for (const group in this.complaintsList) {
        if (!this.complaintsList[group]) continue
        this.complaintsList[group] = this.complaintsList[group].map(option => ({
          ...option, isChecked: false
        }))
      }
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
ion-col {
  padding: 0;
  margin: 0;
  border-right: 1px solid lightgray;
}
</style>