export default [
    {
        name: "order tests",
        path: "/los/forms/order/:patient_id",
        component: () => import('@/apps/LOS/views/OrderTests.vue')
    },
    {
        name: "Tests requested report",
        path: "/los/report/tests/requests",
        component: () => import('@/apps/LOS/views/Reports/TestRequestedReport.vue')
    },
    {
        name: "Test results report",
        path: "/los/report/tests/results",
        component: () => import('@/apps/LOS/views/Reports/TestResultsReport.vue')
    }
]