<template>
    <div :class="`his-card ${state} clickable`">
        <img :src="icon"/> 
        <center> {{ label }} </center>
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
        image: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        state(): string {
            return this.isActive ? 'active-card-color' : 'disabled-card-color'
        },
        icon(): string {
            return `assets/images/${this.image}.png`;
        }
    }
})
</script>
<style scoped>
    img {
        width: 30px;
        height: 30px;
    }
    .his-card {
        color: black;
        padding: 0.4em;
        margin: 0.4em;
        text-align: center;
        font-weight: bold;
    }
</style>