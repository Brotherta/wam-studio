import '../../utils/webaudio-controls.js';

      const getBaseURL = () => {
        const base = new URL('.', import.meta.url);
        return `${base}`;
      };
      export default class CompressorGuitarixGui extends HTMLElement {
              constructor(plug) {
                 
        super();
            this._plug = plug;
            this._plug.gui = this;
        console.log(this._plug);
          
        this._root = this.attachShadow({ mode: 'open' });
        this.style.display = "inline-flex";
        this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:rgb(128, 128, 128) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/metal6.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0.909091px solid rgb(73, 73, 73);bottom:287.749px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:349.766px;hyphens:manual;inset:58.4972px 687.251px 287.749px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:687.251px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.4972px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:314.034px;x:0px;y:0px;zoom:1;};</style>
<div id="CompressorGuitarix" class="resize-drag my-pedal gradiant-target" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 314.034px; position: relative; top: 0px; left: 0px; height: 349.771px; transform: translate(0px, 0px); background-image: url(&quot;./img/background/metal6.jpg&quot;);" data-x="0" data-y="0"><div id="CompressorGuitarix" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: none; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; border-radius: 15px; background-color: transparent; touch-action: none; width: 85.9943px; position: absolute; top: 32.8835px; left: 4.98863px; height: 140.455px; background-image: url(&quot;./img/background/metal14.jpg&quot;); transform: translate(198.586px, 225.547px);" data-x="198.58590698242188" data-y="225.54715728759766"></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 68.777px; left: 8.88635px; width: 51px; height: 102.663px; transform: translate(176.327px, 30.8408px);" data-x="176.32675170898438" data-y="30.84075927734375"><webaudio-knob id="/CompressorGuitarix/3-gain/Makeup_Gain" src="./img/knobs/simplegray.png" sprites="100" min="-96" max="96" step="0.1" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -5100px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1002.89px; top: -36.3168px;">96.0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 177.328px; left: 2.73579px; width: 51px; height: 78.6648px; transform: translate(160.62px, -158.21px);" data-x="160.62042236328125" data-y="-158.2104949951172"><webaudio-knob id="/CompressorGuitarix/Attack" src="./img/knobs/simplegray.png" sprites="100" min="0" max="1" step="0.001" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -5100px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 999.83px; top: -36.3168px;">1.000</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 177.328px; left: 53.2472px; width: 51px; height: 78.6648px; transform: translate(17.6566px, -75.5198px);" data-x="17.656646728515625" data-y="-75.51979064941406"><webaudio-knob id="/CompressorGuitarix/Knee" src="./img/knobs/simplegray.png" sprites="100" min="0" max="20" step="0.1" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -3672px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1002.89px; top: -36.3168px;">14.4</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 257.982px; left: 27.9915px; width: 51px; height: 78.6648px; transform: translate(1.90308px, -237.8px);" data-x="1.903076171875" data-y="-237.79978942871094"><webaudio-knob id="/CompressorGuitarix/Ratio" src="./img/knobs/simplegray.png" sprites="100" min="1" max="20" step="0.1" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -5100px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 998.384px; top: -36.3168px;">20.0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 338.635px; left: 19.6392px; width: 51px; height: 78.6648px; transform: translate(211.797px, -322.786px);" data-x="211.7965087890625" data-y="-322.78589630126953"><webaudio-knob id="/CompressorGuitarix/Release" src="./img/knobs/simplegray.png" sprites="100" min="0" max="10" step="0.01" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -5100px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 999.83px; top: -36.3168px;">10.00</div>
</webaudio-knob></div><div class="drag target-style" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 419.288px; left: 11.5639px; width: 51px; height: 78.6648px; transform: translate(84.3221px, -402.246px);" data-x="84.32211303710938" data-y="-402.24629974365234"><webaudio-knob id="/CompressorGuitarix/Threshold" src="./img/knobs/simplegray.png" sprites="100" min="-96" max="10" step="0.1" width="51" height="51" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -5100px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1002.89px; top: -36.3168px;">10.0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 499.942px; left: 15.9957px; width: 65.9872px; height: 80.2557px; transform: translate(96.264px, -307.639px);" data-x="96.26397705078125" data-y="-307.6394348144531"><webaudio-switch id="/CompressorGuitarix/bypass" src="./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><label for="CompressorGuitarix" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 310px; left: 1.89488px; top: 4.39346px; transform: translate(2.62473px, 242.828px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;; font-size: 33px;" class="drag" contenteditable="false" data-x="2.624725341796875" data-y="242.82803344726562" font="Gloria Hallelujah">GCompressor</label><label for="3-gain" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 82.1875px; left: 9.78551px; top: 40.1818px; border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" font="Gloria Hallelujah">3-gain</label><label for="Makeup Gain" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 100px; left: 11.7741px; top: 118.839px; transform: translate(149.631px, 31.4506px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="149.630859375" data-y="31.450637817382812" font="Gloria Hallelujah">Makeup Gain</label><label for="Attack" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 130px; left: 5.62357px; top: 227.391px; transform: translate(122.659px, -154.335px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="122.65879821777344" data-y="-154.33460998535156" font="Gloria Hallelujah">Attack</label><label for="Knee" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 56.1349px; top: 227.391px; transform: translate(22.3262px, -76.2469px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="22.326171875" data-y="-76.2469482421875" font="Gloria Hallelujah">Knee</label><label for="Ratio" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 120px; left: 30.8793px; top: 308.044px; transform: translate(-38.2612px, -236.247px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="-38.261199951171875" data-y="-236.24667358398438" font="Gloria Hallelujah">Ratio</label><label for="Release" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 130px; left: 22.527px; top: 388.697px; transform: translate(169.121px, -316.648px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="169.12115478515625" data-y="-316.6483459472656" font="Gloria Hallelujah">Release</label><label for="Threshold" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 90px; left: 14.4517px; top: 469.351px; transform: translate(61.5662px, -396.79px); border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" data-x="61.566192626953125" data-y="-396.7900390625" font="Gloria Hallelujah">Threshold</label><label for="bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 63.9986px; left: 18.8835px; top: 551.595px; border: none; color: rgb(226, 255, 5); font-family: &quot;Gloria Hallelujah&quot;;" class="drag" contenteditable="false" font="Gloria Hallelujah">bypass</label></div>`;
  
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
        this._root.getElementById('/CompressorGuitarix/3-gain/Makeup_Gain').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/3-gain/Makeup_Gain');
        

        this._root.getElementById('/CompressorGuitarix/Attack').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/Attack');
        

        this._root.getElementById('/CompressorGuitarix/Knee').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/Knee');
        

        this._root.getElementById('/CompressorGuitarix/Ratio').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/Ratio');
        

        this._root.getElementById('/CompressorGuitarix/Release').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/Release');
        

        this._root.getElementById('/CompressorGuitarix/Threshold').value = this._plug.audioNode.getParamValue('/CompressorGuitarix/Threshold');
        

          this._root.getElementById('/CompressorGuitarix/bypass').value = 1 - this._plug.audioNode.getParamValue('/CompressorGuitarix/bypass');
         
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
                 this._root.getElementById("/CompressorGuitarix/3-gain/Makeup_Gain").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/3-gain/Makeup_Gain", e.target.value));
this._root.getElementById("/CompressorGuitarix/Attack").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/Attack", e.target.value));
this._root.getElementById("/CompressorGuitarix/Knee").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/Knee", e.target.value));
this._root.getElementById("/CompressorGuitarix/Ratio").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/Ratio", e.target.value));
this._root.getElementById("/CompressorGuitarix/Release").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/Release", e.target.value));
this._root.getElementById("/CompressorGuitarix/Threshold").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/Threshold", e.target.value));

              }
          
              setSliders() {
                 
              }
          
              setSwitches() {
                 this._root.getElementById("/CompressorGuitarix/bypass").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/CompressorGuitarix/bypass", 1 - e.target.value));

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
          customElements.define('wap-compressorguitarix', 
                                CompressorGuitarixGui);
          
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      