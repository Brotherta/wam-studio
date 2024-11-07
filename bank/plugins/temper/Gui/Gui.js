import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class temperGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>
    .my-pedal {
      animation: none 0s ease 0s 1 normal none running;
      appearance: none;
      background: rgb(128, 128, 128)
        url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/metal6.jpg") repeat
        scroll 0% 0% / 100% 100% padding-box border-box;
      border: 1px dashed rgb(73, 73, 73);
      bottom: 183px;
      clear: none;
      clip: auto;
      color: rgb(33, 37, 41);
      columns: auto auto;
      contain: none;
      content: normal;
      cursor: auto;
      cx: 0px;
      cy: 0px;
      d: none;
      direction: ltr;
      display: block;
      fill: rgb(0, 0, 0);
      filter: none;
      flex: 0 1 auto;
      float: none;
      font: 16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
        sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      gap: normal;
      grid: none / none / none / row / auto / auto;
      height: 400px;
      hyphens: manual;
      inset: 59px 780px 183px 212px;
      isolation: auto;
      left: 212px;
      margin: 2px;
      marker: none;
      mask: none;
      offset: none 0px auto 0deg;
      opacity: 1;
      order: 0;
      orphans: 2;
      outline: rgb(33, 37, 41) none 0px;
      overflow: visible;
      padding: 1px;
      page: auto;
      perspective: none;
      position: unset;
      quotes: auto;
      r: 0px;
      resize: none;
      right: 780px;
      rx: auto;
      ry: auto;
      speak: normal;
      stroke: none;
      top: 59px;
      transform: matrix(1, 0, 0, 1, 44.9609, 11.9609);
      transition: all 0s ease 0s;
      visibility: visible;
      widows: 2;
      width: 450px;
      x: 0px;
      y: 0px;
      zoom: 1;
    }
  </style>
  <div id="temper" class="resize-drag my-pedal target-style-container gradiant-target" style="border: 1px dashed rgb(73, 73, 73); text-align: center; display: grid; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 500px; position: relative; top: 0px; left: 0px; height: 300px; transform: none; background-image: url(&quot;////./img/background/metal6.jpg&quot;); /* grid-template-columns: 90% 10%; */ grid-template-rows: 80% 1fr;" data-x="44.960879769945734" data-y="11.960879769945734">
    <div id="grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr;/* height: 100%; */">
      <div style="display: grid; grid-template-rows: repeat(4, 1fr);height: fit-content;align-self: center;">
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="20" data-y="-182">
          <webaudio-knob id="/temper/Cutoff" src="////./img/knobs/knob2.png" sprites="100" min="100" max="20000" step="1" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px -5000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1010.94px; top: -44px;">0</div>
</webaudio-knob>
        </div>
  
        <label for="Cutoff" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="-14.046051701859767" data-y="-161.04605170185982" font="Galada">Cutoff</label>
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="34" data-y="-378">
          <webaudio-knob id="/temper/Resonance" src="////./img/knobs/knob2.png" sprites="100" min="1" max="8" step="0.001" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1000.23px; top: -44px;">0.000</div>
</webaudio-knob>
        </div>
        <label for="Resonance" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="-2" data-y="-347" font="Galada">Resonance</label>
      </div>
      <div style="display: grid; /* grid-template-rows: repeat(6, 1fr); */height: fit-content;">
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="190" data-y="-84">
          <webaudio-knob id="/temper/Curve" src="////./img/knobs/knob2.png" sprites="100" min="0.1" max="4" step="0.001" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px -1150px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
        </div>
  
        <label for="Curve" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="155" data-y="-50" font="Galada">Curve</label>
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="195.96087976994568" data-y="-116.03912023005415">
          <webaudio-knob id="/temper/Drive" src="////./img/knobs/knob2.png" sprites="100" min="-10" max="10" step="0.001" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px -3500px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
        </div>
        <label for="Drive" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="160" data-y="-118" font="Galada">Drive</label>
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="206" data-y="-364">
          <webaudio-knob id="/temper/Saturation" src="////./img/knobs/knob2.png" sprites="100" min="0" max="1" step="0.001" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px -5000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1000.23px; top: -44px;">0.000</div>
</webaudio-knob>
        </div>
        <label for="Saturation" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="167" data-y="-352" font="Galada">Saturation</label>
      </div>
      <div style="display: grid; grid-template-rows: repeat(4, 1fr);height: fit-content;align-self: center;">
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="359" data-y="-315">
          <webaudio-knob id="/temper/Feedback" src="////./img/knobs/knob2.png" sprites="100" min="-60" max="-24" step="1" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
        </div>
        <label for="Feedback" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="331" data-y="-285" font="Galada">Feedback</label>
        <div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          " data-x="357" data-y="-285">
          <webaudio-knob id="/temper/Level" src="////./img/knobs/knob2.png" sprites="100" min="-24" max="24" step="1" width="40" height="40" style="touch-action: none; display: block"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/knob2.png&quot;); background-size:40px 5050px; outline: none; width:40px; height:40px; background-position: 0px -2150px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
        </div>
        <label for="Level" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            width: 128px;
            border: none;
            color: rgb(255, 255, 255);
            font-size: 25px;
            font-family: Galada;
            place-self: center;
          " class="drag" contenteditable="false" data-x="324" data-y="-237" font="Galada">Level</label>
      </div>
    </div>
    <div style="display: flex;align-items: center;justify-content: center;"><label for="temper" style="
    display: block;
    touch-action: none;
    position: static;
    z-index: 1;
    width: 250px;
    border: none;
    font-size: 40px;
    font-family: Galada;
    color: rgb(255, 255, 255);
    place-self: center;
  " class="drag" contenteditable="false" data-x="113" data-y="342" font="Galada">TemperDisto</label><div class="drag" style="
        padding: 1px;
        margin: 1px;
        text-align: center;
        display: inline-block;
        box-sizing: border-box;
        touch-action: none;
        position: static;
        /* width: 74.1719px; */
        /* height: 80px; */
        place-self: center;
      " data-x="172.11973027839076" data-y="386.8340159926764">
      <webaudio-switch id="/temper/99_bypass" src="////./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-switch{
  display:inline-block;
  margin:0;
  padding:0;
  font-family: sans-serif;
  font-size: 11px;
  cursor:pointer;
}
.webaudio-switch-body{
  display:inline-block;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip"></div></div>
</webaudio-switch>
    </div></div>
  
  </div>
  `;
    this.isOn;
    this.state = new Object();
    this.setKnobs();
    this.setSliders();
    this.setSwitches();
    //this.setSwitchListener();
    this.setInactive();
    // Change #pedal to .my-pedal for use the new builder
    this._root.querySelector(".my-pedal").style.transform = "none";
    //this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');

    // Compute base URI of this main.html file. This is needed in order
    // to fix all relative paths in CSS, as they are relative to
    // the main document, not the plugin's main.html
    this.basePath = getBaseURL();
    console.log("basePath = " + this.basePath);

    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePathsInCSS();

    // optionnal : set image background using a relative URI (relative
    // to this file)
    //this.setImageBackground("/img/BigMuffBackground.png");

    // Monitor param changes in order to update the gui
    window.requestAnimationFrame(this.handleAnimationFrame);
  }

  fixRelativeImagePathsInCSS() {
    // change webaudiocontrols relative paths for spritesheets to absolute
    let webaudioControls = this._root.querySelectorAll(
      "webaudio-knob, webaudio-slider, webaudio-switch, img",
    );
    webaudioControls.forEach((e) => {
      let currentImagePath = e.getAttribute("src");
      if (currentImagePath !== undefined) {
        //console.log("Got wc src as " + e.getAttribute("src"));
        let imagePath = e.getAttribute("src");
        e.setAttribute("src", this.basePath + "/" + imagePath);
        //console.log("After fix : wc src as " + e.getAttribute("src"));
      }
    });

    let sliders = this._root.querySelectorAll("webaudio-slider");
    sliders.forEach((e) => {
      let currentImagePath = e.getAttribute("knobsrc");
      if (currentImagePath !== undefined) {
        let imagePath = e.getAttribute("knobsrc");
        e.setAttribute("knobsrc", this.basePath + "/" + imagePath);
      }
    });

    // BMT Get all fonts
    // Need to get the attr font
    let usedFonts = "";
    let fonts = this._root.querySelectorAll("label[font]");
    fonts.forEach((e) => {
      if (!usedFonts.includes(e.getAttribute("font")))
        usedFonts += "family=" + e.getAttribute("font") + "&";
    });
    let link = document.createElement("link");
    link.rel = "stylesheet";
    if (usedFonts.slice(0, -1))
      link.href =
        "https://fonts.googleapis.com/css2?" +
        usedFonts.slice(0, -1) +
        "&display=swap";
    document.querySelector("head").appendChild(link);

    // BMT Adapt for background-image
    let divs = this._root.querySelectorAll("div");
    divs.forEach((e) => {
      if ("background-image" in e.style) {
        let currentImagePath = e.style.backgroundImage.slice(4, -1);
        if (currentImagePath !== undefined) {
          let imagePath = e.style.backgroundImage.slice(5, -2);
          if (imagePath != "")
            e.style.backgroundImage =
              "url(" + this.basePath + "/" + imagePath + ")";
        }
      }
    });
  }

  setImageBackground() {
    // check if the shadowroot host has a background image
    let mainDiv = this._root.querySelector("#main");
    mainDiv.style.backgroundImage =
      "url(" + this.basePath + "/" + imageRelativeURI + ")";

    //console.log("background =" + mainDiv.style.backgroundImage);
    //this._root.style.backgroundImage = "toto.png";
  }

  attributeChangedCallback() {
    console.log("Custom element attributes changed.");
    this.state = JSON.parse(this.getAttribute("state"));
    let tmp = "/PingPongDelayFaust/bypass";

    if (this.state[tmp] == 1) {
      this._root.querySelector("#switch1").value = 0;
      this.isOn = false;
    } else if (this.state[tmp] == 0) {
      this._root.querySelector("#switch1").value = 1;
      this.isOn = true;
    }

    this.knobs = this._root.querySelectorAll(".knob");
    console.log(this.state);

    for (var i = 0; i < this.knobs.length; i++) {
      this.knobs[i].setValue(this.state[this.knobs[i].id], false);
      console.log(this.knobs[i].value);
    }
  }
  handleAnimationFrame = () => {
    this._root.getElementById("/temper/Curve").value =
      this._plug.audioNode.getParamValue("/temper/Curve");

    this._root.getElementById("/temper/Cutoff").value =
      this._plug.audioNode.getParamValue("/temper/Cutoff");

    this._root.getElementById("/temper/Drive").value =
      this._plug.audioNode.getParamValue("/temper/Drive");

    this._root.getElementById("/temper/Feedback").value =
      this._plug.audioNode.getParamValue("/temper/Feedback");

    this._root.getElementById("/temper/Level").value =
      this._plug.audioNode.getParamValue("/temper/Level");

    this._root.getElementById("/temper/Resonance").value =
      this._plug.audioNode.getParamValue("/temper/Resonance");

    this._root.getElementById("/temper/Saturation").value =
      this._plug.audioNode.getParamValue("/temper/Saturation");

    this._root.getElementById("/temper/99_bypass").value =
      1 - this._plug.audioNode.getParamValue("/temper/99_bypass");

    window.requestAnimationFrame(this.handleAnimationFrame);
  };

  get properties() {
    this.boundingRect = {
      dataWidth: {
        type: Number,
        value: null,
      },
      dataHeight: {
        type: Number,
        value: null,
      },
    };
    return this.boundingRect;
  }

  static get observedAttributes() {
    return ["state"];
  }

  setKnobs() {
    this._root
      .getElementById("/temper/Curve")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Curve", e.target.value),
      );
    this._root
      .getElementById("/temper/Cutoff")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Cutoff", e.target.value),
      );
    this._root
      .getElementById("/temper/Drive")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Drive", e.target.value),
      );
    this._root
      .getElementById("/temper/Feedback")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Feedback", e.target.value),
      );
    this._root
      .getElementById("/temper/Level")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Level", e.target.value),
      );
    this._root
      .getElementById("/temper/Resonance")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/temper/Resonance", e.target.value),
      );
    this._root
      .getElementById("/temper/Saturation")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/temper/Saturation",
          e.target.value,
        ),
      );
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/temper/99_bypass")
      .addEventListener("change", (e) =>
        this._plug.audioNode.setParamValue(
          "/temper/99_bypass",
          1 - e.target.value,
        ),
      );
  }

  setInactive() {
    let switches = this._root.querySelectorAll(".switch webaudio-switch");

    switches.forEach((s) => {
      console.log("### SWITCH ID = " + s.id);
      this._plug.audioNode.setParamValue(s.id, 0);
    });
  }
}
try {
  customElements.define("wap-temper", temperGui);
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
