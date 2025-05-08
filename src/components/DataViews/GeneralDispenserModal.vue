<template>
  <ion-content>
    <ion-grid>
      <ion-row>
        <ion-col size="5">
          <div class="" style="border: .1rem solid #c2c2c2c2;">
            <ion-input
              type="text"
              class='keypad-input'
              :value="amount"
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
        <ion-col size="7">
          <ion-list>
            <ion-item>
              <ion-label><b>Medication: </b> {{drugName }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-label><b>Amount needed: </b>{{ amountNeeded }}</ion-label>
            </ion-item>
            <ion-item>
              <ion-label><b>Amount Dispensed: </b>{{ amount.length ? amount : 0 }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
  <ion-footer>
    <ion-toolbar>
      <ion-button @click="onClose" color="danger" size="large" slot="start"> Close </ion-button>
      <ion-button 
        @click="onDispense(amount)" 
        :disabled="amount.length <= 0"
        color="success" 
        size="large" 
        slot="end"> 
        Dispense 
      </ion-button>
    </ion-toolbar>
  </ion-footer>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { modalController } from "@ionic/vue"
import { DRUG_DISPENSER_KEYPAD } from '../Keyboard/KbLayouts'

export default defineComponent({
  data: () => ({
    amount: "",
    keyboard: DRUG_DISPENSER_KEYPAD,
  }),
  props: {
    drugName: {
      type: String,
      required: true 
    },
    amountNeeded: {
      type: String,
      required: true
    },
    onDispense: {
      type: Function,
      required: true
    }
  },
  methods: {
    async onKeyPress(key: any) {
      const currentValue = this.amount;
      if (key.match(/del/i)) {
        this.amount = currentValue.substring(
          0,
          currentValue.length - 1
        );
      } else if (key.match(/clear/i)) {
        this.amount = "";
      } else if (key.match(/close/i)) {
        this.onClose();
      } else if (key.match(/reset/i)) {
        this.amount = "";
      } else if (key.match(/dispense/i)) {
        if (this.amount) this.onDispense(this.amount);
        this.onClose()
      } else {
        this.amount += key;
      }
    },
    async onClose() {
      await modalController.dismiss({})
    },
  }
})
</script>

<style scoped>
  table {
    width: 98%;
    margin: auto;
  }
  table, td, th {
      text-align: center;
      vertical-align: middle;
  }
  td {
      height: 100px;
  }
  .btn-list {
      list-style: none;
      margin: 0;
      padding: 0;
  }
  .dispense-btn {
      width: 60px;
  }
  .input-field {
      font-weight: bold;
      font-size: 1.3em;
      background-color: rgb(248, 248, 167);
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