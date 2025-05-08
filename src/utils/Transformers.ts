function convertArrayToTurples(items: Array<any>, size=2) {
    return items.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(items.slice(i, i + size))
      return acc
    }, [])
}

type Sorter = (a: any, b:any) => number

function orderObj(unordered: any, sorter: Sorter) {
  return Object.keys(unordered)
    .sort((a: any, b: any) => sorter(a, b))
    .reduce((obj: any, key: any) => { 
        obj[key] = unordered[key]; 
        return obj;
      }, {}
  )
}

export default {
  convertArrayToTurples,
  orderObj
}