<template>
    <component
        v-bind:is="formType"
        :fields="fields"
        :skipSummary="skipSummary"
        :activeField="activeField"
        :cancelDestinationPath="cancelDestinationPath"
        @onFinish="onFinish"
        :onFinish="onFinishAction"
        @onIndex="onIndex"
        >
    </component>
</template>

<script lang="ts">
import TouchScreenForm from "@/components/Forms/TouchScreenForm.vue";
import { defineComponent, PropType } from "vue";
import { Field } from "./FieldInterface";

export default defineComponent({
    name: "HisStandardForm",
    components: { TouchScreenForm },
    emits: [
        'onFinish',
        'onIndex'
    ],
    data: () => ({
        formType: 'touch-screen-form' as string
    }),
    props: {
        onFinishAction: {
            type: Function
        },
        skipSummary: {
            type: Boolean,
            default: false
        },
        activeField: {
            type: String
        },
        fields: {
            type: Object as PropType<Field[]>,
            required: true
        },
        cancelDestinationPath: {
            type: String,
            required: false,
        }
    },
    methods: {
        onFinish(formData: any, computedData: any) {
            this.$emit('onFinish', formData, computedData)
        },
        onIndex(i: number) {
            this.$emit('onIndex', i)
        }
    }
})
</script>
