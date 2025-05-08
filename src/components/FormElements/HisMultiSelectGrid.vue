<template>
    <view-port>
        <ion-grid class='view-port-content'>
          <ion-row>
              <ion-col size="6" v-for="(group, groupIndex) in listData" :key="groupIndex"> 
                  <div class="his-card" 
                    v-if="typeof group?.other?.visible === 'boolean' 
                        ? group?.other?.visible
                        : true">
                  <ion-title class="his-md-text">{{ group.label }}</ion-title>
                  <ion-list>
                      <ion-radio-group v-model="group.value">
                        <ion-item class="his-md-text" v-for="(option, optionIndex) in (group?.other?.options || [])" :key="optionIndex">
                            <ion-radio 
                                slot="start" 
                                :value="option.value"
                                @click="typeof group?.other?.onClick === 'function'
                                    ? group.other.onClick(option, listData)
                                    : null">
                            </ion-radio>
                            <ion-label>{{option.label}}</ion-label>
                        </ion-item>
                      </ion-radio-group>
                  </ion-list>
                  </div>
              </ion-col>
          </ion-row>
        </ion-grid>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import FieldMixinVue from './FieldMixin.vue'
import ViewPort from '../DataViews/ViewPort.vue'
import {
    IonTitle,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonGrid,
    IonCol,
    IonRow,
} from "@ionic/vue"
import { isEmpty } from 'lodash'

export default defineComponent({
    name: "HisGridOptionSelect",
    mixins: [FieldMixinVue],
    components: {
        IonTitle,
        IonItem,
        IonRadioGroup,
        IonRadio,
        IonGrid,
        IonCol,
        IonRow,
        ViewPort
    },
    data: () => ({
        listData: [] as Option[]
    }),
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata)
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()        
    },
    watch: {
        listData: {
            handler(data: Option[]) {
                this.$emit('onValue', isEmpty(data) 
                    ? null : data.filter(i => typeof i.other.visible === 'boolean' 
                        ? i.other.visible 
                        : true)
                    )
            },
            deep: true
        }
    }
})
</script>
<style scoped>
    .his-card {
        height: 36vh;
        overflow-y: scroll;
    }
    ion-radio {
        --size: 48px;
    }
</style>
