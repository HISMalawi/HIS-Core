<template>
    <view-port>
        <div class='primary-info'> 
            <ul class="his-md-text"> 
                <li v-for="(item, pindex) in titleItems" :key="pindex"> 
                    <b>{{ item.label }}:</b> {{item.value}}
                </li>
            </ul>
        </div>
        <div class="view-port-content">
            <b class="his-lg-text" :style="{marginLeft: '3%'}"> {{ config.title }} </b>
            <ul class='his-md-text secondary-info'> 
                <li v-for="(item, index) in bodyItems" :key="index"> 
                    {{ item.value }}
                </li>
            </ul>
        </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { Option } from "@/components/Forms/FieldInterface"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'

export default defineComponent({
    components: { ViewPort },
    mixins: [FieldMixinVue],
    data: () => ({
        listData: [] as Array<Option>
    }),
    computed: {
        titleItems(): Array<Option> {
            return this.listData.filter((item) => item.other?.type === 'title-section')
        },
        bodyItems(): Array<Option> {
            return this.listData.filter((item) => item?.other?.type != 'title-section')
        }
    },
    methods: {
        init() {
            this.$emit('onFieldActivated', this)
            this.listData = this.options(this.fdata)
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
.primary-info {
    border-bottom: .1rem solid #cccccc;
}
    .primary-info li {
        list-style: none;
        padding-bottom: 10px;
    }
    .secondary-info li {
        padding-bottom: 10px;
        margin-left: 4%;
    }
    .view-port-content {
        padding: 2%;
        background: white;
        height: 100%;
    }
</style>
