<template>
  <view-port>
    <div class="view-port-content">
      <ion-grid>
        <ion-row v-if="vitalsStatus" class="mobile-component-view" :style="{width: '100%', 'background-color': vitalsStatus.color, color: 'white', padding:'10px', textAlign: 'center'}"> 
          {{ vitalsStatus.status }}
          <p/>
        </ion-row>
        <ion-row>
          <ion-col size="2">
            <option-button
              class="his-sm-text"
              v-for="(key, bIndex) in keys"
              :key="bIndex"
              :label="key.label"
              :isActive="activeField === bIndex"
              :image="'vitals/'+key.other.icon"
              @click="setActiveField(bIndex)"
              v-show="key.other.visible !== false"
            >
            </option-button>
          </ion-col>
          <ion-col size-lg="6" size-sm="10">
            <div class="centered his-card">
              <ion-input
                type="text"
                class='keypad-input'
                v-if="keys.length > 0"
                v-model="keys[activeField].value"
                :readonly="activePlatformProfile.keyboard === 'HIS_KEYBOARD_ONLY'"
              />
              <table class="keypad">
                <tr v-for="(row, rowIndex) in keyboard" :key="rowIndex">
                  <td class='his-keyboard-margin' v-for="(btnKey, btnIndex) in row" :key="`btn-${btnIndex}`">
                    <ion-button color="primary" class="his-keyboard-btn" @click="onKeyPress(btnKey)">
                      {{ btnKey }}
                    </ion-button>
                  </td>
                </tr>
              </table>
            </div>
          </ion-col>
          <ion-col class="full-component-view" size="4">
            <ion-list> 
              <ion-item
                class="his-sm-text"
                v-for="(key, rIndex) in keys" 
                :key="rIndex"
                :color="activeField === rIndex ? 'secondary': ''">
                <ion-label><b>{{ key.label }}</b></ion-label>
                <ion-label slot="end">
                  <span class='value-highlight'>
                    {{ key.value || '-' }}
                  </span> 
                  {{ key.other.modifier }} 
                </ion-label>
              </ion-item>
              <ion-item v-if="vitalsStatus && vitalsStatus.value">
                <ion-label>
                  <b>{{ vitalsStatus.label }}</b>
                </ion-label>
                <ion-label slot="end">
                  <span class='value-highlight'>
                    {{ vitalsStatus.value }}
                  </span>
                </ion-label>
              </ion-item>
              <ion-item> 
                  <ion-label v-if="vitalsStatus" :style="{'background-color': vitalsStatus.color, color: 'white', padding:'10px', 'text-align': 'center'}"> 
                    {{ vitalsStatus.status }}
                  </ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </view-port>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ViewPort from "../DataViews/ViewPort.vue";
import {
  IonGrid,
  IonCol,
  IonRow,
  IonInput
} from "@ionic/vue";
import { VITALS_KEYPAD } from "../Keyboard/KbLayouts";
import OptionButton from "@/components/Buttons/ActionSideButton.vue"
import FieldMixinVue from "./FieldMixin.vue";
import { toastWarning } from "@/utils/Alerts";
import { Option } from "../Forms/FieldInterface";
import Img from "@/utils/Img"
import { isPlainObject } from "lodash";
import usePlatform from "@/composables/usePlatform";
export default defineComponent({
  components: {
    ViewPort,
    IonInput,
    IonGrid,
    IonCol,
    IonRow,
    OptionButton
  },
  mixins: [FieldMixinVue],
  data: () => ({
    keys: [] as Option[],
    vitalsStatus: {} as Record<string, any>,
    activeField: 0,
    keyboard: VITALS_KEYPAD,
  }),
  setup() {
    const  { activePlatformProfile } = usePlatform()
    return {
      activePlatformProfile
    }
  },
  activated(){
    this.$emit('onFieldActivated', this)
  },
  watch: {
    keys: {
      async handler(params) {
        this.$emit("onValue", params);
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    this.$emit('onFieldActivated', this)
    this.keys = await this.options(this.fdata);
  },
  methods: {
    img(name: string) {
      return Img(`vitals/${name}.png`);
    },
    async onKeyPress(key: any) {
      const currentValue = this.keys[this.activeField].value.toString();
      if (key.match(/del/i)) {
        this.keys[this.activeField].value = currentValue.substring(
          0,
          currentValue.length - 1
        );
      } else if (key.match(/clear/i)) {
        this.keys[this.activeField].value = "";
      } else {
        this.keys[this.activeField].value += key;
      }
      if (typeof this.config.onUpdateAlertStatus === 'function') {
        const statusUpdate = await this.config.onUpdateAlertStatus(this.keys)
        if (isPlainObject(statusUpdate) && Object.keys(statusUpdate).includes('status')) {
          this.vitalsStatus = statusUpdate || null
        }
      }
    },
    async setActiveField(index: number) {
      if (typeof this.config.onChangeOption === 'function') {
        try {
          await this.config.onChangeOption(this.keys[this.activeField])
          this.activeField = index
        } catch (e) {
          toastWarning(`${e}`)
        }
      }
    }
  }
});
</script>
<style scoped>
.full-component-view {
  display: block;
}
.mobile-component-view {
  display: none;
}

@media (max-width:990px) {
  .full-component-view {
      display: none;
  }
  .mobile-component-view {
      display: block;
  }
}
.view-port-content {
  height: 100%;
  background: white;
} 
.value-highlight {
  color: green;
  font-weight: bold;
}
ion-col {
  border-right: #ccc solid 1px;
}
.keypad {
  margin: auto;
}
.centered {
  width: 90%;
  background: #f4f4f4;
  padding: 1.2em;
  margin: auto;
}
.his-keyboard-btn {
  width: 110px;
  font-size: 1.4em;
  height: 70px;
}
.keypad-input {
  border: solid 1px #ccc;
  background: white;
  border-radius: 10px;
  width: 92%;
  height: 100px;
  margin: auto;
  text-align: center;
  font-size: 3em;
  margin: 15px;
}
</style>