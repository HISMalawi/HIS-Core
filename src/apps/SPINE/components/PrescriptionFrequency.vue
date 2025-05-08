<template>
     <div class="freq-content">
            <center style="padding-top: 12px;">
                <snap> Frequency </snap>
            </center>
        <ion-list>
            <ion-radio-group :value="activeLabel">
                <ion-item class="his-md-text" v-for="(label, index) in list"  :key="index" @click="frequencyKeypress(label)">
                    <ion-radio slot="start" :value="label"></ion-radio>
                    <ion-label>{{ label }} </ion-label>
                </ion-item>
            </ion-radio-group>
        </ion-list>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { 
    IonList, 
    IonItem,
    IonRadio,
    IonRadioGroup
} from "@ionic/vue"


export default defineComponent({
    components: { 
        IonList, 
        IonItem,
        IonRadio,
        IonRadioGroup 
    },
    data: () => ({
        activeLabel: '' as string
    }),
    props: {
        list: {
            type: Object as PropType<string[]>,
            required: true
        },
        label: String
    },
    methods: {
        async frequencyKeypress(label: any){
            this.$emit("frequencyKeypress", label)
        }
    }
})
</script>
<style scoped>
ion-item {
    font-size: 20px;
}
action-header {
    padding-bottom: 2rem;
}
.freq-content{
    float: left;
    border: solid 1px gray;
    height: 62vh;
    overflow: scroll;
    width:40%;
}
snap{
  color: #333333;
font-weight: 700;
font-family: "Nimbus Sans L", "Arial Narrow", sans-serif;
font-size: 20px;
}
</style>
