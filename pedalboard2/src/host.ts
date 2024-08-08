import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import Pedalboard2WAM from "./Pedalboard2WAM.js";
import { WamNode, WebAudioModule } from "./webaudiomodules/api";
import { initializeWamHost } from "./webaudiomodules/sdk/index.js";

await new Promise<void>(resolve=>{
    const action=()=>{
        document.removeEventListener("click",action)
        resolve()
    }
    document.addEventListener("click",action)
})

// Create host
const context=new AudioContext()
const [groupId,groupKey]=await initializeWamHost(context)

// Create WAM
/** @ts-ignore */
console.log("> Importing WAM")
const WAM= (await import("./index.js")).default as typeof Pedalboard2WAM
console.log(WAM)
const pedalboard=await WAM.createInstance(groupId,context) as Pedalboard2WAM
pedalboard.audioNode.connect(context.destination)

// Create GUI
console.log("> Create GUI")
const gui= await pedalboard.createGui()
document.getElementById("pedalboard")?.replaceWith(gui)

// Load library
console.log("> Importing Descriptor")
const descriptor= await importPedalboard2Library(import.meta.resolve("./library.json"))
console.log("> Resovle descriptor")
const library= await resolvePedalboard2Library(descriptor)
pedalboard.audioNode.library.value=library
console.log(descriptor,library)

// Create and connect piano WAM
let piano: WebAudioModule<WamNode>
{
    // @ts-ignore
    const constructor= (await import("https://mainline.i3s.unice.fr/wam2/packages/simpleMidiKeyboard/index.js")).default
    piano= await constructor.createInstance(groupId,context)
    document.getElementById("piano")?.replaceWith(await piano.createGui())
    piano.audioNode.connect(pedalboard.audioNode)
    piano.audioNode.connectEvents(pedalboard.audioNode.instanceId)
}

// Connect player
const player= document.getElementById("player") as HTMLAudioElement
context.createMediaElementSource(player).connect(pedalboard.audioNode)

document.addEventListener("keypress",async e=>{
    console.log(e.key)
    if(e.key==="a"){
        console.log(await JSON.stringify(await pedalboard.audioNode.getState()))
    }
})