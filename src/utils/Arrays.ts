/**
 * A function that remove duplicates from an array
 * 
 * @param arr list of items with possible duplicates
 * @param iteratee a key or list of keys to be used to remove duplicates
 * @returns list of unique items
 */
export function uniqueBy(arr: any[], iteratee: string | string[]) {
  return [...new Map(arr.filter(Boolean).map(item => {
    const uniqueKey = Array.isArray(iteratee) 
      ? iteratee.map(k => item[k]).join('_')
      : item[iteratee]
    return [uniqueKey, item]
  })).values()]
}

/**
 * Joins items in an array with commas and an "and" for the last element.
 * 
 * @param arr - The array of items to join.
 * @returns The joined string.
 * 
 * @example 
 * const fruits = ['apple', 'banana', 'cherry', 'date'];
 * const result = joinWithCommasAnd(fruits);
 * console.log(result); 
 * // Output: "apple, banana, cherry and date"
 */
export function joinWithCommasAnd(arr: Array<any>): string {
  const length = arr.length;
  if (length === 0) return '';
  if (length === 1) return arr[0];
  return `${arr.slice(0, length - 1).join(', ')} and ${arr[length - 1]}`;
}
