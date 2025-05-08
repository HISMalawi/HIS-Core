<template>
  <div id="inputs-container">
      <ion-grid class="main-table">
        <ion-row>
            <ion-col size-md="12" id="keyboard-elements">
               <ion-grid class="keyboard-table" ref="keyboardElements">
                  <ion-row>
                    <ion-col><ion-button @click="keyPress('1')" class="keyboard-btn" id="btn-1" color="primary">1</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('2')" class="keyboard-btn" id="btn-2" color="primary">2</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('3')" class="keyboard-btn" id="btn-3" color="primary">3</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('4')" class="keyboard-btn" id="btn-4" color="primary">4</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('5')" class="keyboard-btn" id="btn-5" color="primary">5</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('6')" class="keyboard-btn" id="btn-6" color="primary">6</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('7')" class="keyboard-btn" id="btn-7" color="primary">7</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('8')" class="keyboard-btn" id="btn-8" color="primary">8</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('9')" class="keyboard-btn" id="btn-9" color="primary">9</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('0')" class="keyboard-btn" id="btn-0" color="primary">0</ion-button></ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col><ion-button @click="keyPress('Q')" class="keyboard-btn" id="btn-Q" color="primary">Q</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('W')" class="keyboard-btn" id="btn-W" color="primary">W</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('E')" class="keyboard-btn" id="btn-E" color="primary">E</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('R')" class="keyboard-btn" id="btn-R" color="primary">R</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('T')" class="keyboard-btn" id="btn-T" color="primary">T</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('Y')" class="keyboard-btn" id="btn-Y" color="primary">Y</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('U')" class="keyboard-btn" id="btn-U" color="primary">U</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('I')" class="keyboard-btn" id="btn-I" color="primary">I</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('O')" class="keyboard-btn" id="btn-O" color="primary">O</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('P')" class="keyboard-btn" id="btn-P" color="primary">P</ion-button></ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col><ion-button @click="keyPress('Caps')" class="keyboard-btn" id="btn-A" color="primary">Caps</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('A')" class="keyboard-btn" id="btn-A" color="primary">A</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('S')" class="keyboard-btn" id="btn-S" color="primary">S</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('D')" class="keyboard-btn" id="btn-D" color="primary">D</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('F')" class="keyboard-btn" id="btn-F" color="primary">F</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('G')" class="keyboard-btn" id="btn-G" color="primary">G</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('H')" class="keyboard-btn" id="btn-H" color="primary">H</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('J')" class="keyboard-btn" id="btn-J" color="primary">J</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('K')" class="keyboard-btn" id="btn-K" color="primary">K</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('L')" class="keyboard-btn" id="btn-L" color="primary">L</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('Del')" class="keyboard-btn" id="btn-backspace" color="primary">Del</ion-button></ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col><ion-button @click="keyPress('Z')" class="keyboard-btn" id="btn-A" color="primary">Z</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('X')" class="keyboard-btn" id="btn-S" color="primary">X</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('C')" class="keyboard-btn" id="btn-D" color="primary">C</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('V')" class="keyboard-btn" id="btn-F" color="primary">V</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('B')" class="keyboard-btn" id="btn-G" color="primary">B</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('N')" class="keyboard-btn" id="btn-H" color="primary">N</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('M')" class="keyboard-btn" id="btn-J" color="primary">M</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('<')" class="keyboard-btn" id="btn-backspace" color="primary">&gt;</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('.')" class="keyboard-btn" id="btn-backspace" color="primary">.</ion-button></ion-col>
                    <ion-col><ion-button @click="keyPress('>')" class="keyboard-btn" id="btn-backspace" color="primary">&lt;</ion-button></ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col><ion-button @click="keyPress('Space')" class="keyboard-btn" id="btn-backspace" color="primary">Space</ion-button></ion-col>
                  </ion-row>
               </ion-grid>
            </ion-col>
        </ion-row>
      </ion-grid>

  </div>

</template>


<script>
//import { toastController } from '@ionic/vue';
import { defineComponent } from 'vue';



export default defineComponent({
  props: ["onKeyPress"],
  name: 'InputSearchResult',
  components: {

  },
  data() {
    return {
      keyboardPressedKeys: ""
    }
  },
  methods: {
      keyPress(key) {
        const text = this.keyboardPressedKeys;
        try {
          if(key.match(/Del/i)){
            this.keyboardPressedKeys = text.substring(0, text.length - 1);
          }else if(key.match(/Space/i)){
            this.keyboardPressedKeys += " ";
          }else if(key.match(/Caps/i)){
            console.log(key);
          }else{
            this.keyboardPressedKeys += key;
          }
        }catch(e){
          this.keyboardPressedKeys = text;
        }
        
        this.onKeyPress(this.keyboardPressedKeys);
      }
  },
  mounted(){
    this.keyPress(this.keyboardPressedKeys);
  }



});


</Script>

<style scoped>
#keyboard-elements {
  border-style: solid;
  border-width: 1px;
  border-radius: 9px;
  height: 36vh;
}

#keyboard-table {
  width: 100%;
}

.keyboard-btn {
  width: 75%;
}

 @media only screen and (max-width: 900px) {
   .keyboard-btn {
     width: 1%;
   }
 }


</style>