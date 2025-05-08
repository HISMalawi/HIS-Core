<template>
  <ApexChart
    width="99%"
    height="350px"
    type="area" 
    :options="options" 
    :series="series"
    />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import ApexChart from "vue3-apexcharts";

export default defineComponent({
  components: {
    ApexChart
  },
  props: {
    categories: Array,
    series: Array
  },
  setup(props) {
    const options = ref({
      chart: {
        height: 'auto',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        toolbar: {
          show: false
        }
      },
      title: {
        text: 'Influenza Like Illness , Respiratory',
        margin: 20,
        align: 'center',
        style: {
          fontWeight: 'regular'
        }
      },
      subtitle: {
        text: 'For the past 12 months',
        align: 'center',
        margin: 10,
      },
      xaxis: {
        categories: props.categories
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Number of clients'
        }
      },
      noData: {  
        text: "Loading data. Please wait...",  
        align: 'center',  
        verticalAlign: 'middle',  
        offsetX: 0,  
        offsetY: 0,  
        style: {  
          color: "#000000",  
          fontSize: '30px',  
          fontFamily: "Helvetica"
        }  
      }
    })

    return {
      options,
    }
  }
});
</script>
