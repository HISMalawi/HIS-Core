<template >
 <ion-card class="his-card">
    <center> 
      <ion-img :src="iconURL"></ion-img>
      <ion-card-header>
        <ion-card-title>{{name}}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <b class="his-md-text">{{details}}</b>
      </ion-card-content>
    </center>
  </ion-card> 
</template>

<script>
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonImg } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['name', 'details', 'programID', 'iconURL'],
  components: { IonCard, IonCardContent, IonCardTitle,  IonCardHeader, IonImg },
});
</script>
<style scoped>
.his-md-text{
  font-weight: bold;
}
.his-card {
  padding: 0.6em;
  height: 35vh;
  overflow: 'hidden';
}
ion-img {
  width: 120px;
  height: 90px;
}
</style>