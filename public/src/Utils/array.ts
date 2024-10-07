
/**
 * Search for the last element in an array that satisfies a test function.
 * Should be used on arrays that contains only elements that satisfy the test function then
 * only elements that don't satisfy the test function.
 * @param array 
 * @param test 
 * @returns 
 */
export function binaryFindLast<T>(array: T[], test: (it:T)=>boolean): number{
    let min = -1
    let max = array.length-1
    while (min < max) {
        let offset= Math.ceil((max-min)/2)
        if(test(array[min+offset]))min+=offset
        else max-=offset
    }
    return min
}

/**
 * Search for the first element in an array that satisfies a test function.
 * Should be used on arrays that contains only elements that don't satisfy the test function then
 * only elements that satisfy the test function.
 */
export function binaryFindFirst<T>(array: T[], test: (it:T)=>boolean): number{
    let it = binaryFindLast(array, it=>!test(it))
    if(it==array.length-1)return -1
    return it+1
}