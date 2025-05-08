<template>
    <div :style="{padding: '10px'}">
      <dynamic-nav color="light" :btns="btns"> </dynamic-nav>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import DynamicNav from "@/components/HisDynamicNavFooter.vue"
import { modalController } from '@ionic/vue';
import { NavBtnInterface } from "@/components/HisDynamicNavFooterInterface";

export default defineComponent({
    components: { DynamicNav },
    props: {
        buttons: {
            type: Array as PropType<NavBtnInterface[]>,
            default: () => []
        }
    },
    computed: {
        btns(): Array<NavBtnInterface> {
            return this.buttons.map((btn: any) => {
                btn.size = 'large'
                btn.color = btn.color || 'primary'
                btn.visible = true
                btn.styleClass = 'full-width-ion-btn'
                if (!btn.onClick) {
                    btn.onClick = async () => {
                        await modalController.dismiss({action: btn.name })
                    }
                }
                return btn
            })
        }
    },
})
</script>
