<template>
    <view-port> 
        <div class="view-port-content"> 
            <ion-row>
                <ion-col size-md="6" size-sm="12"> 
                    <regimen-card
                        class="regimen-item"
                        v-for="(item, lIndex) in leftItems" :key="lIndex"
                        :label="item.label" 
                        :value="item.value"
                        @onclick="onselect(item)"
                        :color="item.label === selected ? 'active-card-color' : 'inactive-card-color'"
                    />
                </ion-col>
                <ion-col size-md="6" size-sm="12"> 
                    <regimen-card
                        class="regimen-item"
                        v-for="(item, rIndex) in rightItems" :key="rIndex"
                        :label="item.label" 
                        :value="item.value"
                        @onclick="onselect(item)"
                        :color="item.label === selected ? 'active-card-color' : 'inactive-card-color'"
                    />
                </ion-col>
            </ion-row>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from '../Forms/FieldInterface'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import SelectMixin from "@/components/FormElements/SelectMixin.vue"
import RegimenCard from "@/components/DataViews/RegimenCard.vue"
import { isEmpty } from 'lodash'
import { IonRow, IonCol } from '@ionic/vue'

export default defineComponent({
    components: { 
        ViewPort, 
        RegimenCard, 
        IonRow, 
        IonCol 
    },
    mixins: [SelectMixin],
    watch: {
        clear(val: boolean){
            if (val) this.clearSelection()
        }
    },
    computed: {
        leftItems(): any {
            return !isEmpty(this.listData) ? this.listData[0] : []
        },
        rightItems(): any {
            return !isEmpty(this.listData) ? this.listData[1] : []            
        }
    },
    async mounted() {
        this.init()
    },
    activated() {
        this.$emit('onFieldActivated', this)
    },
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            const options = await this.options(this.fdata)
            this.listData = this.buildList(options)
        },
        buildList(options: Array<Option>) {
            const turple: Array<any> = [[], []]
            const sort = (items: any) => items.sort((a: any, b: any) => a.value > b.value ? 1 : -1)
            options.forEach(o => {
                const code = parseInt(o.value.toString())
                code < 10 ? turple[0].push(o) : turple[1].push(o)
            })
            return [sort(turple[0]), sort(turple[1])]
        },
        async onselect(item: Option) {
            this.selected = item.label
            if (this.onValue) {
               const ok = await this.onValue(item)
               if (!ok) {
                   this.selected = ''
                   this.$emit('onValue', null)
                   return
               }
            }
            if (this.onValueUpdate) {
                this.listData = await this.onValueUpdate([...this.listData], item)
            }
            this.$emit('onValue', item)
        }
    }
})
</script>
<style scoped>
#view-port {
    height: 75vh;
}
.view-port-content {
    height: 99%;
}
.regimen-item {
    margin: 3.8%;
}
</style>
