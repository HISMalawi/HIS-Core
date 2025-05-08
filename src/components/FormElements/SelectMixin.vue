<script lang='ts'>
import { defineComponent } from 'vue'
import HisKeyboard from "@/components/Keyboard/HisKeyboard.vue"
import handleVirtualInput from "@/components/Keyboard/KbHandler"
import HisTextInput from "@/components/FormElements/BaseTextInput.vue";
import { FooterBtnEvent, Option } from '../Forms/FieldInterface'
import { QWERTY } from "@/components/Keyboard/HisKbConfigurations"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue';
import {
    IonList, 
    IonItem, 
    IonLabel, 
    IonGrid, 
    IonRow, 
    IonCol,
    IonInfiniteScroll, 
    IonInfiniteScrollContent, 
    IonContent
} from "@ionic/vue"
import { find, isPlainObject } from 'lodash';

type InfiniteScrollHandler = (filter: string, page: number, limit: number) => Promise<Array<Option>>

export default defineComponent({
    components: { 
        IonList, 
        IonItem, 
        IonLabel, 
        HisTextInput, 
        HisKeyboard, 
        ViewPort, 
        IonGrid, 
        IonRow, 
        IonCol, 
        IonInfiniteScroll, 
        IonInfiniteScrollContent, 
        IonContent 
    },
    mixins: [FieldMixinVue],
    data: () => ({ 
        showKeyboard: false,
        selected: '',
        filter: '',
        filtered: [] as any,
        keyboard: QWERTY,
        listData: [] as Array<Option>,
        infiniteScroll: {
            enabled: false,
            page: 1,
            limit: 10,
            threshold: '100px',
            handler: undefined as undefined | InfiniteScrollHandler
        },
    }),
    created(){
        this.showKeyboard = this.config?.showKeyboard === true
        this.infiniteScroll.enabled = this.config?.infiniteScroll?.enabled === true
        this.infiniteScroll.page = this.config?.infiniteScroll?.page || 1
        this.infiniteScroll.limit = this.config?.infiniteScroll?.limit || 10
        this.infiniteScroll.threshold = this.config?.infiniteScroll?.threshold || '100px'
        this.infiniteScroll.handler = this.config?.infiniteScroll?.handler 
    },
    watch: {
        footerButtonEvent : {
            handler(event: FooterBtnEvent) {
                if (isPlainObject(event.onClickComponentEvents)) {
                    const e: any = event?.onClickComponentEvents || {}
                    if (e  && typeof e.setValue === 'function') {
                        const value = e.setValue(event)
                        if (typeof value === 'string') {
                            this.filter = value
                            this.selected = value
                        }
                    }
                }
            },
            deep: true
        },
        listData: {
            handler(data: any) { if (data) this.filtered = data },
            deep: true,
            immediate: true
        },
        filter: {
            async handler(filter: string) {
                // restore initial list data if filter used is empty
                if (!filter) {
                    this.filtered = this.listData
                    return
                }
                /** Filter data from an external source  if config is true*/
                if (this.config?.isFilterDataViaApi) {
                    this.filtered = await this.options(this.fdata, filter)
                    // Find and select data that matches selected value
                    if (this.selected === this.filter) {
                        const foundOption = find(this.filtered, { label: this.filter})
                        if (foundOption) {
                            this.$emit('onValue', foundOption)
                        }
                    }
                    return
                }
                /** Reset page if infinite scroll is enabled */
                if(this.infiniteScroll.enabled) {
                    this.infiniteScroll.page = 1
                }
                // Filter locallist
                this.filtered = this.listData.filter(item => this.isMatch(item.label, this.filter))

            },
            immediate: true
        },
    },
    methods: {
        isMatch(itemA: string, itemB: string){
            return itemA.match(new RegExp(itemB, 'i')) 
        },
        clearSelection() {
            this.filter = ''
            this.selected = ''
        },
        onKbValue(text: any, filtered = true) {
            // check if a selected item from list matches keyboard input. 
            // We dont want selected options to filter anything
            if (!filtered || this.selected === text) return

            this.filter = text
            this.selected = this.filter
        },
        keypress(text: any){
            if (!this.filter) this.selected = ''
            this.filter = handleVirtualInput(text, this.selected)
            this.selected = this.filter
        },
        async pushData(evt: any) {
            if(this.infiniteScroll.enabled && typeof this.infiniteScroll.handler === 'function') {
                this.infiniteScroll.page++
                const items: Option[] = await this.infiniteScroll.handler(this.filter, this.infiniteScroll.page, this.infiniteScroll.limit)
                this.listData.push(...items)
            }
            evt.target.complete()
        }
    }
})
</script>

<style scoped>
ion-content {
  --offset-bottom: auto !important;
  --overflow: hidden;
  overflow: auto;
}
</style>