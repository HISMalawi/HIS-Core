<template>
    <table>
        <tr class="section-description">
            <td style="font-weight: bold;text-align:left;padding-left:5px;" rowspan="2">#</td>
            <td style="font-weight: bold;text-align:left;padding-left:5px;" rowspan="2">Age Group</td>
            <td style="font-weight: bold;text-align:left;padding-left:5px;" rowspan="2">Gender</td>
            
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="3">1st time screened</td>
            
            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="3">Rescreened after previous negative</td>

            <td style="font-weight: normal;text-align:left;padding-left:5px;" colspan="3">Post-treatment follow-up</td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Negative</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Positive</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Suspected Cancer</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Negative</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Positive</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Suspected Cancer</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Negative</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Positive</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Suspected Cancer</td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >5</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >15-19 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_15_19');">{{indicators.tx_1st_scrn_negative_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_15_19');">{{indicators.tx_1st_scrn_positive_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_15_19');">{{indicators.tx_1st_scrn_suspected_cxca_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_15_19');">{{indicators.tx_rscrn_scrn_negative_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_15_19');">{{indicators.tx_rscrn_scrn_positive_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_15_19');">{{indicators.tx_rscrn_scrn_suspected_cxca_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_15_19');">{{indicators.tx_ptfu_scrn_negative_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_15_19');">{{indicators.tx_ptfu_scrn_positive_15_19 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_15_19');">{{indicators.tx_ptfu_scrn_suspected_cxca_15_19 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >6</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >20-24 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_20_24');">{{indicators.tx_1st_scrn_negative_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_20_24');">{{indicators.tx_1st_scrn_positive_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_20_24');">{{indicators.tx_1st_scrn_suspected_cxca_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_20_24');">{{indicators.tx_rscrn_scrn_negative_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_20_24');">{{indicators.tx_rscrn_scrn_positive_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_20_24');">{{indicators.tx_rscrn_scrn_suspected_cxca_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_20_24');">{{indicators.tx_ptfu_scrn_negative_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_20_24');">{{indicators.tx_ptfu_scrn_positive_20_24 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_20_24');">{{indicators.tx_ptfu_scrn_suspected_cxca_20_24 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >7</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >25-29 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_25_29');">{{indicators.tx_1st_scrn_negative_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_25_29');">{{indicators.tx_1st_scrn_positive_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_25_29');">{{indicators.tx_1st_scrn_suspected_cxca_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_25_29');">{{indicators.tx_rscrn_scrn_negative_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_25_29');">{{indicators.tx_rscrn_scrn_positive_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_25_29');">{{indicators.tx_rscrn_scrn_suspected_cxca_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_25_29');">{{indicators.tx_ptfu_scrn_negative_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_25_29');">{{indicators.tx_ptfu_scrn_positive_25_29 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_25_29');">{{indicators.tx_ptfu_scrn_suspected_cxca_25_29 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >8</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >30-34 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_30_34');">{{indicators.tx_1st_scrn_negative_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_30_34');">{{indicators.tx_1st_scrn_positive_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_30_34');">{{indicators.tx_1st_scrn_suspected_cxca_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_30_34');">{{indicators.tx_rscrn_scrn_negative_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_30_34');">{{indicators.tx_rscrn_scrn_positive_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_30_34');">{{indicators.tx_rscrn_scrn_suspected_cxca_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_30_34');">{{indicators.tx_ptfu_scrn_negative_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_30_34');">{{indicators.tx_ptfu_scrn_positive_30_34 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_30_34');">{{indicators.tx_ptfu_scrn_suspected_cxca_30_34 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >9</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >35-39 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_35_39');">{{indicators.tx_1st_scrn_negative_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_35_39');">{{indicators.tx_1st_scrn_positive_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_35_39');">{{indicators.tx_1st_scrn_suspected_cxca_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_35_39');">{{indicators.tx_rscrn_scrn_negative_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_35_39');">{{indicators.tx_rscrn_scrn_positive_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_35_39');">{{indicators.tx_rscrn_scrn_suspected_cxca_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_35_39');">{{indicators.tx_ptfu_scrn_negative_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_35_39');">{{indicators.tx_ptfu_scrn_positive_35_39 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_35_39');">{{indicators.tx_ptfu_scrn_suspected_cxca_35_39 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >10</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >40-44 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_40_44');">{{indicators.tx_1st_scrn_negative_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_40_44');">{{indicators.tx_1st_scrn_positive_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_40_44');">{{indicators.tx_1st_scrn_suspected_cxca_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_40_44');">{{indicators.tx_rscrn_scrn_negative_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_40_44');">{{indicators.tx_rscrn_scrn_positive_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_40_44');">{{indicators.tx_rscrn_scrn_suspected_cxca_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_40_44');">{{indicators.tx_ptfu_scrn_negative_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_40_44');">{{indicators.tx_ptfu_scrn_positive_40_44 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_40_44');">{{indicators.tx_ptfu_scrn_suspected_cxca_40_44 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >11</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >45-49 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_45_49');">{{indicators.tx_1st_scrn_negative_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_45_49');">{{indicators.tx_1st_scrn_positive_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_45_49');">{{indicators.tx_1st_scrn_suspected_cxca_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_45_49');">{{indicators.tx_rscrn_scrn_negative_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_45_49');">{{indicators.tx_rscrn_scrn_positive_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_45_49');">{{indicators.tx_rscrn_scrn_suspected_cxca_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_45_49');">{{indicators.tx_ptfu_scrn_negative_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_45_49');">{{indicators.tx_ptfu_scrn_positive_45_49 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_45_49');">{{indicators.tx_ptfu_scrn_suspected_cxca_45_49 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >12</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >50-54 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_50_54');">{{indicators.tx_1st_scrn_negative_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_50_54');">{{indicators.tx_1st_scrn_positive_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_50_54');">{{indicators.tx_1st_scrn_suspected_cxca_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_50_54');">{{indicators.tx_rscrn_scrn_negative_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_50_54');">{{indicators.tx_rscrn_scrn_positive_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_50_54');">{{indicators.tx_rscrn_scrn_suspected_cxca_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_50_54');">{{indicators.tx_ptfu_scrn_negative_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_50_54');">{{indicators.tx_ptfu_scrn_positive_50_54 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_50_54');">{{indicators.tx_ptfu_scrn_suspected_cxca_50_54 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >13</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >55-59 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_55_59');">{{indicators.tx_1st_scrn_negative_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_55_59');">{{indicators.tx_1st_scrn_positive_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_55_59');">{{indicators.tx_1st_scrn_suspected_cxca_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_55_59');">{{indicators.tx_rscrn_scrn_negative_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_55_59');">{{indicators.tx_rscrn_scrn_positive_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_55_59');">{{indicators.tx_rscrn_scrn_suspected_cxca_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_55_59');">{{indicators.tx_ptfu_scrn_negative_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_55_59');">{{indicators.tx_ptfu_scrn_positive_55_59 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_55_59');">{{indicators.tx_ptfu_scrn_suspected_cxca_55_59 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >14</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >60-64 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_60_64');">{{indicators.tx_1st_scrn_negative_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_60_64');">{{indicators.tx_1st_scrn_positive_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_60_64');">{{indicators.tx_1st_scrn_suspected_cxca_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_60_64');">{{indicators.tx_rscrn_scrn_negative_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_60_64');">{{indicators.tx_rscrn_scrn_positive_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_60_64');">{{indicators.tx_rscrn_scrn_suspected_cxca_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_60_64');">{{indicators.tx_ptfu_scrn_negative_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_60_64');">{{indicators.tx_ptfu_scrn_positive_60_64 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_60_64');">{{indicators.tx_ptfu_scrn_suspected_cxca_60_64 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >15</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >65-69 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_65_69');">{{indicators.tx_1st_scrn_negative_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_65_69');">{{indicators.tx_1st_scrn_positive_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_65_69');">{{indicators.tx_1st_scrn_suspected_cxca_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_65_69');">{{indicators.tx_rscrn_scrn_negative_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_65_69');">{{indicators.tx_rscrn_scrn_positive_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_65_69');">{{indicators.tx_rscrn_scrn_suspected_cxca_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_65_69');">{{indicators.tx_ptfu_scrn_negative_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_65_69');">{{indicators.tx_ptfu_scrn_positive_65_69 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_65_69');">{{indicators.tx_ptfu_scrn_suspected_cxca_65_69 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >16</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >70-74 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_70_74');">{{indicators.tx_1st_scrn_negative_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_70_74');">{{indicators.tx_1st_scrn_positive_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_70_74');">{{indicators.tx_1st_scrn_suspected_cxca_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_70_74');">{{indicators.tx_rscrn_scrn_negative_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_70_74');">{{indicators.tx_rscrn_scrn_positive_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_70_74');">{{indicators.tx_rscrn_scrn_suspected_cxca_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_70_74');">{{indicators.tx_ptfu_scrn_negative_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_70_74');">{{indicators.tx_ptfu_scrn_positive_70_74 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_70_74');">{{indicators.tx_ptfu_scrn_suspected_cxca_70_74 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >17</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >75-79 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_75_79');">{{indicators.tx_1st_scrn_negative_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_75_79');">{{indicators.tx_1st_scrn_positive_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_75_79');">{{indicators.tx_1st_scrn_suspected_cxca_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_75_79');">{{indicators.tx_rscrn_scrn_negative_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_75_79');">{{indicators.tx_rscrn_scrn_positive_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_75_79');">{{indicators.tx_rscrn_scrn_suspected_cxca_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_75_79');">{{indicators.tx_ptfu_scrn_negative_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_75_79');">{{indicators.tx_ptfu_scrn_positive_75_79 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_75_79');">{{indicators.tx_ptfu_scrn_suspected_cxca_75_79 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >18</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >80-84 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_80_84');">{{indicators.tx_1st_scrn_negative_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_80_84');">{{indicators.tx_1st_scrn_positive_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_80_84');">{{indicators.tx_1st_scrn_suspected_cxca_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_80_84');">{{indicators.tx_rscrn_scrn_negative_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_80_84');">{{indicators.tx_rscrn_scrn_positive_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_80_84');">{{indicators.tx_rscrn_scrn_suspected_cxca_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_80_84');">{{indicators.tx_ptfu_scrn_negative_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_80_84');">{{indicators.tx_ptfu_scrn_positive_80_84 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_80_84');">{{indicators.tx_ptfu_scrn_suspected_cxca_80_84 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >19</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >85-89 years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_85_89');">{{indicators.tx_1st_scrn_negative_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_85_89');">{{indicators.tx_1st_scrn_positive_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_85_89');">{{indicators.tx_1st_scrn_suspected_cxca_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_85_89');">{{indicators.tx_rscrn_scrn_negative_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_85_89');">{{indicators.tx_rscrn_scrn_positive_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_85_89');">{{indicators.tx_rscrn_scrn_suspected_cxca_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_85_89');">{{indicators.tx_ptfu_scrn_negative_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_85_89');">{{indicators.tx_ptfu_scrn_positive_85_89 ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_85_89');">{{indicators.tx_ptfu_scrn_suspected_cxca_85_89 ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >20</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >90 plus years</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_90_plus');">{{indicators.tx_1st_scrn_negative_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_90_plus');">{{indicators.tx_1st_scrn_positive_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_90_plus');">{{indicators.tx_1st_scrn_suspected_cxca_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_90_plus');">{{indicators.tx_rscrn_scrn_negative_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_90_plus');">{{indicators.tx_rscrn_scrn_positive_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_90_plus');">{{indicators.tx_rscrn_scrn_suspected_cxca_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_90_plus');">{{indicators.tx_ptfu_scrn_negative_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_90_plus');">{{indicators.tx_ptfu_scrn_positive_90_plus ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_90_plus');">{{indicators.tx_ptfu_scrn_suspected_cxca_90_plus ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >21</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Unknown age</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_unkn_age');">{{indicators.tx_1st_scrn_negative_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_unkn_age');">{{indicators.tx_1st_scrn_positive_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_unkn_age');">{{indicators.tx_1st_scrn_suspected_cxca_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_unkn_age');">{{indicators.tx_rscrn_scrn_negative_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_unkn_age');">{{indicators.tx_rscrn_scrn_positive_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_unkn_age');">{{indicators.tx_rscrn_scrn_suspected_cxca_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_unkn_age');">{{indicators.tx_ptfu_scrn_negative_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_unkn_age');">{{indicators.tx_ptfu_scrn_positive_unkn_age ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_unkn_age');">{{indicators.tx_ptfu_scrn_suspected_cxca_unkn_age ||  0 }}</a></span></td>
        </tr>
        <tr class="section-description">
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >22</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >All</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" >Female</td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_negative_all');">{{indicators.tx_1st_scrn_negative_all||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_positive_all');">{{indicators.tx_1st_scrn_positive_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_1st_scrn_suspected_cxca_all');">{{indicators.tx_1st_scrn_suspected_cxca_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_negative_all');">{{indicators.tx_rscrn_scrn_negative_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_positive_all');">{{indicators.tx_rscrn_scrn_positive_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_rscrn_scrn_suspected_cxca_all');">{{indicators.tx_rscrn_scrn_suspected_cxca_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_negative_all');">{{indicators.tx_ptfu_scrn_negative_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_positive_all');">{{indicators.tx_ptfu_scrn_positive_all ||  0 }}</a></span></td>
          <td style="font-weight: normal;text-align:left;padding-left:5px;" ><span><a href="#" @click.prevent="drillDown('tx_ptfu_scrn_suspected_cxca_all');">{{indicators.tx_ptfu_scrn_suspected_cxca_all ||  0 }}</a></span></td>
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