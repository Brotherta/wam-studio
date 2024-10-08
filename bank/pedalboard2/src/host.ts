import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import Pedalboard2WAM from "./Pedalboard2WAM.js";
import { doc } from "./Utils/dom.js";
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
const WAM= (await import("./index.js")).default as typeof Pedalboard2WAM
const pedalboard=await WAM.createInstance(groupId,context) as Pedalboard2WAM
pedalboard.audioNode.connect(context.destination)

// Create GUI
const gui= await pedalboard.createGui()
document.getElementById("pedalboard")?.replaceWith(gui)

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

// Automate
{
    const getParam= document.getElementById("param-get") as HTMLInputElement
    const paramList= document.getElementById("param-list") as HTMLSelectElement
    const paramValue= document.getElementById("param-value") as HTMLInputElement
    const setParam= document.getElementById("param-set") as HTMLInputElement
    const paramInfo= document.getElementById("param-info") as HTMLDivElement

    getParam.onclick= async()=>{
        const params= await pedalboard.audioNode.getParameterInfo()
        paramList.replaceChildren()
        console.log(params)
        paramList.appendChild(doc`<option value="_DEFAULT_">~ Select Param ~</option>`)
        for(const [id,infos] of Object.entries(params))paramList.appendChild(doc`<option value="${id}">${infos.label}</option>`)
        paramInfo.textContent=""
    }

    paramList.onchange= async()=>{
        const id= paramList.value
        setParam.onclick=null
        if(id==="_DEFAULT_"){
            paramInfo.textContent=""
        }
        else{
            const params= await pedalboard.audioNode.getParameterInfo(id)
            const param= params[id]
            paramInfo.textContent=`[${param.id}] ${param.label} (en ${param.units})`
            setParam.onclick= ()=>{
                pedalboard.audioNode.scheduleEvents({
                    type: "wam-automation",
                    time: context.currentTime,
                    data:{
                        id: param.id,
                        normalized: true,
                        value: parseFloat(paramValue.value)
                    }
                })
            }
        }
    }

}

// Load library
console.log("> Importing Descriptor")
// Get the base URL of the current module

const libraryURL = new URL('./library.json', import.meta.url).href;
const libraryDescriptor= await importPedalboard2Library(libraryURL);
const library= await resolvePedalboard2Library(libraryDescriptor)
pedalboard.audioNode.library.value=library
