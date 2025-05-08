import HisApps from '@/apps/his_apps';

export const HIS_APP_COMPONENTS = (() => {
  let components: any = {}
  HisApps.forEach(app => {
    if (app.appRoutes) {
      components = {...components}
    }
  })
  return components
})()