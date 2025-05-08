<template>
  <ion-footer>
    <ion-toolbar :color="color">
      <ion-button
        v-for="(btn, index) in footerBtns" :key="index"
        :slot="btn.slot"
        v-show="btn.visible" 
        @click="btn.onClick(btn)"
        :color="btn.color"
        :class="btn.styleClass"
        :size="btn.size">
        {{btn.name}}
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {IonButton, IonFooter, IonToolbar} from "@ionic/vue";
import { NavBtnInterface } from './HisDynamicNavFooterInterface'
export default defineComponent({
  name: "HisNavFooter",
  data: () => ({
    footerBtns: [] as Array<NavBtnInterface>
  }),
  created() {
    this.$emit('onFooterInstance', this)
  },
  props: {
    color: {
      type: String,
      default: 'dark'
    },
    state: {
      type: Object as PropType<Record<string, any>>,
    },
    btns: {
      type: Object as PropType<Array<NavBtnInterface>>,
      required: true
    }
  },
  components: {
    IonButton,
    IonFooter,
    IonToolbar
  },
  watch: {
    state: {
      handler(state: Record<string, any>) {
        if (!state) return

        this.footerBtns = this.footerBtns.map((btn: any) => {
          if (btn.visibleOnStateChange) {
            btn.visible = btn.visibleOnStateChange(state)
          }
          return btn
        })
      },
      deep: true,
      immediate: true
    },
    btns: {
      handler(btns: Array<NavBtnInterface>) {
        if (btns) this.footerBtns = [...btns]
      },
      deep: true,
      immediate: true
    }
  }
})
</script>