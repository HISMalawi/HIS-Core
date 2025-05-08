import { Service } from '@/services/service';
import Strings from '../utils/Strings';

export default class PatientVisitsService extends Service {
  
  constructor() {
    super()
  }

  static getStatistics() {
    return super.getJsonSWR('dashboard_stats', {
      date: super.getSessionDate(),
      'program_id': super.getProgramID()
    })
  }

  static getTodaysPatientVisits(data: any) {
    const keys = Object.keys(data)
    let total = 0
    const visits: Array<any> = []

    keys.forEach(key => {
      visits.push({
        label: Strings.capitalizeFirstLetter(key.replace('_', ' ')),
        value: data[key],
        color: 'lightyellow'
      })

      total += data[key]
    })

    visits.push({
      label: 'Total',
      value: total,
      color: 'yellowgreen'
    })

    return visits
  }

  static getRespiratory() {
    return super.getJsonSWR('/dashboard_stats_for_syndromic_statistics',{
      date: super.getSessionDate(),
      'program_id': super.getProgramID()
    })
  }
  
}