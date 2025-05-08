export function delayPromise(milisec: number) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}