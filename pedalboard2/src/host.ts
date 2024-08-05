import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import Pedalboard2WAM from "./Pedalboard2WAM.js";
import { initializeWamHost } from "./webaudiomodules/sdk/index.js";

// Create host
const context=new AudioContext()
const [groupId,groupKey]=await initializeWamHost(context)

// Create WAM
/** @ts-ignore */
const WAM= (await import("./index.js")).default as typeof Pedalboard2WAM
console.log(WAM)
const pedalboard=await WAM.createInstance(groupId,context) as Pedalboard2WAM

// Load library
const descriptor= await importPedalboard2Library(import.meta.resolve("./library.json"))
const library= await resolvePedalboard2Library(descriptor)
pedalboard.audioNode.library.value=library

// Create GUI
const gui= await pedalboard.createGui()
document.getElementById("pedalboard")?.replaceWith(gui)
