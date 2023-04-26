import '../../utils/webaudio-controls.js'

      const getBaseURL = () => {
        const base = new URL('.', import.meta.url);
        return `${base}`;
      };
      export default class greyholeGui extends HTMLElement {
              constructor(plug) {
                 
        super();
            this._plug = plug;
            this._plug.gui = this;
        console.log(this._plug);
          
        this._root = this.attachShadow({ mode: 'open' });
        this.style.display = "inline-flex";
        this._root.innerHTML = `  <style>
        .my-pedal {
          animation: none 0s ease 0s 1 normal none running;
          appearance: none;
          background: rgb(128, 128, 128)
            url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/flames1.jpg")
            repeat scroll 0% 0% / 100% 100% padding-box border-box;
          border: 1px solid rgb(73, 73, 73);
          bottom: 0px;
          clear: none;
          clip: auto;
          color: white;
          columns: auto auto;
          contain: none;
          content: normal;
          cursor: auto;
          cx: 0px;
          cy: 0px;
          d: none;
          direction: ltr;
          display: inline-block;
          fill: rgb(0, 0, 0);
          filter: none;
          flex: 0 1 auto;
          float: none;
          font: 16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          gap: normal;
          grid: none / none / none / row / auto / auto;
          height: 300px;
          hyphens: manual;
          inset: 0px;
          isolation: auto;
          left: 0px;
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
          right: 0px;
          rx: auto;
          ry: auto;
          speak: normal;
          stroke: none;
          top: 0px;
          transform: none;
          transition: all 0s ease 0s;
          visibility: visible;
          widows: 2;
          width: 300px;
          x: 0px;
          y: 0px;
          zoom: 1;
          text-shadow: #000 5px 0 5px;
        }
      </style>
      <div id="greyhole" class="resize-drag my-pedal gradiant-target" style="border: none; text-align: center; display: flex; flex-direction: column; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 300px; position: relative; top: 0px; left: 0px; height: 300px; background-image: url(&quot;////./img/background/flames1.jpg&quot;); transform: none;">
        <div id="grid" style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            
          height: 80%;">
        <div>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="9.777786254882812" data-y="-108.44448852539062">
            <webaudio-knob id="/greyhole/damping" src="////./img/knobs/lineshadow2.png" sprites="100" min="0" max="0.99" step="0.001" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="damping" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="0.888916015625" data-y="-105.77787780761719" font="Fruktur">damping</label>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="-0.888916015625" data-y="-87.11109161376953">
            <webaudio-knob id="/greyhole/delayTime" src="////./img/knobs/lineshadow2.png" sprites="100" min="0.001" max="1.45" step="0.0001" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -650px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="delayTime" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="2.666656494140625" data-y="-79.11106872558594" font="Fruktur">delayTime</label></div><div>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="99.55557250976562" data-y="-170.66676330566406">
            <webaudio-knob id="/greyhole/diffusion" src="////./img/knobs/lineshadow2.png" sprites="100" min="0" max="0.99" step="0.0001" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -2500px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="diffusion" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="113.77781677246094" data-y="-168.88894653320312" font="Fruktur">diffusion</label>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="114.16256073024181" data-y="-345.8375575253736">
            <webaudio-knob id="/greyhole/feedback" src="////./img/knobs/lineshadow2.png" sprites="100" min="0" max="1" step="0.01" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -4450px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="feedback" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="104.86538180874743" data-y="-341.14756796649954" font="Fruktur">feedback</label>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="208.88890075683594" data-y="-427.5555610656738">
            <webaudio-knob id="/greyhole/modDepth" src="////./img/knobs/lineshadow2.png" sprites="100" min="0" max="1" step="0.001" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -500px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="modDepth" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="210.66656494140625" data-y="-424.8888244628906" font="Fruktur">modDepth</label></div><div>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="211.55557250976562" data-y="-402.6666736602783">
            <webaudio-knob id="/greyhole/modFreq" src="////./img/knobs/lineshadow2.png" sprites="100" min="0" max="10" step="0.01" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -1000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
</webaudio-knob>
          </div><label for="modFreq" style="
            text-align: center;
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 20px;
            font-family: Fruktur;
            place-self: center;
          " class="drag" contenteditable="false" data-x="215.11105346679688" data-y="-399.1111068725586" font="Fruktur">modFreq</label>
          <div class="drag" style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            " data-x="116.44451904296875" data-y="-418.6667957305908">
            <webaudio-knob id="/greyhole/size" src="////./img/knobs/lineshadow2.png" sprites="100" min="0.5" max="3" step="0.0001" width="50" height="50" style="touch-action: none; display: block; height:50px"><style>

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
  height: 50px;
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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/knobs/lineshadow2.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -1000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 997.181px; top: -44px;">0.0000</div>
</webaudio-knob>
          </div><label for="size" style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              border: none;
              font-size: 20px;
              font-family: Fruktur;
              place-self: center;
            " class="drag" contenteditable="false" data-x="82.66647338867188" data-y="-430.22221755981445" font="Fruktur">size</label></div></div><div style="display: flex;justify-content: center;/* align-items: center; */">
            <label for="greyhole" style="
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            font-size: 40px;
            font-family: 'Hanalei Fill';
            place-self: center;
          margin-left: 4rem;" class="drag target-style-label" contenteditable="false" data-x="38.22224426269531" data-y="232.0000820159912" font="Hanalei Fill">greyhole</label><div class="drag" style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          justify-self: flex-end;" data-x="242.1990122225481" data-y="194.6426462557514">
          <webaudio-switch id="/greyhole/bypass" src="////./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;////./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip"></div></div>
</webaudio-switch>
        </div>
</div>
      </div>`;

        this.isOn;
            this.state = new Object();
            this.setKnobs();
            this.setSliders();
            this.setSwitches();
            //this.setSwitchListener();
            this.setInactive();
            // Change #pedal to .my-pedal for use the new builder
            this._root.querySelector('.my-pedal').style.transform = 'none';
            //this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');
  
            // Compute base URI of this main.html file. This is needed in order
            // to fix all relative paths in CSS, as they are relative to
            // the main document, not the plugin's main.html
            this.basePath = getBaseURL();
            console.log("basePath = " + this.basePath)
  
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
              'webaudio-knob, webaudio-slider, webaudio-switch, img'
          );
          webaudioControls.forEach((e) => {
              let currentImagePath = e.getAttribute('src');
              if (currentImagePath !== undefined) {
                  //console.log("Got wc src as " + e.getAttribute("src"));
                  let imagePath = e.getAttribute('src');
                  e.setAttribute('src', this.basePath + '/' + imagePath);
                  //console.log("After fix : wc src as " + e.getAttribute("src"));
              }
          });
  
          let sliders = this._root.querySelectorAll('webaudio-slider');
          sliders.forEach((e) => {
              let currentImagePath = e.getAttribute('knobsrc');
              if (currentImagePath !== undefined) {
                  let imagePath = e.getAttribute('knobsrc');
                  e.setAttribute('knobsrc', this.basePath + '/' + imagePath);
              }
          });

          // BMT Get all fonts
          // Need to get the attr font
          let usedFonts = "";
          let fonts = this._root.querySelectorAll('label[font]');
          fonts.forEach((e) => {
              if(!usedFonts.includes(e.getAttribute("font"))) usedFonts += "family=" + e.getAttribute("font") + "&";
          });
          let link = document.createElement('link');
          link.rel = "stylesheet";
          if(usedFonts.slice(0, -1)) link.href = "https://fonts.googleapis.com/css2?"+usedFonts.slice(0, -1)+"&display=swap";
          document.querySelector('head').appendChild(link);
          
          // BMT Adapt for background-image
          let divs = this._root.querySelectorAll('div');
          divs.forEach((e) => {
              if('background-image' in e.style){
                let currentImagePath = e.style.backgroundImage.slice(4, -1);
                if (currentImagePath !== undefined) {
                    let imagePath = e.style.backgroundImage.slice(5, -2);
                    if(imagePath != "") e.style.backgroundImage = 'url(' + this.basePath + '/' + imagePath + ')';
                }
              }
          });
          
              }
          
              setImageBackground() {
                 
      // check if the shadowroot host has a background image
          let mainDiv = this._root.querySelector('#main');
          mainDiv.style.backgroundImage =
              'url(' + this.basePath + '/' + imageRelativeURI + ')';
  
          //console.log("background =" + mainDiv.style.backgroundImage);
          //this._root.style.backgroundImage = "toto.png";
      
              }
          
              attributeChangedCallback() {
                 
            console.log('Custom element attributes changed.');
            this.state = JSON.parse(this.getAttribute('state'));
        let tmp = '/PingPongDelayFaust/bypass';
        
        if (this.state[tmp] == 1) {
          this._root.querySelector('#switch1').value = 0;
          this.isOn = false;
        } else if (this.state[tmp] == 0) {
          this._root.querySelector('#switch1').value = 1;
          this.isOn = true;
        }
  
        this.knobs = this._root.querySelectorAll('.knob');
        console.log(this.state);
  
        for (var i = 0; i < this.knobs.length; i++) {
          this.knobs[i].setValue(this.state[this.knobs[i].id], false);
          console.log(this.knobs[i].value);
        }
      
              }
          handleAnimationFrame = () => {
        this._root.getElementById('/greyhole/damping').value = this._plug.audioNode.getParamValue('/greyhole/damping');
        

        this._root.getElementById('/greyhole/delayTime').value = this._plug.audioNode.getParamValue('/greyhole/delayTime');
        

        this._root.getElementById('/greyhole/diffusion').value = this._plug.audioNode.getParamValue('/greyhole/diffusion');
        

        this._root.getElementById('/greyhole/feedback').value = this._plug.audioNode.getParamValue('/greyhole/feedback');
        

        this._root.getElementById('/greyhole/modDepth').value = this._plug.audioNode.getParamValue('/greyhole/modDepth');
        

        this._root.getElementById('/greyhole/modFreq').value = this._plug.audioNode.getParamValue('/greyhole/modFreq');
        

        this._root.getElementById('/greyhole/size').value = this._plug.audioNode.getParamValue('/greyhole/size');
        

          this._root.getElementById('/greyhole/bypass').value = 1 - this._plug.audioNode.getParamValue('/greyhole/bypass');
         
window.requestAnimationFrame(this.handleAnimationFrame);
         }
      
              get properties() {
                 
        this.boundingRect = {
            dataWidth: {
              type: Number,
              value: null
            },
            dataHeight: {
              type: Number,
              value: null
            }
        };
        return this.boundingRect;
      
              }
          
              static get observedAttributes() {
                 
        return ['state'];
      
              }
          
              setKnobs() {
                 this._root.getElementById("/greyhole/damping").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/damping", e.target.value));
this._root.getElementById("/greyhole/delayTime").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/delayTime", e.target.value));
this._root.getElementById("/greyhole/diffusion").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/diffusion", e.target.value));
this._root.getElementById("/greyhole/feedback").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/feedback", e.target.value));
this._root.getElementById("/greyhole/modDepth").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/modDepth", e.target.value));
this._root.getElementById("/greyhole/modFreq").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/modFreq", e.target.value));
this._root.getElementById("/greyhole/size").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/size", e.target.value));

              }
          
              setSliders() {
                 
              }
          
              setSwitches() {
                 this._root.getElementById("/greyhole/bypass").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/greyhole/bypass", 1 - e.target.value));

              }
          
              setInactive() {
                 
        let switches = this._root.querySelectorAll(".switch webaudio-switch");
  
        switches.forEach(s => {
          console.log("### SWITCH ID = " + s.id);
          this._plug.audioNode.setParamValue(s.id, 0);
        });
      
              }
          }
      try {
          customElements.define('wap-greyhole', 
                                greyholeGui);
          console.log("Element defined");
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      