<template>
  <div class="center">
    <p class="text vertically-align his-lg-text" style="text-align: center;">
      <span v-html="value"></span>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FieldMixinVue from "./FieldMixin.vue";

export default defineComponent({
  mixins: [FieldMixinVue],
  data: () => ({
    value: "",
  }),
  methods: {
    async init() {
      this.$emit("onFieldActivated", this);
      const data = await this.options(this.fdata, this.cdata);
      this.value = data[0].value;
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  }
})
</script>