<template>
    <his-standard-form :fields="fields" @onFinish="onFinish" :skipSummary="true"
        :cancelDestinationPath="cancelDestination">
    </his-standard-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FieldType } from "@/components/Forms/BaseFormElements";
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import EncounterMixinVue from "@/views/EncounterMixin.vue";
import router from "@/router";
import { LabService } from "@/apps/TB/services/lab_service"
import { toDate } from "@/utils/Strs";

export default defineComponent({
    mixins: [EncounterMixinVue],
    components: { HisStandardForm },
    data: () => ({
        fields: [] as any
    }),
    watch: {
        ready: {
            handler(ready: boolean) {
                if (ready) this.fields = this.getFields()
            }
        }
    },
    methods: {
        onFinish() {
            this.nextTask()
        },
        getFields(): any {
            return [
                {
                    id: "patient_lab_orders",
                    helpText: "Lab Orders " + toDate(`${this.$route.query.date}`),
                    type: FieldType.TT_TABLE_VIEWER,
                    options: async () => {
                        const orders = await LabService.getRecentOrders(this.patientID, `${this.$route.query.date}`)
                        const data = await LabService.formatOrderObs(orders)
                        return [
                            {
                                label: "TB Orders",
                                value: "",
                                other: {
                                    columns: ["Test", "Specimen", "Reason for test", "Lab", "Time"],
                                    rows: data.map((i: any) => [
                                        i["Test requested"], 
                                        i["Sample"], 
                                        i["Reason for test"],
                                        i["Lab"],
                                        i["time"]
                                    ])
                                }
                            }
                        ]
                    },
                    config: {
                        hiddenFooterBtns: ["Clear"],
                        footerBtns: [
                            {
                                name: "Order",
                                size: "large",
                                slot: "end",
                                color: "primary",
                                visible: true,
                                onClick: () => router.push(`/tb/lab/${this.patientID}`)
                            }
                        ]
                    }
                }
            ]
        }
    }
});
</script>