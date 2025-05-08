<template>
	<ion-page>
		<ion-header :translucent="true">
			<ion-toolbar class="mobile-component-view">
				<ion-title> {{ facilityName }} </ion-title>
				<ion-buttons slot="end">
					<ion-thumbnail>
						<img :src="appLogo" class="logo" alt="App Logo" />
					</ion-thumbnail>
				</ion-buttons>
			</ion-toolbar>
			<ion-toolbar class="full-component-view">
				<ion-row>
					<ion-col>
						<div class="tool-bar-medium-card">
							<barcode-input @onScan="onBarcode" size="small" />
						</div>
					</ion-col>
					<ion-col size="5">
						<div class="tool-bar-medium-card">
							<div class="his-sm-text tool-bar-medium-content">
								<span>Facility name: <b>{{ facilityName }}</b></span> <br />
								<span>Location: <b> {{ userLocation }}</b></span><br />
								<span>User: <b>{{ userName }}</b> | Date: <ion-label
										:color="isBDE ? 'danger' : 'success'"><b>{{ sessionDate }}
										</b></ion-label></span><br />
							</div>
						</div>
					</ion-col>
					<ion-col size="3">
						<program-icon :app="app" :icon="appLogo" :version="appVersion"> </program-icon>
					</ion-col>
				</ion-row>
			</ion-toolbar>
		</ion-header>

		<ion-toolbar>
			<ion-segment scrollable :value="activeTab.toString()" class="ion-justify-content-center">
				<ion-segment-button :value="'1'" @click="onSegmentClick(1)">
					<ion-icon :icon="statsChart"> </ion-icon>
					<ion-label class="his-sm-text">
						Overview
					</ion-label>
				</ion-segment-button>
				<ion-segment-button v-if="canReport" :value="'2'" @click="onSegmentClick(2)">
					<ion-icon :icon="pieChart"> </ion-icon>
					<ion-label class="his-sm-text">
						<ion-icon v-if="showSegmentBackArrow && activeTab === 2" :icon="arrowBack" />
						Reports
					</ion-label>
				</ion-segment-button>
				<ion-segment-button :value="'3'" @click="onSegmentClick(3)">
					<ion-icon :icon="settings"> </ion-icon>
					<ion-label class="his-sm-text">
						<ion-icon v-if="showSegmentBackArrow && activeTab === 3" :icon="arrowBack" />
						Administration
					</ion-label>
				</ion-segment-button>
				<ion-segment-button :value="'4'" @click="onSegmentClick(4)">
					<ion-icon :color="hasUnreadNotifications ? 'danger' : ''" :icon="notifications" />
					<ion-label :color="hasUnreadNotifications ? 'danger' : ''" class="his-sm-text">
						Alerts <b v-if="hasUnreadNotifications">({{ notificationCount }})</b>
					</ion-label>
				</ion-segment-button>
			</ion-segment>
		</ion-toolbar>

		<ion-content :fullscreen="true">
			<div id="container" class="his-card overview" v-if="ready">
				<div v-show="activeTab == 1">
					<component v-bind:is="appOverview" />
				</div>
				<div v-show="activeTab == 2">
					<home-folder :key="activeTab" @onSublist="showSegmentBackArrow = true" :items="appReports" :resetList="resetReport">
					</home-folder>
				</div>
				<div v-show="activeTab == 3">
					<home-folder :key="activeTab" @onSublist="showSegmentBackArrow = true"
						:items="(app.globalPropertySettings as Array<FolderInterface>)" :resetList="resetAdmin">
					</home-folder>
				</div>
				<div v-if="activeTab == 4">
					<home-notification />
				</div>
			</div>
		</ion-content>

		<ion-footer>
			<ion-toolbar>
				<ion-row>
					<ion-col>
						<ion-button class="xl-button mobile-component-view" color="danger" @click="signOut">
							<ion-icon :icon="logOut"></ion-icon>
						</ion-button>
						<ion-button class="xl-button full-component-view" color="danger" size="large" @click="signOut">
							<ion-icon :icon="logOut"></ion-icon>
							<ion-label> Logout </ion-label>
						</ion-button>
					</ion-col>

					<ion-col>
						<ion-button v-if="canFindByIdentifier" class="xl-button mobile-component-view" color="primary"
							router-link="/patients/search/id">
							<ion-icon :icon="search"> </ion-icon>
						</ion-button>
						<ion-button v-if="canFindByIdentifier" class="xl-button full-component-view" color="primary"
							size="large" router-link="/patients/search/id">
							<ion-icon :icon="search"> </ion-icon>
							<ion-label> Find By </ion-label>
						</ion-button>
					</ion-col>

					<ion-col>
						<ion-button class="xl-button mobile-component-view" color="success"
							router-link="/patient/registration">
							<ion-icon :icon="person"></ion-icon>
						</ion-button>
						<ion-button class="xl-button full-component-view" color="success" size="large"
							router-link="/patient/registration">
							<ion-icon :icon="person"></ion-icon>
							<ion-label> Find or Register </ion-label>
						</ion-button>
					</ion-col>

					<ion-col>
						<ion-button class="xl-button mobile-component-view" color="primary" @click="openModal">
							<ion-icon :icon="apps"></ion-icon>
						</ion-button>
						<ion-button class="xl-button full-component-view" color="primary" size="large" @click="openModal">
							<ion-icon :icon="apps"></ion-icon>
							<ion-label> Applications </ion-label>
						</ion-button>
					</ion-col>
				</ion-row>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script lang="ts">
import HisApp from "@/apps/app_lib"
import { defineAsyncComponent, defineComponent, ref } from "vue";
import HisDate from "@/utils/Date"
import { AppInterface, FolderInterface } from "@/apps/interfaces/AppInterface";
import { Service } from "@/services/service"
import { AuthService } from "@/services/auth_service"
import GlobalSetting, { GLOBAL_PROP } from "@/apps/GLOBAL_APP/global_prop"
import { Notification } from "@/composables/notifications"
import Img from "@/utils/Img"
import {
	apps,
	notifications,
	person,
	search,
	logOut,
	statsChart,
	pieChart,
	settings,
	arrowBack
} from 'ionicons/icons';
import {
	IonThumbnail,
	IonContent,
	IonHeader,
	IonFooter,
	IonPage,
	IonToolbar,
	IonRow,
	IonCol,
	IonIcon,
	IonButton,
	IonSegment,
	IonButtons,
	IonSegmentButton,
	IonLabel,
	IonTitle,
modalController,
} from "@ionic/vue";
import usePlatform from "@/composables/usePlatform";
import { alertConfirmation, toastWarning } from "@/utils/Alerts";
import { useRouter } from "vue-router";
import Store from "@/composables/ApiStore"
import BarcodeInput from "@/components/BarcodeInput.vue";
import { GlobalPropertyService } from "@/services/global_property_service";
import Screentimeout from "@/composables/Screentimeout"
import useFacility from "@/composables/useFacility";
import ReleaseNotesVue from "@/components/ReleaseNotes.vue";
import Nrb from "@/composables/nationalIdFlow"

export default defineComponent({
	name: "Home",
	components: {
		IonTitle,
		IonThumbnail,
		IonIcon,
		IonContent,
		IonHeader,
		IonPage,
		IonButtons,
		IonToolbar,
		IonRow,
		IonCol,
		IonButton,
		IonFooter,
		IonSegment,
		IonSegmentButton,
		IonLabel,
		BarcodeInput,
		ProgramIcon: defineAsyncComponent(() => import("@/components/DataViews/DashboardAppIcon.vue")),
		HomeFolder: defineAsyncComponent(() => import("@/components/HomeComponents/HomeFolders.vue")),
		HomeNotification: defineAsyncComponent(() => import("@/components/HomeComponents/HomeNotifications.vue"))
	},
	setup() {
		const scanLock = ref(false)
		const router = useRouter();
		const { activePlatformProfile } = usePlatform()
		const { facilityName } = useFacility();
		// Reads global property setting for inactivity timeout 
		GlobalPropertyService.get(GLOBAL_PROP.INACTIVITY_TIMEOUT).then((prop) => {
			const timeout = parseInt(prop || '0')
			Screentimeout.configureTimeout(timeout)
			Screentimeout.resetInactivityTimer()
		})

		const onBarcode = async (code: string) => {
			if (scanLock.value) return
			scanLock.value = true
			if (Nrb.isNrbType(code)) {
				try {
					const nationalID = await Nrb.onScanQr(code)
					if (nationalID?.person) {
						return router.push(`/patients/confirm?person_id=${nationalID?.person?.person_id||nationalID?.person?.patient_id}`)
					} else if (nationalID?.qrData) {
						return router.push({
							path: "/patient/registration",
							query: { ...nationalID.qrData, nationalIDStatus: true, skipSearch: true }
						})
					}
				} catch (e) {
					toastWarning("Error occured while scanning NRB Document")
				}
				scanLock.value = false
				return
			}
			if (code.length > 4) router.push('/patients/confirm?patient_barcode=' + code)
			scanLock.value = false
		}

		const {
			notificationCount,
			hasUnreadNotifications
		} = Notification()
		return {
			hasUnreadNotifications,
			notificationCount,
			notifications,
			apps,
			person,
			search,
			logOut,
			statsChart,
			pieChart,
			arrowBack,
			settings,
			activePlatformProfile,
			facilityName,
			onBarcode,
		}
	},
	data() {
		return {
			app: {} as AppInterface,
			userLocation: "",
			sessionDate: "",
			userName: "",
			appVersion: "",
			activeTab: 1,
			ready: false,
			overviewComponent: {} as any,
			isBDE: false,
			showSegmentBackArrow: false as boolean,
			resetReport: 0 as number,
			resetAdmin: 0 as number,
		};
	},
	computed: {
		appOverview(): any {
			return this.app.homeOverviewComponent
		},
		appLogo(): string {
			return Img(this.app.applicationIcon)
		},
		appReports(): FolderInterface[] {
			return this.app.programReports ? this.app.programReports : []
		},
		appAdministration(): FolderInterface[] {
			return this.app.globalPropertySettings ? this.app.globalPropertySettings : []
		},
		canFindByIdentifier(): boolean {
			return this.app.programPatientIdentifiers ? true : false
		},
		canReport(): boolean {
			return this.app.programReports ? true : false
		}
	},
	methods: {
		async showSystemUpdateNotes() {
			const auth = new AuthService()
			if (!(await auth.hasUserReadCurrentVersionRelease())) {
				const action =  await infoActionSheet(
					'New system update is available',
					`Version ${auth.getHeadVersion()}`,
					'Please read the notes to see what has changed',
					[
						{ 
							name: 'Read notes',
							slot: 'start',
							color: 'success'
						},
						{ 
							name: 'Dismiss',
							slot: 'start',
							color: 'primary'
						}
					]
				)
				if (action === 'Read later') {
					return
				} 
				await auth.updateVersionReleaseAsRead()
				if (action === 'Read notes') {
					(await modalController.create({
						component: ReleaseNotesVue,
						backdropDismiss: true,
						cssClass: "large-modal",
						componentProps: {
							app: HisApp.getActiveApp(),
							onCloseAction: () => modalController.dismiss()
						}
					})).present()
				}
			}
		},
		onSegmentClick(tabIndex: number) {
			this.activeTab = tabIndex
			if (this.activeTab === 2) {
				this.resetReport += 1
			} else if (this.activeTab === 3) {
				this.resetAdmin += 1
			}
			this.showSegmentBackArrow = false
			Store.set('ACTIVE_HOME_TAB', this.activeTab)
			Store.invalidate('ACTIVE_HOME_SUB_TAB_NAME')
		},
		loadNotifications() {
			Notification().loadNotifications(this.app)
		},
		loadApplicationData() {
			this.ready = true;
			this.isBDE = Service.isBDE() === true
			this.userLocation = sessionStorage.userLocation;
			this.userName = sessionStorage.username;
			this.sessionDate = HisDate.toStandardHisDisplayFormat(
				Service.getSessionDate()
			)
			this.appVersion = Service.getFullVersion()
		},
		async openModal() {
			const data = await HisApp.selectApplication('HomePage')
			if (data) {
				this.app = data
				this.activeTab = 1
				this.loadApplicationData();
				this.loadNotifications()
			}
		},
		async signOut() {
			const ok = await alertConfirmation('Are you sure you want to logout ?')
			if (!ok) return
			const auth = new AuthService()
			try {
				Store.invalidateAll()
				if ((await GlobalSetting.portalEnabled())) {
					const portalLocation = await GlobalSetting.portalProperties();
					window.location = portalLocation;
				} else {
					this.$router.push('/login')
				}
			} catch (e) {
				console.warn(`${e}`)
			}
			Screentimeout.clearScreenTimeout()
			auth.clearSession()
		},
	},
	async created() {
		this.activeTab = await Store.get('ACTIVE_HOME_TAB')
		this.loadNotifications()
	},
	async mounted() {
		await HisApp.doAppManagementTasks()
		const app = HisApp.getActiveApp()
		if (!app) {
			this.openModal();
			this.showSystemUpdateNotes()
		} else {
			this.app = app
			this.loadApplicationData();
			this.showSystemUpdateNotes()
		}
	},
});
</script>

<style scoped>
.full-component-view {
	display: block;
}

.mobile-component-view {
	display: none;
}

@media (max-width:900px) {
	.full-component-view {
		display: none;
	}

	.mobile-component-view {
		display: block;
	}
}

ion-icon {
	padding: 0.2em;
}

.tool-bar-medium-content {
	padding: 0.4em;
}

.tool-bar-medium-card {
	height: 100px;
	font-size: 0.9em;
}

ion-col p {
	margin: 0;
}

.xl-button {
	width: 100%;
}

.overview {
	max-height: 63vh;
	min-height: 63vh;
	margin: 0.5em;
	overflow: auto;
}

.barcode-input {
	font-size: 3em;
	width: 100%;
	height: 90%;
	color: black;
	background-color: white;
}

input {
	border: none;
}

input:focus {
	outline: none;
}</style>