/**
 * Simple key press detection functions, that correct some of the issues with the default key press detection.
 */

let keyMap: {[key:string]:boolean} = {}

function onDown(event: KeyboardEvent){
    // If the user is typing in an input, don't trigger the key press
    if (event.target != document.body) return;
    if(!keyMap[event.key]){
        keyMap[event.key] = true
        for(const i in onKeyDownMap) onKeyDownMap[i](event.key)
    }
}
document.addEventListener('keydown', onDown)

function onUp(event: KeyboardEvent){
    if(keyMap[event.key]){
        delete keyMap[event.key]
        for(const i in onKeyUpMap) onKeyUpMap[i](event.key)
    }
}
document.addEventListener('keyup', onUp)

function onBlur(){
    for(const key in keyMap){
        delete keyMap[key]
        for(const i in onKeyUpMap) onKeyUpMap[i](key)
    }
}
window.addEventListener('blur', onBlur)

let onKeyDownCounter = 0
const onKeyDownMap: {[key:string]:(key:string)=>void} = {}

let onKeyUpCounter = 0
const onKeyUpMap: {[key:string]:(key:string)=>void} = {}

/**
 * Check if a key is pressed
 * @param key The key to check, same as the event.key
 * @returns 
 */
export function isKeyPressed(key: string): boolean{
    return !!keyMap[key]
}

/**
 * Register an callback to be called when a key is pressed
 * @param callback The callback to be called, the key pressed is passed as an argument, same as the event.key
 * @returns The callback id, used to unregister the callback
 */
export function registerOnKeyDown(callback: (key:string)=>void): number{
    onKeyDownMap[onKeyDownCounter] = callback
    return onKeyDownCounter++
}

/**
 * Unregister a callback
 * @param id The callback id to unregister
 */
export function unregisterOnKeyDown(id: number){
    delete onKeyDownMap[id]
}

/**
 * Register an callback to be called when a key is released
 * @param callback The callback to be called, the key released is passed as an argument, same as the event.key
 * @returns 
 */
export function registerOnKeyUp(callback: (key:string)=>void): number{
    onKeyUpMap[onKeyUpCounter] = callback
    return onKeyUpCounter++
}

/**
 * Remove a callback
 * @param id The callback id to remove
 */
export function unregisterOnKeyUp(id: number){
    delete onKeyUpMap[id]
}