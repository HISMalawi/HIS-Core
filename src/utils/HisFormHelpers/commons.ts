import { Option } from "@/components/Forms/FieldInterface"
import { find } from "lodash"

export function resolveObs(obs: any, tag = '') {
  const values: any = Object.values(obs)
    .filter((d: any) => d && (d.tag === tag || tag === ''))
    .reduce((accum: any, cur: any) => {
      const data = cur.obs ? cur.obs : cur
      if (Array.isArray(data)) {
        accum = accum.concat(data)
      } else if (typeof data === 'function') {
        accum.push(data())
      } else {
        accum.push(data)
      }
      return accum
    }, [])
  return Promise.all(values)
}

export function mapStrToOptions(options: Array<string>): Array<Option> {
  return options.map(option => ({ label: option, value: option }));
}

export function mapObjToOptions(options: Array<Record<string, any>>, label = "name", value = "name"): Array<Option> {
  return options.map(option => ({ label: option[label], value: option[value], other: option }));
}

export function mapToYesNoOptions(options: Array<string>, checkedOptions?: Array<Option>, hasUnknown = false) {
  return options.map(label => {
    const checkedValue = find(checkedOptions, { label });
    return {
      label,
      value: checkedValue?.value ?? "",
      other: {
        values: hasUnknown ? yesNoUnknownOptions() : yesNoOptions()
      }
    }
  });
}

export function yesNoUnknownOptions() {
  return mapStrToOptions(["Yes", "No", "Unknown"]);
}

export function yesNoOptions() {
  return mapStrToOptions(["Yes", "No"]);
}

export function toYesNoOption(label: string, other: any={}): Option {
  return {
      label,
      value: '',
      other: {
          ...other,
          values: yesNoOptions()
      }
  } 
}