<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    emits: [
        'onValue',
        'onFieldActivated'
    ],
    props: {
        config: {
            type: Object,
            default: () => ({})
        },
        preset: {
            type: Object,
            default: () => ({
                label: '',
                value: ''
            })
        },
        defaultValue: {
            type: Function
        },
        fdata: {
            type: Object,
            required: true
        },
        cdata: {
            type: Object,
            required: true
        },
        clear: {
            type: Number,
            required: true
        },
        options: {
            type: Function,
            default: () => ([])
        },
        activationState: {
            type: String,
            default: ''
        },
        onValue: {
            type: Function
        },
        onValueUpdate: {
            type: Function
        },
        footerButtonEvent: {
            type: Object
        }
    }
})
</script>
