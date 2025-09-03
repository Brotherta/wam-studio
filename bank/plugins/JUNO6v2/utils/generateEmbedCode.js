function generateEmbedCode(url) {
    let embedCode = `<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Simple host that loads a non bundled plugin</title>
</head>
<body>
<main>
<audio id="player" src="https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3" controls
loop crossOrigin="anonymous">
</audio>
<div id="mount"></div>
</main>
<script>
const player = document.querySelector('#player');
const mount = document.querySelector('#mount');
const AudioContext = window.AudioContext // Default
|| window.webkitAudioContext 
|| false;
const audioContext = new AudioContext();
const mediaElementSource = audioContext.createMediaElementSource(player);

// Very simple function to connect the plugin audionode to the host
const connectPlugin = (audioNode) => {
mediaElementSource.connect(audioNode);
audioNode.connect(audioContext.destination);
};
const mountPlugin = (domNode) => {
mount.innerHtml = '';
mount.appendChild(domNode);
};
(async () => {
// Init WamEnv
const { default: initializeWamHost } = await import("https://www.webaudiomodules.com/sdk/2.0.0-alpha.6/src/initializeWamHost.js");
const [hostGroupId] = await initializeWamHost(audioContext);
// Import WAM
const { default: WAM } = await import('`+url+`');
// Create a new instance of the plugin
const instance = await WAM.createInstance(hostGroupId, audioContext);
window.instance = instance;
// Connect the audionode to the host
connectPlugin(instance.audioNode);
const pluginDomNode = await instance.createGui();

mountPlugin(pluginDomNode);
player.onplay = () => {
    audioContext.resume(); // audio context must be resumed because browser restrictions
};
})();
<\/script>
</body>
</html>` ;
    //<iframe src="${url}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`; 
    document.getElementById('embedCode').value = embedCode;
    let boxContent=document.getElementById('embedCode');
    boxContent.select();
    document.execCommand('Copy');
}