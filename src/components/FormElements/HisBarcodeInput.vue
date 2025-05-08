<template>
    <div class="his-card"> 
        <barcode-input @onScan="onScan"> </barcode-input>    
    </div>
    <div class="his-md-text ion-text-center" v-if="config?.showScannedBarcode">
        Barcode ID: 
        <ion-text :color=" barcode ? 'success' : 'dark'">
            <b>{{ barcode || 'None' }}</b>
        </ion-text>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FieldMixinVue from './FieldMixin.vue'
import BarcodeInput from "@/components/BarcodeInput.vue"

export default defineComponent({
    mixins: [FieldMixinVue],
    components: { BarcodeInput },
    data: () => ({
        barcode: '' as string,
    }),
    watch: {
        barcode: {
            handler: function (val: string) {
                this.$emit('onValue', val)
            },
            immediate: true
        },
        clear: {
            handler: function () {
                this.barcode = ''
            }
        }
    },
    methods: {
        async onScan(text: string) {
            this.barcode = ""
            if (this.onValue) {
                const ok = await this.onValue(text)
                if (!ok) {
                    return
                }
            }
            this.barcode = text
            this.$emit('onValue', text)
        }
    }
})
</script>
<style scoped>
    .his-card {
        margin: 2%;
    }
</style>