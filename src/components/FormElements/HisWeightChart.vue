<template>
    <view-port>
        <div class="view-port-content">
            <ion-row class='parent-row'>
                <ion-col size="7"> 
                    <ApexChart
                        :width="width"
                        :height="height"
                        :type="type"
                        :options="chartOptions"
                        :series="series"
                    />
                </ion-col>
                <ion-col size="5">
                    <ion-list >
                        <ion-item> 
                            <ion-label class='title'>Previous weight</ion-label>
                            <ion-chip slot="end" color="primary"> 
                                {{stats.prevWeight}}
                            </ion-chip>
                        </ion-item>
                        <ion-item> 
                            <ion-label class='title'>Lastest weight</ion-label>
                            <ion-chip slot="end" color="primary"> 
                                {{stats.curWeight}}
                            </ion-chip>
                        </ion-item>
                        <ion-item>
                            <ion-label class='title'>Latest weight change</ion-label>
                            <img v-show="stats.weightState" :src="stats.weightState" width="50"/>
                            <ion-chip slot="end" color="primary">
                                {{stats.curWeightChange}}
                            </ion-chip>
                        </ion-item>
                        <ion-item>
                            <ion-label class='title'>Patient Age</ion-label>
                            <ion-chip slot="end" color="primary"> 
                                {{ stats.age }}
                            </ion-chip>
                        </ion-item>
                        <ion-item> 
                            <ion-label class='title'>Patient BMI</ion-label>
                            <ion-chip slot="end" color="primary"> 
                                {{stats.bmi.index}}
                            </ion-chip>
                        </ion-item>
                        <ion-item> 
                            <ion-label :style="{'background-color': stats.bmi.color, color: 'white', padding:'10px', 'text-align': 'center'}"> 
                                {{stats.bmi.result}}
                            </ion-label>
                        </ion-item>
                    </ion-list>
                </ion-col>
            </ion-row>
        </div>
  </view-port>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ViewPort from "@/components/DataViews/ViewPort.vue"
import FieldMixinVue from './FieldMixin.vue'
import {
    IonCol,
    IonRow,
    IonItem,
    IonChip
} from "@ionic/vue"
import ApexChart from "vue3-apexcharts";

export default defineComponent({
   components: { 
        ApexChart,
        ViewPort,
        IonCol,
        IonRow,
        IonItem,
        IonChip 
    },
   mixins: [FieldMixinVue],
   data: () => ({
      stats: {
        prevWeight: '-' as string,
        curWeight: '-' as string,
        curWeightChange: '-' as string,
        weightState: '' as string,
        age: '-' as string,
        bmi: {} as any
      },
      type: 'area' as string,
      width: '100%' as string,
      height: '560px' as string,
      series: [] as Array<Record<string, any>>,
      chartOptions: {
        chart: {
          id: "weight_chart",
        },
        title: {
            text: 'Weight trail (2 year period)'
        },
        stroke: {
            curve: 'smooth',
        },
        yaxis: {
            title: { text: "Weight Kg(s)"},
            min: 0,
        },
        xaxis: {
            categories: []
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            formatter: function(firstY: any, opt: any): any {
                const secondY = opt.w.config.series[0].data[opt.dataPointIndex - 1]?.y
               
                if (secondY && secondY > 0) {
                    return (((firstY/secondY)*100)-100).toFixed(2)+' %' 
                }
                return '0.0%'
            } 
        }
      }
    }),
    mounted() {
        this.$emit('onFieldActivated', this)
    },
    activated(){
        this.$emit('onFieldActivated', this)
    },
    methods: {
        setStats(data: any) {
            const prevWeight =  data.values[data.values.length - 2]?.y || 0
            const curWeight = data.values[data.values.length - 1]?.y || 0
            this.stats.curWeight = curWeight || '-'
            this.stats.prevWeight = prevWeight || '-'
            this.stats.age = data.age
            this.stats.bmi = data.bmi

            if (curWeight > 0 && prevWeight > 0) {
                this.stats.curWeightChange = Math.abs((((curWeight/prevWeight)*100)-100)).toFixed(2) +' %'
                const increased = '/assets/images/drop-up-arrow.svg'
                const decreased = '/assets/images/drop-down-arrow.svg'
                this.stats.weightState = curWeight > prevWeight ? increased : decreased
            }
        }
    },
    async created() {
        const items = await this.options(this.fdata)
        const data = items[0].other
        const values = data.values
        this.series = [
            {
                name: 'Weight',
                data: values.sort((a: any, b: any) => {
                    const dateA: any = new Date(a.x)
                    const dateB: any = new Date(b.x)
                    return dateA - dateB
                }).map((item: any) => {
                    const [day, month] = item.x.split('/')
                    return {
                        x: `${day}.${month}`,
                        y: item.y
                    }
                })
            }
        ]
        this.type = data.type ? data.type : 'area'
        this.width = data.width ? data.width: '100%'
        this.setStats(data)
    }
  })
</script>
<style scoped>
    .view-port-content {
        background: white;
    }
    ion-col {
        border-right: #ccc solid 1px;
    }
    .title {
     font-weight: 500;   
    }
    .his-card {
        padding: 0px!important;
    }
</style>