<template> 
 <div style="background-color: #fff; height: 660px; width: 99%; padding: 5px;">
    <table style="width: 100%; -moz-user-select: none;">
    <tbody><tr>
        <th style="font-size: 1.8em; color: rgb(238, 238, 238); background-color: rgb(153, 153, 153); padding: 10px; width: 1672px;">
        MONTHLY ANTENATAL CLINIC DATA
        </th>
    </tr>
    <tr>
        <td style="border: 1px solid rgb(153, 153, 153); width: 1672px;">
        <table width="100%" cellspacing="0" cellpadding="5" id="table-header">
            <tbody><tr>
            <td style="width: 25%;">
                NAME OF FACILITY
            </td>
            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;width: 25%;">
                <span id="site-name">{{siteName}}</span>
            </td>
            <td style="width: 25%; border-left: 1px solid #999; border-bottom: 1px solid #999;">
                DISTRICT
            </td>
            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;width: 25%;">
                <span id="district"></span>
            </td>
            </tr>
            <tr>
            <td style="width: 25%;">
                MONTH OF
            </td>
            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;width: 25%;">
                <span id="r-month">{{reportingMonth}}</span>
            </td>
            <td style="width: 25%; border-left: 1px solid #999; border-bottom: 1px solid #999;">
                YEAR
            </td>
            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;width: 25%;">
                <span id="r-year">{{reportingYear}}</span>
            </td>
            </tr>
            </tbody></table>
        </td>
        </tr>
        <tr>
        <td style="overflow: auto; border-bottom: 1px solid #999; vertical-align: top;">
            <div id="main" style="width: 98%; overflow: auto; padding: 10px;">
            <table class="report">
                <tbody><tr>
                <td colspan="3">
                    TOTAL NUMBER OF ANTENATAL VISITS
                </td>
                <td style="border: 1px solid #999; width: 25%; text-align: center;">
                    <a id="a-total-anc-visits" href="#" @click.prevent="drill('total_number_of_anc_visits')">
                    <span id="total-anc-visits">{{indicators.total_number_of_anc_visits}}</span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    NEW VISITS
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-new-visits" href="#" @click.prevent="drill('new_visits')">
                    <span id="new-visits">{{indicators.new_visits}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    SUBSEQUENT VISITS
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-subsequent-visits" href="#" @click.prevent="drill('subsequent_visits')">
                    <span id="subsequent-visits">{{indicators.subsequent_visits}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colsan="4">
                    <b><u>DISTRIBUTION OF NEW VISITS</u></b>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    1<sup>ST</sup> TRIMESTER
                </td>
                <td style="border: 1px solid #999; width: 25%; text-align: center;">
                    <a id="a-first-trimester" href="#" @click.prevent="drill('first_trimester')">
                    <span id="first-trimester">{{indicators.first_trimester}}</span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    2<sup>ND</sup> TRIMESTER
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-second-trimester" href="#" @click.prevent="drill('second_trimester')">
                    <span id="second-trimester">{{indicators.second_trimester}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    3<sup>RD</sup> TRIMESTER
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-third-trimester" href="#" @click.prevent="drill('third_trimester')">
                    <span id="third-trimester">{{indicators.third_trimester}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    TEENEGE PREGNANCIES
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-teeneger-pregnancies" href="#" @click.prevent="drill('teeneger_pregnancies')">
                    <span id="teeneger-pregnancies">{{indicators.teeneger_pregnancies}}</span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN ATTENDING ALL 4 FANC VISITS
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-attending-all-visits" href="#" @click.prevent="drill('women_attending_all_anc_visits')">
                    <span id="women-attending-all-visits">{{indicators.women_attending_all_anc_visits}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN SCREENED FOR SYPHILIS
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-screened-syphilis" href="#" @click.prevent="drill('women_screened_for_syphilis')">
                    <span id="women-screened-syphilis">{{indicators.women_screened_for_syphilis}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN CHECKED Hb
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-screened-hb" href="#" @click.prevent="drill('women_checked_hb')">
                    <span id="women-screened-hb">{{indicators.women_checked_hb}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED SP1
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-sp1" href="#" @click.prevent="drill('women_received_sp_one')">
                    <span id="women-received-sp1">{{indicators.women_received_sp_one}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED SP2
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-sp2" href="#" @click.prevent="drill('women_received_sp_two')">
                    <span id="women-received-sp2">{{indicators.women_received_sp_two}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED SP3
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-sp3">
                    <span id="women-received-sp3"></span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED  DOSES OF TD OR HAS ADEQUETE TD (5 doses)
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-ttv" href="#" @click.prevent="drill('women_received_td')">
                    <span id="women-received-ttv">{{indicators.women_received_td}}</span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED 120 TABLETS OF IRON/F/S4
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-iron" href="#" @click.prevent="drill('women_received_one_twenty_iron_tabs')">
                    <span id="women-received-iron">{{indicators.women_received_one_twenty_iron_tabs}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED ALBENDAZOLE
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-albendazole" href="#" @click.prevent="drill('women_received_albendazole')">
                    <span id="women-received-albendazole">{{indicators.women_received_albendazole}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN RECEIVED ITN
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-received-itn" href="#" @click.prevent="drill('women_received_itn')">
                    <span id="women-received-itn">{{indicators.women_received_itn}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN TESTED HIV POSITIVE
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-tested-hiv-positive" href="#" @click.prevent="drill('women_tested_hiv_positive')">
                    <span id="women-tested-hiv-positive">{{indicators.women_tested_hiv_positive}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN PREVIOUSLY HIV POSITIVE 
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-prev-hiv-positive" href="#" @click.prevent="drill('women_prev_hiv_positive')">
                    <span id="women-prev-hiv-positive">{{indicators.women_prev_hiv_positive}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN ON CPT
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-on-cpt" href="#" @click.prevent="drill('women_on_cpt')">
                    <span id="women-on-cpt">{{indicators.women_on_cpt}}</span>
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    WOMEN ON ART
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-women-on-art" href="#" @click.prevent="drill('women_on_art')">
                    <span id="women-on-art">{{indicators.women_on_art}}</span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="4">
                    <b><u>OUTREACH CLINIC</u></b>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    TOTAL NUMBER OF OUTREACH CLINICS
                </td>
                <td style="border: 1px solid #999; width: 25%; text-align: center;">
                    <a id="a-number-of-outreach">
                    <span id="number-of-outreach"></span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    TOTAL NUMBER OF OUTREACH CLINICS ATTENDED
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <a id="a-number-of-outreach-attended">
                    <span id="number-of-outreach-attended"></span> 
                    </a>
                </td>
                </tr>
                <tr>
                <td colspan="3">
                    REASONS TO THOSE NOT ATTEDED
                </td>
                <td style="border: 1px solid #999; border-top: 0px; width: 25%; text-align: center;">
                    <span id="reasons-to-those-not-attended"></span> 
                </td>
                </tr>
                <tr>
                <td>
                    <b>COMPILED BY</b>
                </td>
                <td style="border-bottom: 1px dotted #999; width: 25%; text-align: center;">
                    
                </td>
                <td>
                    <b>DATE</b>
                </td>
                <td style="border-bottom: 1px dotted #999; width: 25%; text-align: center;">
                    <b><span id="date-filled"></span></b>
                </td>
                </tr>
            </tbody></table>
            </div>
        </td>
        </tr>
    </tbody></table>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    emits: ['onindicatorsSelected'],
    props: {
        siteName: {
            type: String,
            default: 'N/A'
        },
        date: {
            type: String,
            default: 'N/A'
        },
        reportingMonth: {
            type: String,
            default: 'N/A'
        },
        reportingYear: {
            type: String,
            default: 'N/A'
        },
        indicators: {
            type: Object,
            required: true
        }
    },
    setup(props, {emit}) {
        return {
            drill: (indicator: string) => {
                emit('onindicatorsSelected', indicator)
            }
        }
    }
})
</script>
<style scoped>
#main {
    height: 100% !important;
    overflow: hidden !important;
}
a[href]:after {
    content: none !important;
}
.err-rows {
    background-color: red;
    color: white;
}
.pass-rows {
    background-color: green;
    color: black;
    border: 1px solid #000000;
}
.err-num {
    width: 3%;
}
#Unknown {display: none;}
#num {display: none;}
#main {
    height: 520px;
}
a:link {
    color: #337ab7;
    text-decoration: none;
}
a:hover {
    color: orange !important;
    text-decoration: underline;
}

a:visited {
    color: #337ab7;
    text-decoration: none;
}
.valueCell {
    border: 3px solid #000;
}
table.report td {
    padding-top: 10px;
    padding-bottom: 5px;
}
table.report {
    width: 100%;
}
table#table-header tr td{
    padding: 12px;
}
</style>
