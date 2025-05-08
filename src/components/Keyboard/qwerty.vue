<template>
<div class="kbd-container" :style="{top: getPosition}">
<div class="wrapper">

  <div class="kbd-row">
    <span v-for='(letter,index) in alphabet.top' :key="index" :class="'kbd-button'" @click="pressedLetter(letter)">
      {{letter}}
    </span>
  </div>
  <div class="kbd-row">
    <span v-for='(letter,index) in alphabet.middle' :key="index" :class="'kbd-button'" @click="pressedLetter(letter)">
      {{letter}}
    </span>
  </div>
  <div class="kbd-row">
    <span v-for='(letter,index) in alphabet.bottom' :key="index" :class="'kbd-button'" @click="pressedLetter(letter)">
      {{letter}}
    </span>
  </div> 
  <div class="kbd-row">
    <span v-for='(letter,index) in alphabet.spaceRow' :key="index" :class="'kbd-button'" @click="pressedLetter(letter)">
      {{letter}}
    </span>
  </div>
</div>
</div>
</template>

<script>
export default {
emits: [
    'inputChar', 'customEvent', 'nextEvent'
],
// props: ['val', 'custom'],
props: {
  val: String,
  custom:  Object, 
  position: Number
},
  data(){
    return{
      input: '',
      alphabet: {
        top: ['Q','W','E','R','T','Y','U','I','O','P', 'del'],
        middle: ['A','S','D','F','G','H','J','K','L'],
        bottom: ['next','Z','X','C','V','B','N','M'],
        spaceRow: ['space']
      },
      sto : {
        top: "500px"
      }

    }
  },
  methods:{
    pressedLetter(letter){
        let currentValue = '';
      if(letter.match(/del/gi)) {
       currentValue = this.val.slice(0, -1);    
      }else if(letter.match(/space/gi)) {

        this.$emit('inputChar', currentValue);
      }
      else if(letter.match(/next/gi)) {
        this.$emit('nextEvent', currentValue);
      }
      else {
       currentValue = (this.val + letter);
      }
      if(this.custom && letter.match(this.custom.name) && this.custom.action) {
        this.$emit(this.custom.action, currentValue);
      }else {
        this.$emit('inputChar', currentValue);
      }
    }
  },
  mounted() {
    // Object.has
    if(this.custom) {
      this.alphabet.bottom.push(this.custom.name);
    }
    
  },
  computed: {
    getPosition(){
      return this.position + 80 + "px"
    },
    keyboardClass(){
      
      return {};
    }
  }

}
</script>

<style>
/* @import './keyboard.css'; */
.kbd-container{
  margin: auto;
  border: solid 1px black;
  position: fixed;
  z-index: 222200;

}
.wrapper{
  min-width: 750px;
  max-width: 1000px;
  padding: 25px;
  border-radius: 10px;
  background-color: white;
  box-shadow: -3px -3px 7px #ffffff73,
               2px 2px 5px rgba(94,104,121,0.288);
}
.kbd-row{
  display: flex;
  justify-content: center;
}
.kbd-button{
   height: 45px;
    width: 6%;
    max-width: 90px;
    margin: 3px;
    border-radius: 5px;
    background: rgba(250, 250, 250, 0.2);
    background-color: rgb(243, 243, 243);
    border: 2px solid black;
    font-size: 1.05rem;
    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* padding: 0; */
    /* -webkit-tap-highlight-color: transparent; */
    /* position: relative; */
}
.wrapper .keys input[value="SPACE"]{
  width: 60%;
}
</style>