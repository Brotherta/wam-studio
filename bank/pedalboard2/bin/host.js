import { importPedalboard2Library, resolvePedalboard2Library } from "./Pedalboard2Library.js";
import { doc } from "./Utils/dom.js";
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
console.log("> Importing WAM");
const WAM = (await import("./index.js")).default;
console.log(WAM);
const pedalboard = await WAM.createInstance(groupId, context);
pedalboard.audioNode.connect(context.destination);
// Create GUI
console.log("> Create GUI");
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
document.addEventListener("keypress", async (e) => {
    console.log(e.key);
    if (e.key === "a") {
        console.log(await JSON.stringify(await pedalboard.audioNode.getState()));
    }
});
// Automate
{
    const getParam = document.getElementById("param-get");
    const paramList = document.getElementById("param-list");
    const paramValue = document.getElementById("param-value");
    const setParam = document.getElementById("param-set");
    const paramInfo = document.getElementById("param-info");
    getParam.onclick = async () => {
        const params = await pedalboard.audioNode.getParameterInfo();
        paramList.replaceChildren();
        console.log(params);
        paramList.appendChild(doc `<option value="_DEFAULT_">~ Select Param ~</option>`);
        for (const [id, infos] of Object.entries(params))
            paramList.appendChild(doc `<option value="${id}">${infos.label}</option>`);
        paramInfo.textContent = "";
    };
    paramList.onchange = async () => {
        const id = paramList.value;
        setParam.onclick = null;
        if (id === "_DEFAULT_") {
            paramInfo.textContent = "";
        }
        else {
            const params = await pedalboard.audioNode.getParameterInfo(id);
            const param = params[id];
            paramInfo.textContent = `[${param.id}] ${param.label} (en ${param.units})`;
            setParam.onclick = () => {
                pedalboard.audioNode.scheduleEvents({
                    type: "wam-automation",
                    time: context.currentTime,
                    data: {
                        id: param.id,
                        normalized: true,
                        value: parseFloat(paramValue.value)
                    }
                });
            };
        }
    };
}
// Load library
console.log("> Importing Descriptor");
const descriptor = await importPedalboard2Library(import.meta.resolve("./library.json"));
console.log("> Resovle descriptor");
const library = await resolvePedalboard2Library(descriptor);
pedalboard.audioNode.library.value = library;
console.log(descriptor, library);
