<template>
    <action-header :title="title" :subtitle="subtitle" :color="color"></action-header>
    <ion-searchbar 
        v-if="canSearch"
        @click="toggleKeyboard"
        v-model="searchQuery"
        :debounce="50"
        class="ion-text-center"
        placeholder="Search..."
    />
    <ion-content class="ion-text-center">
          <ion-list>
            <ion-radio-group :value="activeLabel">
                <ion-item 
                    v-for="(label, index) in options" :key="index"
                    @click="onclick(label)"
                    class="his-md-text">
                    <ion-radio slot="start" :value="label"></ion-radio>
                    <ion-label>{{ label }} </ion-label>
                </ion-item>
            </ion-radio-group>
        </ion-list>
    </ion-content>
    <his-keyboard v-if="canSearch && showKeyboard" :kbConfig="keyboard" :onKeyPress="onVirtualKeyboard"/>
    <action-footer :buttons="buttons"> </action-footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ActionSheetMixin from "@/components/DataViews/actionsheet/ActionSheetMixin.vue"
import { NavBtnInterface } from '@/components/HisDynamicNavFooterInterface'
import { modalController } from '@ionic/vue';
import { toastWarning } from "@/utils/Alerts"
import { 
    IonLabel,
    IonList,
    IonItem,
    IonContent,
    IonRadio,
    IonRadioGroup,
    IonSearchbar
} from "@ionic/vue"
import Fuse from "fuse.js";
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"

export default defineComponent({
    components: { 
        IonList,
        IonLabel,
        IonItem,
        IonContent,
        IonRadio,
        HisKeyboard,
        IonRadioGroup,
        IonSearchbar
    },
    mixins: [ActionSheetMixin],
    data: () => ({
        keyboard: QWERTY,
        activeLabel: '' as string,
        searchQuery: '' as string,
        showKeyboard: false
    }),
    props: {
        list: {
            type: Array as PropType<string[]>,
            required: true
        }
    },
    methods: {
        onclick(label: string) {
            this.activeLabel = label
            this.showKeyboard = false
        },
        toggleKeyboard() {
          this.showKeyboard = this.showKeyboard ? false : true
        },
        onVirtualKeyboard(text: string) {
            this.searchQuery = handleVirtualInput(text, this.searchQuery)
        }
    },
    computed: {
        canSearch(): boolean {
            return this.list.length > 10
        },
        options(): string[] {
            if (this.searchQuery) {
                const fuse = new Fuse(this.list, {
                    threshold: 0.3, useExtendedSearch: true
                })
                return fuse.search(this.searchQuery).map((i: any) => i.item)
            }
            return this.list
        },
        buttons(): Array<NavBtnInterface> {
            return this.actionButtons.map((b: NavBtnInterface) => ({
                ...b,
                onClick: async () => {
                    if (b.role && b.role.match(/default/i)) {
                        return modalController.dismiss({ action: b.name })
                    }
                    if (b.role && b.role.match(/action/i) && !this.activeLabel) {
                        return toastWarning('Please select one of the options')
                    }
                    await modalController.dismiss({ 
                        selection: this.activeLabel, action: b.name 
                    })
                }
            }))
        }
    }
})
</script>

<style scoped>
.his-floating-keyboard{
    bottom: 75px;
}
ion-item {
    font-size: 20px;
}
action-header {
    padding-bottom: 2rem;
}
</style>
