<template>
  <div class="his-floating-keyboard">
    <div class="his-floating-keyboard-content">
      <div v-for="(layout, index) in activeLayout" :key="index">
        <base-keyboard :layout="layout" :onKeyPress="keypress" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { KEY_BTN_NAV } from "@/components/Keyboard/HisKbConfigurations"
import BaseKeyboard from "@/components/Keyboard/BaseKeyboard.vue";
export default defineComponent({
  components: { BaseKeyboard},
  props: {
    initalKeyboardName: {
      type: String
    },
    kbConfig: {
      type: Array,
      required: true
    },
    onKeyPress: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    activeLayout: {} as Array<any>
  }),
  watch: {
    initalKeyboardName: {
      handler(name: string) {
        if (name) {
          this.$nextTick(() => this.switchKeyboard(name))
        }
      },
      immediate: true
    },
    kbConfig: {
      handler(keyboard: Array<any>){
        if(keyboard) {
          this.activeLayout = keyboard
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    keypress(key: any) {
      if (!this.isFunctionKey(key)) {
        this.onKeyPress(key);
      }
    },
    isFunctionKey(key: string) {  
      if (this.switchKeyboard(key)) {
        return true
      }
      return false
    },
    switchKeyboard(key: string): boolean {
      const kbIndex = KEY_BTN_NAV.map(item => item.btn).indexOf(key)
      if (kbIndex >= 0) {
        this.activeLayout = KEY_BTN_NAV[kbIndex].keyboard
        return true
      }
      return false
    }
  },
});
</script>