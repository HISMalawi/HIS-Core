<template>
    <view-port>
        <div class="view-port-content"> 
            <list :listData="listData"></list>
        </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import list from '@/components/DataViews/TwoColmunList.vue'

export default defineComponent({
    components: { 
        ViewPort,
        list
    },
    mixins: [FieldMixinVue],
    data: () => ({
        listData: [] as Array<Option[]>
    }),
    methods: {
        init() {
            this.$emit('onFieldActivated', this)
            this.listData = this.options(this.fdata, this.cdata)
        }
    },
    mounted() {
        this.init()
    },
    activated() {
        this.init()        
    },
})
</script>
<style scoped>
    .view-port-content {
        height: 100%;
    }
</style>
