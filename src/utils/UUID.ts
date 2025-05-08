export function randomUUID(defaultUUID?: any){
  return defaultUUID
    ? (defaultUUID ^  Math.random() * 16 >> defaultUUID/4 ).toString(16) 
    : ( [1e10] + `1e10` + 1e9 ).replace(/[01]/g, randomUUID)
}