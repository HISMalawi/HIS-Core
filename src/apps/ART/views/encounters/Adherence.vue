<template>
    <his-standard-form 
        :skipSummary="true" 
        :fields="fields" 
        :onFinishAction="onSubmit"
        :cancelDestinationPath="cancelDestination" 
    />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import AdherenceMixinVue from './AdherenceMixin.vue'
export default defineComponent({
    mixins: [AdherenceMixinVue],
    watch: {
        ready: {
            async handler(ready: any) {
                if (ready) {
                    this.fields = this.getAdherenceFields()
                }
            },
            immediate: true
        }
    },
    methods: {
        async onSubmit() {
            await this.saveAdherence()
            this.nextTask()
        }
    }
})
</script>
