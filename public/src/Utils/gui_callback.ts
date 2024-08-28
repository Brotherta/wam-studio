/**
 * A collection of utility functions for working with user interfaces, callbacks, and promise.
 * @autor Samuel DEMONT
 */

/**
 * Call a callback every interval until it returns false.
 * @param interval The interval in milliseconds.
 * @param callback The callback to call.
 * @returns A promise that resolves when the callback returns false.
 */
export function loopOn(interval: number, callback: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        const loop = () => {
            try{
                if(callback()) setTimeout(loop, interval)
                else resolve()
            }
            catch(e){
                reject(e)
            }
        }
        loop();
    })
}


/**
 * Return a promise that resolves after a timeout.
 * @param time The time in milliseconds.
 * @returns A promise that resolves after the timeout.
 */
export function waitUntil(time: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time)
    })
}


/**
 * Return a promise that resolves after an event is fired on an element.
 * @param element The element to listen to.
 * @param eventType The event type to listen for.
 * @returns A promise that resolves with the event.
 */
export function waitForHTMLEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventType: K): Promise<HTMLElementEventMap[K]> {
    return new Promise((resolve, reject) => {
        element.addEventListener(eventType, (e) => resolve(e), {once: true})
    })
}

/**
 * Return a promise that resolves after an event is fired on an element.
 * @param element The element to listen to.
 * @param eventType The event type to listen for.
 * @returns A promise that resolves with the event.
 */
export function waitForEvent<K extends keyof GlobalEventHandlersEventMap>(element: GlobalEventHandlers, eventType: K): Promise<GlobalEventHandlersEventMap[K]> {
    return new Promise((resolve, reject) => {
        element.addEventListener(eventType, (e) => resolve(e), {once: true})
    })
}

/**
 * Create a function that create a process that ticks every interval and stop after a timeout
 * or keep on if the function is called again before the timeout.
 * If the tick callback return true, the timeout is reset like if the function was called.
 * @param interval The interval in milliseconds between each tick.
 * @param timeout The timeout in milliseconds before the process stops.
 * @param start The callback called at the start.
 * @param tick The callback called at each tick.
 * @param stop The callback called on timeout.
 */
export function keptOnInterval(interval: number, timeout: number, tick:()=>void|true, start?:()=>void, stop?:()=>void){
    let timeoutId: NodeJS.Timeout|null= null
    let intervalId: NodeJS.Timeout|null = null
    
    return function fn(){
        // Start
        if(intervalId==null){
            if(start)start()
            intervalId= setInterval(()=>{
                const forceReset= tick()
                if(forceReset===true)fn()
            },interval)
        }

        // Timeout
        if(timeoutId!=null) clearTimeout(timeoutId)
        timeoutId= setTimeout(()=>{
            if(stop)stop()
            timeoutId=null
            if(intervalId!=null){
                clearInterval(intervalId)
                intervalId=null
            }
        },timeout)
    }
}

/**
 * Decorate a function that ignores calls if the function has been called less than a specified time ago.
 * @param callback The function to decorate.
 * @param delay The time in milliseconds to wait before calling the function again.
 * @returns 
 */
export function throttle<T extends Array<any>>(callback: (...args:T)=>void, delay: number) {
    let timeoutId: NodeJS.Timeout|null= null
    let lastTime=0
    return function (...args:T) {
        let now=Date.now()
        if(now-delay>lastTime){
            lastTime=now
            callback(...args)
        }
    };
}