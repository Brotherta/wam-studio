import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { initializeWamHost } from "./webaudiomodules/sdk/index.js";
await new Promise(resolve => {
    const action = () => {
        document.removeEventListener("click", action);
        resolve();
    };
    document.addEventListener("click", action);
});
// Create host
const context = new AudioContext();
const [groupId, groupKey] = await initializeWamHost(context);
// Create WAM
/** @ts-ignore */
const WAM = (await import("./index.js")).default;
console.log(WAM);
const pedalboard = await WAM.createInstance(groupId, context);
pedalboard.audioNode.connect(context.destination);
// Load library
const descriptor = await importPedalboard2Library(import.meta.resolve("./library.json"));
const library = await resolvePedalboard2Library(descriptor);
pedalboard.audioNode.library.value = library;
// Create GUI
const gui = await pedalboard.createGui();
document.getElementById("pedalboard")?.replaceWith(gui);
// Create and connect piano WAM
let piano;
{
    // @ts-ignore
    const constructor = (await import("https://mainline.i3s.unice.fr/wam2/packages/simpleMidiKeyboard/index.js")).default;
    piano = await constructor.createInstance(groupId, context);
    document.getElementById("piano")?.replaceWith(await piano.createGui());
    piano.audioNode.connect(pedalboard.audioNode);
    piano.audioNode.connectEvents(pedalboard.audioNode.instanceId);
}
// Connect player
const player = document.getElementById("player");
context.createMediaElementSource(player).connect(pedalboard.audioNode);
