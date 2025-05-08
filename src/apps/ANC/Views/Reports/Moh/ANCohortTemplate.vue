<template>
    <div style="background-color: #fff; height: 660px; width: 99%; padding: 5px;">
        <table style="width: 100%; border: 1px solid #999; -moz-user-select: none;">
        <tbody>
            <tr>
                <th style="font-size: 1.8em; color: #eee; background-color: #999; padding: 10px;">
                ANC C<span style="font-size: 0.8em">LINIC</span> -
                F<span style="font-size: 0.8em">ACILITY</span> M<span style="font-size: 0.8em">ONTHLY</span>
                R<span style="font-size: 0.8em">EPORT</span>
                - VERSION 5, <span id="date">{{date}}</span>
                </th>
            </tr>
        <tr>
        <td style="border: 1px solid #999;">
            <table width="100%" cellspacing="0" cellpadding="5" id="table-header">
            <tbody>
                <tr>
                    <td style="width: 25%;">
                    ANC Site Name
                    </td>
                    <td colspan="3" style="border-left: 1px solid #999;
                        border-bottom: 1px solid #999; font-style: italic;">
                        <span id="site-name">{{siteName}}</span>
                    </td>
                </tr>
            <tr>
                <td style="width: 25%;">
                    Reporting Year
                </td>
                <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;">
                    <span id="r-year">{{reportingYear}}</span>
                </td>
                <td style="width: 25%; border-left: 1px solid #999; border-bottom: 1px solid #999;" align="right">
                    Reporting Month
                </td>
                <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;
                    font-style: italic;">
                    <span id="r-month">{{reportingMonth}}</span>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    Was any client served at this site during this month?
                    <span style="font-size: 0.8em">
                        If no, still submit this report
                    </span>
                </td>
                <td style="width: 25%; border-left: 1px solid #999; ">
                <table width="100%">
                    <tbody>
                        <tr>
                            <td style="font-style: italic; display: flex; justify-content: space-around;">
                                <b>Y</b>
                                <b>N</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
                </td>
            </tr>
            </tbody>
            </table>
        </td>
        </tr>
          <tr>
            <td style="overflow: auto; border-bottom: 1px solid #999; vertical-align: top;">
            <div id="main" style="width: 98%; overflow: auto; padding: 10px;">
                <table style="width: 100%;" border="0">
                    <tbody><tr>
                    <td style="width: 33%;" valign="top">
                        <table style="width: 100%; margin-top: 10px;" cellspacing="0" cellpadding="8">
                        <tbody>
                            <tr>
                                <td style="width: 10px;">&nbsp;
                            </td>
                            <td style="background-color: #999; color: #fff; font-weight: bold;" colspan="3">
                                Reporting Month (First Visits) 
                            </td>
                        </tr>
                        <tr>
                            <td>
                            </td>
                            <td style="width: 60%; border-left: 1px solid #999;
                                border-bottom: 1px solid #999; border-right: 1px solid #999;">
                            New women registered
                            </td>
                            <td class="valueCell">
                                <a id="a-new-reg" href="#" @click.prevent="drill('monthly_patient')">
                                    <span id="new-reg">{{indicators.monthly_patient}}</span>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Pregnancy test done<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            1
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;
                                border-bottom: 0px solid #999;">
                            Yes
                            </td>
                            <td class="valueCell">
                            <a id="a-preg-test-yes" href="#" @click.prevent="drill('pregnancy_test_done')">
                                <span id="preg-test-yes">{{indicators.pregnancy_test_done}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            2
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            <span style="color:gray">No</span>
                            </td>
                            <td style="border: 1px solid #999; border-bottom: 1px solid #999;">
                            <a id="a-preg-test-no" href="#" @click.prevent="drill('pregnancy_test_not_done')">
                                <span style="color:gray" id="preg-test-no">{{indicators.pregnancy_test_not_done}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Pregnancy test done in 1<sup style="font-weight: normal;">st</sup> trimester
                            </td>
                        </tr>
                        <tr>
                            <td>
                            9
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;
                                border-bottom: 0px solid #999;">
                            Yes
                            </td>
                            <td class="valueCell">
                            <a id="a-preg-test-done-first-trim" href="#" @click.prevent="drill('pregnancy_test_done_in_first_trimester')">
                                <span id="preg-test-done-first-trim">{{indicators.pregnancy_test_done_in_first_trimester}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-bottom: 0px;">

                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            <span style="color:gray">No</span>
                            </td>
                            <td style="border: 1px solid #999; border-bottom: 1px solid #999;">
                            <a id="a-preg-test-not-done-first-trim" href="#" @click.prevent="drill('pregnancy_test_not_done_in_first_trimester')">
                                <span style="color:gray" id="preg-test-not-done-first-trim">
                                    {{indicators.pregnancy_test_not_done_in_first_trimester}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Week of first ANC visit<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            8
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;
                                border-bottom: 0px solid #999;">
                            Week 0-12
                            </td>
                            <td class="valueCell">
                            <a id="a-week-0-12-of-visit" href="#" @click.prevent="drill('week_of_first_visit_zero_to_twelve')">
                                <span id="week-0-12-of-visit">{{indicators.week_of_first_visit_zero_to_twelve}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-bottom: 0px;">
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                                <span style="color:gray">Week 13+</span>
                            </td>
                            <td style="border: 1px solid #999; border-bottom: 1px solid #999;">
                                <a id="a-week-13-of-visit" href="#" @click.prevent="drill('week_of_first_visit_plus_thirteen')">
                                    <span style="color:gray" id="week-13-of-visit">
                                        {{indicators.week_of_first_visit_plus_thirteen}}
                                    </span>
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            HIV status first visit<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            23
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            Prev. Negative
                            </td>
                            <td class="valueCell">
                            <a id="a-m-prev-negative" href="#" @click.prevent="drill('pre_hiv_negative_first_visit')">
                                <span id="m-prev-negative">{{indicators.pre_hiv_negative_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            24
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Prev. Positive
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-m-prev-positive" href="#" @click.prevent="drill('prev_hiv_positive_first_visit')">
                                <span id="m-prev-positive">{{indicators.prev_hiv_positive_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            25
                            </td>
                            <td style="border-left: 1px solid #999; width: 60%;">
                            New Negative
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-m-new-negative" href="#" @click.prevent="drill('new_hiv_negative_first_visit')">
                                <span id="m-new-negative">{{indicators.new_hiv_negative_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            26
                            </td>
                            <td style="border-left: 1px solid #999;">
                            New Positive
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-m-new-positive" href="#" @click.prevent="drill('new_hiv_positive_first_visit')">
                                <span id="m-new-positive">
                                    {{indicators.new_hiv_positive_first_visit}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            27
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Not Done
                            </td>
                            <td class="valueCell" style="border-top: 0px; border-bottom: 0px;">
                            <a id="a-m-hiv-test-not-done" href="#" @click.prevent="drill('not_done_hiv_test_first_visit')">
                                <span id="m-hiv-test-not-done">{{indicators.not_done_hiv_test_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="font-style:italic;">
                            TotalHIV+ (24+26)
                            </td>
                            <td class="valueCell">
                            <a id="a-m-total-hiv-positive" href="#" @click.prevent="drill('total_hiv_positive_first_visit')">
                                <span id="m-total-hiv-positive">
                                    {{indicators.total_hiv_positive_first_visit}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold; padding-top: 12px;">
                            ART status first visit <span style="font-weight: normal; text-align: right;">out of HIV+</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            30
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            Not on ART
                            </td>
                            <td class="valueCell">
                            <a id="a-m-not-on-art" href="#" @click.prevent="drill('not_on_art_first_visit')">
                                <span id="m-not-on-art">
                                    {{indicators.not_on_art_first_visit}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            31
                            </td>
                            <td style="border-left: 1px solid #999;">
                            On ART before ANC
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-m-on-art-before-visit" href="#" @click.prevent="drill('on_art_before_anc_first_visit')">
                                <span id="m-on-art-before-visit">{{indicators.on_art_before_anc_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            32
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Start ART 0-27 weeks
                            </td>
                            <td class="valueCell" style="border-top: 0px; border-bottom: 0px;">
                                <a id="a-m-art-0-27-weeks" href="#" @click.prevent="drill('start_art_zero_to_twenty_seven_for_first_visit')">
                                    <span id="m-art-0-27-weeks">{{indicators.start_art_zero_to_twenty_seven_for_first_visit}}</span>
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            33
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Start ART 28+ weeks
                            </td>
                            <td class="valueCell">
                            <a id="a-m-art-28-weeks" href="#" @click.prevent="drill('start_art_plus_twenty_eight_for_first_visit')">
                                <span id="m-art-28-weeks">{{indicators.start_art_plus_twenty_eight_for_first_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                            &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td style="background-color: #999; color: #fff; font-weight: bold;" colspan="2">
                                Booking Cohort
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Visits per woman<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            3
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            Tot. with 1 Visit
                            </td>
                            <td class="valueCell">
                            <a id="a-total-1-visit" href="#" @click.prevent="drill('patients_with_total_of_one_visit')">
                                <span id="total-1-visit">{{indicators.patients_with_total_of_one_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            4
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Tot. with 2 Visits
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-total-2-visits" href="#" @click.prevent="drill('patients_with_total_of_two_visits')">
                                <span id="total-2-visits">{{indicators.patients_with_total_of_two_visits}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            5
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Tot. with 3 Visits
                            </td>
                            <td class="valueCell" style="border-top: 0px">
                            <a id="a-total-3-visits" href="#" @click.prevent="drill('patients_with_total_of_three_visits')">
                                <span id="total-3-visits">{{indicators.patients_with_total_of_three_visits}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            6
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Tot. with 4 Visits
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-total-4-visits" href="#" @click.prevent="drill('patients_with_total_of_four_visits')">
                                <span id="total-4-visits">{{indicators.patients_with_total_of_four_visits}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            7
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Tot. with 5+ Visits
                            </td>
                            <td class="valueCell" style="border-top: 0px; border-bottom:0px;">
                            <a id="a-total-5-visits" href="#" @click.prevent="drill('patients_with_total_of_five_plus_visits')">
                                <span id="total-5-visits">{{indicators.patients_with_total_of_five_plus_visits}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td style="font-style:italic;">
                            Total women in cohort
                            </td>
                            <td class="valueCell">
                            <a id="a-total-women-in-cohort" href="#" @click.prevent="drill('total_women_in_cohort')">
                                <span id="total-women-in-cohort">{{indicators.total_women_in_cohort}}</span>
                            </a>
                            </td>
                        </tr>
                        
                        </tbody></table>
                    </td>
                    <td style="width: 36%;" valign="top">
                        <table style="width: 90%; float: right; margin-top: 0px;" cellspacing="0" cellpadding="8">

                        <tbody><tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            (Pre-) Eclampsia<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 0px;">
                            </td>
                            <td style="border-left: 1px solid #999; border-top: 1px solid #999; ">
                            <span style="color: gray">No</span>
                            </td>
                            <td style="border-left: 1px solid #999; border-top: 1px solid #999;
                                border-bottom: 0px solid #999; border-right: 1px solid #999;">
                            <a id="a-patients-without-pre-eclampsia" href="#" @click.prevent="drill('patients_without_pre_eclampsia')">
                                <span style="color: gray" id="patients-without-pre-eclampsia">
                                    {{indicators.patients_without_pre_eclampsia}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            10
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Yes
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-with-pre-eclampsia" href="#" @click.prevent="drill('patients_with_pre_eclampsia')">
                                <span id="patients-with-pre-eclampsia">
                                    {{indicators.patients_with_pre_eclampsia}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            TD doses<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 0px;">

                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;border-bottom: 0px;">
                            <span style="color:gray;">&lt; 2 doses</span>
                            </td>
                            <td style="border: 1px solid #999;border-bottom: 0px;">
                            <a id="a-patients-given-less-than-2-ttv-doses" href="#" @click.prevent="drill('patients_given_td_less_than_two_doses')">
                                <span style="color:gray;" id="patients-given-less-than-2-ttv-doses">
                                    {{indicators.patients_given_td_less_than_two_doses}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            11
                            </td>
                            <td style="border-bottom: 1px solid #999; border-top: 0px; border-left: 1px solid #999;">
                            2+ doses
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-more-than-1-ttv-doses" href="#" @click.prevent="drill('patients_given_td_at_least_two_doses')">
                                <span id="patients-given-more-than-1-ttv-doses">
                                    {{indicators.patients_given_td_at_least_two_doses}}
                                </span> 
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            SP doses <sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            12
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            0 doses
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-0-sp-doses" href="#" @click.prevent="drill('patients_given_zero_sp_doses')">
                                <span id="patients-given-0-2-sp-doses">
                                    {{indicators.patients_given_zero_sp_doses}}
                                </span>
                            </a>
                            </td>
                        </tr><tr>
                            <td>
                            13
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            1 doses
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-1-sp-doses" href="#" @click.prevent="drill('patients_given_one_sp_dose')">
                                <span id="patients-given-1-sp-doses">
                                    {{indicators.patients_given_one_sp_dose}}
                                </span>
                            </a>
                            </td>
                        </tr><tr>
                            <td>
                            14
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            2 doses
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-2-sp-doses" href="#" @click.prevent="drill('patients_given_two_sp_doses')">
                                <span id="patients-given-2-sp-doses">
                                    {{indicators.patients_given_two_sp_doses}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            15
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            &#8805;3 doses
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-patients-given-3-sp-doses" href="#" @click.prevent="drill('patients_given_three_or_more_sp_doses')">
                                <span id="patients-given-3-sp-doses">
                                    {{indicators.patients_given_three_or_more_sp_doses}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            FeFo tablets <sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-top: 0px">
                            &nbsp;
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;
                                border-bottom: 0px;">
                            <span style="color: gray"> &lt; 120 tabs </span>
                            </td>
                            <td style="border: 1px solid #999; border-top: 1px solid #999; border-bottom: 0px;">
                            <a id="a-patients-given-less-than-120-fefol-tabs" href="#" @click.prevent="drill('patients_given_less_than_one_twenty_fefol_tablets')">
                                <span style="color: gray" id="patients-given-less-than-120-fefol-tabs">
                                    {{indicators.patients_given_less_than_one_twenty_fefol_tablets}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                16
                            </td>
                            <td style="border-top: 0px; border-left: 1px solid #999;
                                border-bottom: 1px solid #999;">
                            120+ tabs
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-at-least-120-fefol-tabs" href="#" @click.prevent="drill('patients_given_one_twenty_plus_fefol_tablets')">
                                <span id="patients-given-at-least-120-fefol-tabs">
                                    {{indicators.patients_given_one_twenty_plus_fefol_tablets}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td style="width: 10px;">
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Albendazole doses<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-top: 0px">

                            </td>
                            <td style="border-bottom: 0px; border-top: 1px solid #999;
                                border-left: 1px solid #999; width: 60%;">
                            <span style="color: gray">None</span>
                            </td>
                            <td style="border: 1px solid #999; border-top: 1px solid #999; border-bottom: 0px;">
                            <a id="a-patients-not-given-albendazole" href="#" @click.prevent="drill('patients_not_given_albendazole_doses')">
                                <span style="color: gray" id="patients-not-given-albendazole">
                                    {{indicators.patients_not_given_albendazole_doses}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            17
                            </td>
                            <td style="border-bottom: 1px solid #999; border-top: 0px;
                                border-left: 1px solid #999; width: 60%;">
                            1 dose
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-one-albendazole-dose" href="#" @click.prevent="drill('patients_given_one_albendazole_dose')">
                                <span id="patients-given-one-albendazole-dose">
                                    {{indicators.patients_given_one_albendazole_dose}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>

                            <td style="width: 10px;">
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            ITN (bed nets) given<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-top: 0px">
                            </td>
                            <td style="border-bottom: 0px; border-top: 1px solid #999;
                                border-left: 1px solid #999; width: 60%;">
                            <span style="color: gray">None</span>
                            </td>
                            <td style="border: 1px solid #999; border-top: 1px solid #999; border-bottom: 0px;">
                            <a id="a-patients-not-given-bed-net" href="#" @click.prevent="drill('patients_not_given_bed_net')">
                                <span style="color: gray" id="patients-not-given-bed-net">
                                    {{indicators.patients_not_given_bed_net}}
                                </span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            18
                            </td>
                            <td style="border-bottom: 1px solid #999; border-top: 0px;
                                border-left: 1px solid #999; width: 60%;">
                            Received ITN
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-given-bed-net" href="#" @click.prevent="drill('patients_given_bed_net')">
                                <span id="patients-given-bed-net">{{indicators.patients_given_bed_net}}</span>
                            </a>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="width: 10px;">
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Hb (g/dl)<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            19
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            &lt;7
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-with-hb-less-than-7" href="#" @click.prevent="drill('patients_have_hb_less_than_7_g_dl')">
                                <span id="patients-with-hb-less-than-7">{{indicators.patients_have_hb_less_than_7_g_dl}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            20
                            </td>
                            <td style="border-left: 1px solid #999;">
                            &#8805;7
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-patients-with-hb-at-least-7" href="#" @click.prevent="drill('patients_have_hb_greater_than_6_g_dl')">
                                <span id="patients-with-hb-at-least-7">{{indicators.patients_have_hb_greater_than_6_g_dl}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            21
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                                ND
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-patients-with-hb-not-done" href="#" @click.prevent="drill('patients_hb_test_not_done')">
                                <span id="patients-with-hb-not-done">{{indicators.patients_hb_test_not_done}}</span>
                            </a>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="width: 10px;">
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            Syphilis status <sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            22
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            Negative
                            </td>
                            <td class="valueCell">
                            <a id="a-patients-with-syphilis-negative" href="#" @click.prevent="drill('patients_with_negative_syphilis_status')">
                                <span id="patients-with-syphilis-negative">{{indicators.patients_with_negative_syphilis_status}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            23
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Positive
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-patients-with-syphilis-positive" href="#" @click.prevent="drill('patients_with_positive_syphilis_status')">
                                <span id="patients-with-syphilis-positive">{{indicators.patients_with_positive_syphilis_status}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            24
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Unknown
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-patients-with-syphilis-unknown" href="#" @click.prevent="drill('patients_with_unknown_syphilis_status')">
                                <span id="patients-with-syphilis-unknown">{{indicators.patients_with_unknown_syphilis_status}}</span>
                            </a>
                            </td>
                        </tr>

                        </tbody></table>
                    </td>
                    <td style="width: 30%;" valign="top">
                        <table style="width: 90%; float: right; margin-top: 5px;" cellspacing="0" cellpadding="8">
                        <tbody><tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            HIV status final<sup style="font-weight: normal;">1</sup>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            25
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            Prev. Negative
                            </td>
                            <td class="valueCell">
                            <a id="a-c-prev-negative" href="#" @click.prevent="drill('pre_hiv_negative_final_visit')">
                                <span id="c-prev-negative">{{indicators.pre_hiv_negative_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            26
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Prev. Positive
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-prev-positive" href="#" @click.prevent="drill('prev_hiv_positive_final_visit')">
                                <span id="c-prev-positive">{{indicators.prev_hiv_positive_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            27
                            </td>
                            <td style="border-left: 1px solid #999; width: 60%;">
                            New Negative
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-new-negative" href="#" @click.prevent="drill('new_hiv_negative_final_visit')">
                                <span id="c-new-negative">{{indicators.new_hiv_negative_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            28
                            </td>
                            <td style="border-left: 1px solid #999;">
                            New Positive
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-new-positive" href="#" @click.prevent="drill('new_hiv_positive_final_visit')">
                                <span id="c-new-positive">{{indicators.new_hiv_positive_final_visit}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            29
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                                Not Done
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-hiv-test-not-done" href="#" @click.prevent="drill('not_done_hiv_test_final_visit')">
                                <span id="c-hiv-test-not-done">{{indicators.not_done_hiv_test_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="font-style:italic; font-size: 14px;">
                            TotalHIV+ (26+28)
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-total-hiv-positive" href="#" @click.prevent="drill('c_total_hiv_positive')">
                                <span id="c-total-hiv-positive">{{indicators.c_total_hiv_positive}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            On CPT <span style="font-weight: normal; float: right;">out of HIV+</span>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="border-top: 0px">

                            </td>
                            <td style="border-bottom: 0px; border-top: 1px solid #999;
                                border-left: 1px solid #999; width: 60%;">
                            <span style="color: gray">Not On CPT</span>
                            </td>
                            <td style="border: 1px solid #999; border-top: 1px solid #999; border-bottom: 0px;">
                            <a id="a-not-on-cpt" href="#" @click.prevent="drill('not_on_cpt')">
                                <span id="not-on-cpt">{{indicators.not_on_cpt}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            30
                            </td>
                            <td style="border-bottom: 1px solid #999; border-top: 0px;
                                border-left: 1px solid #999; width: 60%;">
                            On CPT
                            </td>
                            <td class="valueCell">
                            <a id="a-on-cpt" href="#" @click.prevent="drill('on_cpt')">
                                <span id="on-cpt">{{indicators.on_cpt}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold;">
                            NVP syrup given <span style="font-weight: normal; float: right;">out of HIV+</span>
                            </td>
                        </tr>

                        <tr>
                            <td style="border-top: 0px">
                            </td>
                            <td style="border-bottom: 0px; border-top: 1px solid #999;
                                border-left: 1px solid #999; width: 60%;">
                            <span style="color: gray">No</span>
                            </td>
                            <td style="border: 1px solid #999; border-top: 1px solid #999; border-bottom: 0px;">
                            <a id="a-nvp-not-given" href="#" @click.prevent="drill('nvp_not_given')">
                                <span id="nvp-not-given">{{indicators.nvp_not_given}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            31
                            </td>
                            <td style="border-bottom: 1px solid #999; border-top: 0px;
                                border-left: 1px solid #999; width: 60%;">
                            Received NVP
                            </td>
                            <td class="valueCell">
                            <a id="a-nvp-given" href="#" @click.prevent="drill('nvp_given')">
                                <span id="nvp-given">{{indicators.nvp_given}}</span>
                            </a>
                            </td>
                        </tr>

                        <tr>
                            <td>
                            &nbsp;
                            </td>
                            <td colspan="2" style="font-weight: bold; padding-top: 12px;">
                            ART status final <span style="font-weight: normal; float: right;">out of HIV+</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            32
                            </td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999; width: 60%;">
                            Not on ART
                            </td>
                            <td class="valueCell">
                            <a id="a-c-not-on-art" href="#" @click.prevent="drill('not_on_art_final_visit')">
                                <span id="c-not-on-art">{{indicators.not_on_art_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            33
                            </td>
                            <td style="border-left: 1px solid #999;">
                            On ART before ANC
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-on-art-before-visit" href="#" @click.prevent="drill('on_art_before_anc_final_visit')">
                                <span id="c-on-art-before-visit">
                                    {{indicators.on_art_before_anc_final_visit}}
                                </span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            34
                            </td>
                            <td style="border-left: 1px solid #999;">
                            Start ART 0-27 weeks
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-art-0-27-weeks" href="#" @click.prevent="drill('start_art_zero_to_twenty_seven_for_final_visit')">
                                <span id="c-art-0-27-weeks">{{indicators.start_art_zero_to_twenty_seven_for_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            35
                            </td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Start ART 28+ weeks
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            <a id="a-c-art-28-weeks" href="#" @click.prevent="drill('start_art_plus_twenty_eight_for_final_visit')">
                                <span id="c-art-28-weeks">{{indicators.start_art_plus_twenty_eight_for_final_visit}}</span>
                            </a>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colspan="3" style="font-weight: bold;">
                            Report filled
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            Date
                            </td>
                            <td class="valueCell" style="width: 70%;">
                            <span id="date-filled"></span>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="border-left: 1px solid #999;">
                            Name
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            ANC EMR
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Phone
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colspan="2" style="font-weight: bold; height: 200px; border: 1px solid #999;" valign="top">
                            Notes
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colspan="2" style="font-weight: bold;">
                            Report Received
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="border-top: 1px solid #999; border-left: 1px solid #999;">
                            Date
                            </td>
                            <td class="valueCell">
                            &nbsp;
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="border-left: 1px solid #999; border-bottom: 1px solid #999;">
                            Name
                            </td>
                            <td class="valueCell" style="border-top: 0px;">
                            &nbsp;
                            </td>
                        </tr>
                        </tbody></table>
                    </td>
                    </tr>
                </tbody></table>
                </div>
            </td>
        </tr>
          <tr>
            <td style="height: 20px; font-size: 0.7em; font-style: italic;">
                <span style="margin: 10px;">
                  <sup>1</sup>Check: Total of these sections must add up to total number of women in cohort
                </span>&nbsp;&nbsp;
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
        function drill(indicator: string) {
            emit('onindicatorsSelected', indicator)
        }
        return {
            drill
        }
    }
})
</script>
<style scoped>
table#table-header td{
    padding: 10px;
}
table td {
    padding: 5px;
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
#Unknown {
    display: none;
}
#num {
    display: none;
}
#main {
    height: 100vh;
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
</style>