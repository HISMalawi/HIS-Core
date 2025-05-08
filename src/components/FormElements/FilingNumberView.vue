<template>
    <view-port>
        <table>
            <tr> 
                <th> &nbsp; </th>
                <th> Name </th>
                <th> New Number </th>
                <th> Old Number </th>
            </tr>
            <tr v-for="(item, index) in listData" :key="index">
                <td>{{item.label}}</td>
                <td>{{item.value}}</td>
                <td>
                    <div class='f-number f-active-col'> 
                       {{item.other.activeNumber}}
                    </div>
                </td>
                <td> 
                    <div class='f-number f-inactive-col'> 
                       {{item.other.dormantNumber}}
                    </div>
                </td>
            </tr>
        </table>
    </view-port>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from '@/components/DataViews/ViewPort.vue'
import FieldMixinVue from './FieldMixin.vue'
import { Option } from '../Forms/FieldInterface'

export default defineComponent({
    components: { ViewPort },
    mixins: [FieldMixinVue],
    data: () => ({
       listData: [] as Array<Option> 
    }),
    methods: {
        async init() {
            this.$emit('onFieldActivated', this)
            this.listData = await this.options(this.fdata, this.cdata)
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
    .f-active-col {
        background-color: lightgreen;
    }
    .f-inactive-col {
        background-color: lightyellow;
    }
    .f-number {
        padding: 3em;
        font-size: 1.2em;
        font-weight: bold;
        border: solid 2px #ccc;
    }
    table {
        width: 100%;
    }
    th, td {
        padding: 2em;
        text-align: center;
    }
</style>