<script lang="ts">
import { defineComponent, PropType } from "vue";
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";
import ActionHeader from "@/components/DataViews/actionsheet/ActionSheetToolbar.vue"
import ActionFooter  from "@/components/DataViews/actionsheet/ActionSheetFooter.vue"

export default defineComponent({
    components: { ActionHeader, ActionFooter },
    props: {
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String
        },
        actionButtons: {
            type: Object as PropType<NavBtnInterface[]>,
            required: true
        },
        color: {
            type: String
        }
    }
})
</script>
