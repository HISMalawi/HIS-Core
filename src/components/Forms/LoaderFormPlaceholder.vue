<template>
    <view-port> 
        <div class="linear-background">
            <div class="inter-draw"></div>
            <div class="inter-crop"></div>
            <div class="inter-right--top"></div>
            <div class="inter-right--bottom"></div>
        </div>
    </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
export default defineComponent({
    components: {
        ViewPort
    }
})
</script>
<style scoped>
@keyframes placeHolderShimmer{
    0%{
        background-position: -468px 0
    }
    100%{
        background-position: 468px 0
    }
}

.linear-background {
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
    background-size: 1000px 104px;
    height: 10vh;
    position: relative;
    overflow: hidden;
}
.inter-draw{
  background: #FFF;
  width: 100%;
  height: 100px;
  position: absolute;
  top: 100px;
}
.inter-right--top{
  background: #FFF;
  width: 100%;
  height: 20px;
  position: absolute;
  top: 20px;
  left: 100px;
}
.inter-right--bottom{
  background: #FFF;
  width: 100%;
  height: 50px;
  position: absolute;
  top: 60px;
  left: 100px;
}
.inter-crop{
  background: #FFF;
  width: 20px;
  height: 100%;
  position: absolute;
  top: 0;
  left: 100px;
}
</style>