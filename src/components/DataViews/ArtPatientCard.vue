<template>
    <div class="his-card clickable"
        :class="stateClass"
        > 
        <li>
            <ul> NPID : <b>{{patient.npid}}</b></ul>
            <ul> Arv# : <b>{{patient.arvNum}}</b></ul>
            <ul> Name : <b>{{patient.name}}</b></ul>
            <ul> Birth date : <b>{{patient.birthdate}}</b></ul>
            <ul> Gender : <b>{{patient.gender}}</b></ul>
            <ul> Home District : <b>{{patient.homeDistrict}}</b></ul>
            <ul> Home Village : <b>{{patient.homeVillage}}</b></ul>
            <ul> Current District : <b>{{patient.currentDistrict}}</b></ul>
            <ul> Current Village : <b>{{patient.currentVillage}}</b></ul>

        </li>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        patient: {
            type: Object,
            required: true
        },
        isActive: {
            type: Boolean
        }
    },
    computed: {
        stateClass(): any {
            return {
                'active-card-color': this.isActive,
                'inactive-card-color': !this.isActive
            }
        }
    }
})
</script>
<style scoped>
    .his-card {
        padding: 0;
        margin: 3%;
    }
    li {
        padding: 0;
        margin: 0;
        list-style: none;
    }
</style>