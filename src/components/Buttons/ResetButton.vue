<template>
    <div :class="state">
        <center>
            <img :src="icon"/>
        </center>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props : {
        label: {
            type: String,
            required: true
        },
        disabled: {
            type: Boolean
        }
    },
    computed: {
        state(): string {
            return this.disabled ? 'disabled-btn' : 'clickable'
        },
        icon(): string {
            return `assets/images/reset.png`;
        }
    }
})
</script>
<style scoped>
    img {
        width: 40px;
    }
</style>