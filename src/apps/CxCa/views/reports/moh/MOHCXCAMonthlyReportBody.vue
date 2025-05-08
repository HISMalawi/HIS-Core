<template>
    <table class="my-table">

        <tr class="section-description">
            <td style="font-weight: bold;" colspan="6">MALAWI CERVICAL CANCER CONTROL PROGRAM MONTHLY REPORT</td>
        </tr>
        <tr>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Indicator #</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Name of Indicator</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Value</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Indicator #</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Name of Indicator</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Value</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Number of clients screened for cervical cancer disaggregated by age</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Cervical cancer screening results (HIV- / unknown)</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > &lt;25 years </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_lessthan_25');">{{indicators.num_clients_lessthan_25 ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with VIA-</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_via_negative_hiv_negative_unknown');">{{indicators.num_clients_via_negative ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >25-29 years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_25_to_29');">{{indicators.num_clients_25_to_29 ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with VIA+</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_via_positive_hiv_negative_unknown');">{{indicators.num_clients_via_positive ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >30-44 years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_30_to_44');">{{indicators.num_clients_30_to_44 ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with suspect cancer</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_with_suspect_ca_hiv_negative_unknown');">{{indicators.num_clients_with_suspect_ca ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >45-49 years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_45_to_49');">{{indicators.num_clients_45_to_49 ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with PAP smear normal</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_pap_smear_normal_hiv_negative_unknown');">{{indicators.num_clients_pap_smear_normal ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >1.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > &gt;49 years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_greaterthan_49');">{{indicators.num_clients_greaterthan_49 ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with PAP smear abnormal</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_pap_smear_abnormal_hiv_negative_unknown');">{{indicators.num_clients_pap_smear_abnormal ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description" >
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="3" >2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="3" colspan="2">Number of Clients screened for Cervical cancer disaggregated by HIV status</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px; " >6.6</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px; " >Number of clients with HPV-</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px; " ><span><a href="#" @click.prevent="drillDown('num_clients_hpv_negative_hiv_negative_unknown');">{{indicators.num_clients_hpv_negative ||  0 }}</a></span></td>         
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.7</td>
                    <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with HPV+</td>
                    <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_hpv_positive_hiv_negative_unknown');">{{indicators.num_clients_hpv_positive ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.8</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with visible lesion</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_visible_lesion_hiv_negative_unknown');">{{indicators.num_clients_visible_lesion ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >2.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Positive on ART</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_positive_art');">{{indicators.num_clients_positive_art ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.9</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with with no visible lesion</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_no_visible_lesion_hiv_negative_unknown');">{{indicators.num_clients_no_visible_lesion ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >2.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Positive NOT on ART</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_positive_not_on_art');">{{indicators.num_clients_positive_not_on_art ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >6.10</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with with other gynae</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_other_gynae_hiv_negative_unknown');">{{indicators.num_clients_other_gynae ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >2.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Negative (Tested less than 1 year)</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_negative_tested_less_than_1_year');">{{indicators.num_clients_negative_tested_less_than_1_year ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >7</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Cervical Cancer suspects disaggregated by age</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="3">2.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="3">Unknown (HIV- &lt; 1 year ago, Inconclusive, Prefers not to Disclose, or Never Tested)</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="3"><span><a href="#" @click.prevent="drillDown('hiv_1_year_ago');">{{indicators.hiv_1_year_ago ||  0 }}</a></span></td>
                <td style="font-weight: normal;text-align:left;padding-left:5px;" >7.1</td>
                <td style="font-weight: normal;text-align:left;padding-left:5px;" > &lt;25 Years</td>
                <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_cxca_suspects_lessthan_25');">{{indicators.num_clients_cxca_suspects_lessthan_25 ||  0 }}</a></span></td>
        </tr>    
                
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >7.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >25-29 Years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_cxca_suspects_unknown_25_29');">{{indicators.num_clients_cxca_suspects_unknown_25_29 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >7.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >30-44 Years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_cxca_suspects_30_44');">{{indicators.num_clients_cxca_suspects_30_44 ||  0 }}</a></span></td>
        </tr>
            
        
        <tr class="section-description" >
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="4">3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" rowspan="4" colspan="2">Number of Clients attending Cervical Cancer Services disaggregated by reason for visit</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >7.4</td>
                    <td style="font-weight: normal;text-align:left;padding-left:5px;" > 45-49 Years</td>
                    <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_cxca_suspects_45_49');">{{indicators.num_clients_cxca_suspects_45_49 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >7.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >&gt;49 Years</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_cxca_suspects_greaterthan_49');">{{indicators.num_clients_cxca_suspects_greaterthan_49 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >8</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Total number of clients treated</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Initial screening</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('initial_screening');">{{indicators.initial_screening ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >8.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Same day treatment</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('same_day_treatment');">{{indicators.same_day_treatment ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Postponed treatment</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('postponed_treatment_section_three');">{{indicators.postponed_treatment_section_three ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >8.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Postponed treatment </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('postponed_treatment_section_eight');">{{indicators.postponed_treatment_section_eight ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > 1- year subsequent check-up after treatment</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('one_year_check_up_after_treatment');">{{indicators.one_year_check_up_after_treatment ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >8.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Postponed treatment performed</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('postponed_treatment_performed');">{{indicators.postponed_treatment_performed ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > subsequent screening</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('subsequent_screening');">{{indicators.subsequent_screening ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >8.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Referral</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('referral');">{{indicators.referral ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Referral</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('section_three_referral');">{{indicators.section_three_referral ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > </td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >3.6</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" > Problem visit after Treatment</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('problem_visit_after_treatment');">{{indicators.problem_visit_after_treatment ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >9</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Number of clients treated disaggregated by treatment option</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2"> Number of Clients screened disaggregated by screening method</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >9.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Cryotherapy</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('cryotherapy');">{{indicators.cryotherapy ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >4.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >VIA</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('via');">{{indicators.via ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >9.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Thermal Coagulation</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('thermal_coagulation');">{{indicators.thermal_coagulation ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >4.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Pap Smear</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('pap_smear');">{{indicators.pap_smear ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >9.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >LEEP</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('leep');">{{indicators.leep ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >4.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >HPV DNA</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('hpv_dna');">{{indicators.hpv_dna ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >9.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Other</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('other');">{{indicators.other ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >4.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Speculum Exam</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('speculum_exam');">{{indicators.speculum_exam ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Number of clients referred disaggregated by referral reasons</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Cervical cancer screening results (HIV+)</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Large lesion (&gt;75%)</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('large_lesion_greater_than_75');">{{indicators.large_lesion_greater_than_75 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with VIA-</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_via_negative_cxca_screening_hiv_positive');">{{indicators.num_clients_via_negative_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Further investigation & Management</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('further_investigation_management');">{{indicators.further_investigation_management ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with VIA+</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_via_positive_cxca_screening_hiv_positive');">{{indicators.num_clients_via_positive_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >suspect cancer</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('suspect_ca');">{{indicators.suspect_ca ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with suspect cancer</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_with_suspect_ca_screening_hiv_positive');">{{indicators.num_clients_with_suspect_ca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >No treatment</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('no_treatment');">{{indicators.no_treatment ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.4</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with PAP Smear normal</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_pap_smear_normal_cxca_screening_hiv_positive');">{{indicators.num_clients_pap_smear_normal_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >10.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Other gynae</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('other_gynae');">{{indicators.other_gynae ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.5</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with PAP Smear abnormal</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_pap_smear_abnormal_cxca_screening_hiv_positive');">{{indicators.num_clients_pap_smear_abnormal_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >11</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Number of clients with referral feedback</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.6</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with HPV-</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_hpv_negative_cxca_screening_hiv_positive');">{{indicators.num_clients_hpv_negative_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >11.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with feedback</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('number_clients_with_feedback');">{{indicators.number_clients_with_feedback ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.7</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with HPV+</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_hiv_positive_cxca_screening_hiv_positive');">{{indicators.num_clients_hiv_positive_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >12</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="2">Offered family Planning Services</td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.8</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with visible lesion</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_visible_lesion_cxca_screening_hiv_positive');">{{indicators.num_clients_visible_lesion_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >12.1</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Yes</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('yes');">{{indicators.yes ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.9</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with No Visible lesion</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('no');">{{indicators.num_clients_no_visible_lesion_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >12.2</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >No</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('no');">{{indicators.no ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >5.10</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >Number of clients with other gynae</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('num_clients_other_gynae_cxca_screening_hiv_positive');">{{indicators.num_clients_other_gynae_cxca_screening_hiv_positive ||  0 }}</a></span></td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >12.3</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" >N/A</td>
            <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('na');">{{indicators.na ||  0 }}</a></span></td>
        </tr>
    </table>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    indicators: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['onClickIndicator'],
  methods: {
    drillDown(indicatorsName: string){
      this.$emit('onClickIndicator', indicatorsName)
    }
  }
})
</script>
<style scoped>
a {
  color: #337ab7;
  text-decoration: none;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1px solid rgb(0, 0, 0);
}
tr {
  height: 45px;
  border: 1px solid rgb(0, 0, 0);
}
td {
  border: 1px solid rgb(0, 0, 0);
  text-align: center;
}

.section-description td {
  border-width: 1px;
}
.numbers {
  width: 2.5%;
  text-align: center;
  border-width: 0px 1px 0px 0px;
  border-style: dotted;
}
.sum-arrows {
  width: 75px;
  height: 55px;
}
.postfixes {
  font-size: x-small;
  font-weight: bold;
  position: relative;
  top: -15px;
  left: -40px;
}
ion-col > span {
  font-size: 0.7rem;
}
</style>