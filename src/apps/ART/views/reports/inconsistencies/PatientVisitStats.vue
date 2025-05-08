<template>
    <his-standard-form
        v-if="!canShowReport"
        @onFinish="onPeriod"
        :skipSummary="true" 
        :fields="fields">
    </his-standard-form>
    <ion-page v-if="canShowReport"> 
        <ion-header> 
            <ion-toolbar> 
                <ion-title> 
                    Total Attendance: <a href="#" @click.prevent="() => drillPatients('Total attendance', totalAttendance)">
                        {{ totalAttendance.length }}
                    </a><br/> 
                    Patient visit: <a href="#" @click.prevent="() => drillPatients('Total patient visits', totalPatientVisits)">
                        {{ totalPatientVisits.length }}
                    </a><br/> 
                    Guardian visit: <a href="#" @click.prevent="() => drillPatients('Guardian visits', totalGuardianVisits)">
                        {{ totalGuardianVisits.length }}
                    </a>
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content> 
            <view-port> 
                <div class="view-port-content"> 
                    <ApexChart
                        :width="width"
                        :height="height"
                        :type="chartType"
                        :options="chartOptions"
                        :series="series"
                        @markerClick="onPointSelection"
                    />
                </div>
            </view-port>
        </ion-content>
        <ion-footer> 
            <ion-toolbar color="dark">
                <ion-button @click="canShowReport = false" slot="start" size="large">
                    New Date
                </ion-button>
                <ion-button slot="end" size="large" router-link="/" color="success">
                    Finish
                </ion-button>
            </ion-toolbar>
        </ion-footer>
    </ion-page>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import {
    IonPage,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonFooter,
    IonButton,
    loadingController,
modalController
} from "@ionic/vue"
import ViewPort from "@/components/DataViews/ViewPort.vue"
import { PatientReportService } from "@/apps/ART/services/reports/patient_report_service"
import HisStandardForm from "@/components/Forms/HisStandardForm.vue";
import ReportMixin from "@/apps/ART/views/reports/ReportMixin.vue"
import { uniq } from 'lodash';
import ApexChart from "vue3-apexcharts";
import table from "@/components/DataViews/tables/ReportDataTable"
import { Patientservice } from '@/services/patient_service';

export default defineComponent({
    components: {
        ApexChart,
        IonPage,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonContent,
        IonFooter,
        IonButton,
        ViewPort,
        HisStandardForm
    },
    mixins: [ReportMixin],
    data: () => ({
        patients: {} as Record<string|number, Patientservice>,
        reportData: {} as Record<string, any>,
        chartType: 'area',
        height: '100%',
        width: '100%',
        canShowReport: false,
        report: {} as any,
        series: [] as any,
        patientPresent: {} as any,
        guardianPresent: {} as any,
        bothPresent: {} as any,
        chartOptions: {
            title : {
                text: "HIV Reception encounters"
            },
            yaxis: {
                title: { 
                    text: "Number of clients"
                },
                plotAreaHeight: 800,
            },
            xaxis: {
                type: 'datetime'
            },
            markers: {
                size: 8,
                hover: {
                    sizeOffset: 3
                }
            }
        } as any
    }),
    created() {
        this.fields = this.getDateDurationFields()
    },
    computed: {
        totalAttendance(): number[] {
            let totals: any = []
            Object.keys(this.reportData).forEach((date: string) => {
                totals = totals.concat(Object.keys(this.reportData[date])
                    .map(p => ({ patient_id: p, date})))
            })
            return totals
        },
        totalPatientVisits(): any {
            return Object.keys(this.patientPresent)
                .reduce((a: any, k: string) => {
                    return a.concat(this.patientPresent[k]
                        .map((p: number) => ({ patient_id: p, date: k })))
                }, [])
        },
        totalGuardianVisits(): any {
            return Object.keys(this.guardianPresent)
                .reduce((a: any, k: string) => {
                    return a.concat(this.guardianPresent[k]
                        .map((p: number) => ({ patient_id: p, date: k })))
                }, [])
        }
    },
    methods: {
        async onPeriod(_: any, conf: any) {
            await this.presentLoading()
            this.reportData = {}
            this.canShowReport = true
            this.patientPresent = {}
            this.guardianPresent = {}
            this.report = new PatientReportService()
            this.report.setStartDate(conf.start_date)
            this.report.setEndDate(conf.end_date)
            this.reportData = await this.report.getPatientVisitTypes()
            this.series = this.buildSeries(this.reportData)
            loadingController.dismiss()
        },
        async presentLoading() {
            (await loadingController.create({
                message: 'Please wait...',
                backdropDismiss: false
            })).present()
        },
        async getCachedPatient(patiendId: number) {
            if(!(patiendId in this.patients)) {
                const patient = await Patientservice.findByID(patiendId);
                this.patients[patiendId] = new Patientservice(patient);
            }
            return this.patients[patiendId];
        },
        async drillPatients(title: string, patients: any[]) {
            const columns = [
                [
                    table.thTxt('ARV Number'),
                    table.thTxt('First name'),
                    table.thTxt('Last name'),
                    table.thTxt('Gender'),
                    table.thTxt('Visit date'),
                    table.thTxt('Action')
                ]
            ]
            const rowParser = async (row: any) => {
                const data = row.map(async (col: any) => {
                    const patient = await this.getCachedPatient(col.patient_id);
                    try {
                        return [
                            this.tdARV(patient.getArvNumber()),
                            table.td(patient.getGivenName()),
                            table.td(patient.getFamilyName()),
                            table.td(this.formatGender(patient.getGender())),
                            table.tdDate(col.date),
                            table.tdBtn('Show', async () => {
                                await modalController.dismiss({})
                                this.$router.push({ path: `/patient/dashboard/${col.patient_id}`})
                            })
                        ]
                    } catch (e) {
                        return [
                            table.td('N/A'),
                            table.td('N/A'),
                            table.td('N/A'),
                            table.td('N/A'),
                            table.td('N/A'),
                            table.tdBtn('Show', async () => {
                                await modalController.dismiss({})
                                this.$router.push({ path: `/patient/dashboard/${col.patient_id}`})
                            })
                        ]
                    }
                })
                return Promise.all(data)
            }
            this.drilldownData(title, columns, patients, rowParser)
        },
        onPointSelection(e: any, c: any, { dataPointIndex, seriesIndex }: any) {
            try {
                const sIndex = seriesIndex <= 0 ? 0 : seriesIndex
                const dates: any = this.series[sIndex].data[dataPointIndex]
                const patients: any = this.series[sIndex].raw[dataPointIndex]
                const drillData = Array.from({ length: patients.length }, (k, i) => {
                    return { patient_id: patients[i], date: new Date(dates[0]).toISOString() }
                })
                this.drillPatients('Point selection', drillData)
            } catch (e) {
                console.log('Error loading point selection data')
            }
        },
        buildSeries(data: any) {
            const visitDates: string[] = uniq(Object.keys(data))
            const setValueGroup = (
                date: string,
                group: Record<string, any>,
                comparator: any) => {

                if (!(date in group)) group[date] = []

                const values = Object.entries(data[date])
                    .filter(([, v]: any) => comparator(
                        v.patient_present,
                        v.guardian_present
                    ))
                    .map(([patient]) => patient)

                group[date] = [...group[date], ...values]
                return group
            }

            const sortSeries = (valueGroup: any) => {
                return visitDates.map((date: string) => [
                    new Date(date).getTime(), 
                    valueGroup[date].length
                ])
            }

            const sortData = (valueGroup: any) => visitDates.map((date: string) => valueGroup[date])
    
            for(const date in data) {
                setValueGroup(date, this.patientPresent, (patient: any, guardian: any) => {
                    return patient && !guardian
                })
                setValueGroup(date, this.guardianPresent, (patient: any, guardian: any) => {
                    return !patient && guardian
                })
                setValueGroup(date, this.bothPresent, (patient: any, guardian: any) => {
                    return patient && guardian
                })
            }
            return [
                {
                    name: 'Patient present',
                    raw: sortData(this.patientPresent),
                    data: sortSeries(this.patientPresent)
                },
                {
                    name: 'Guardian present',
                    raw: sortData(this.guardianPresent),
                    data: sortSeries(this.guardianPresent)
                },
                {
                    name: 'Both patient and guardian present',
                    raw: sortData(this.bothPresent),
                    data: sortSeries(this.bothPresent)
                }
            ]
        }
    }
})
</script>
<style scoped>
a {
    font-weight: bold;
    text-decoration: none;
}
#view-port {
    height: 77vh;
}
</style>