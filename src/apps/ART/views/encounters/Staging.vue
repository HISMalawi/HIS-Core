<template>
    <his-standard-form :skipSummary="true" :cancelDestinationPath="cancelDestination" :fields="fields" :onFinishAction="onSubmit"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import StagingMixin from "@/apps/ART/views/encounters/StagingMixin.vue"
import { toastSuccess } from "@/utils/Alerts"

export default defineComponent({
    mixins: [StagingMixin],
    watch: {
        ready: {
            async handler(ready: boolean){
                if (ready) {
                    await this.initStaging(this.patient)
                    this.fields = [...this.getStagingFields(), this.getStagingSummaryField()]
                }
            },
            immediate: true
        }
    },
    methods: {
        async onSubmit(f: any, computedValues: any) {
            await this.submitStaging(computedValues)
            toastSuccess('Staging information has been saved')
            this.nextTask()
        }
    }
})
</script>
