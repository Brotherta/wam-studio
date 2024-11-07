import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class CompressorGuitarixGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this.style.display = "inline-flex";

    this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:rgb(128, 128, 128) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/metal6.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0.909091px solid rgb(73, 73, 73);bottom:259.787px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:372.486px;hyphens:manual;inset:58.2812px 659.467px 259.787px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:659.467px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.2812px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:340px;x:0px;y:0px;zoom:1;};</style>
<div id="CompressorGuitarix" class="resize-drag my-pedal gradiant-target" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 340.007px; position: relative; top: 0px; left: 0px; height: 372.486px; transform: translate(0px, 0px); background-image: url(&quot;./img/background/metal6.jpg&quot;);" data-x="0" data-y="0"><div id="CompressorGuitarix" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: none; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 102px; position: absolute; top: 33px; left: 136.5px; height: 583px;"></div><div id="CompressorGuitarix" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: none; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 86px; position: absolute; top: 69px; left: 144.5px; height: 140.5px;"></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 105px; left: 148.5px; width: 52px; height: 102.5px; transform: translate(-4.88727px, 7.30159px);" data-x="-4.88726806640625" data-y="7.3015899658203125"><webaudio-knob id="/CompressorGuitarix/Compressor/3-gain/Makeup_Gain" src="./img/knobs/simplegray.png" sprites="100" min="-96" max="96" step="0.1" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -2184px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1001.56px; top: -36.3168px;">-15.0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 213.5px; left: 164.234px; width: 52px; height: 78.5px; transform: translate(10.5234px, -188.638px);" data-x="10.52337646484375" data-y="-188.63783264160156"><webaudio-knob id="/CompressorGuitarix/Compressor/Attack" src="./img/knobs/simplegray.png" sprites="100" min="0" max="1" step="0.001" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -4940px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1000.33px; top: -36.3168px;">0.952</div>
</webaudio-knob></div><div class="drag target-style" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 294px; left: 158.516px; width: 52px; height: 78.5px; transform: translate(94.7283px, -180.522px);" data-x="94.72830200195312" data-y="-180.52220153808594"><webaudio-knob id="/CompressorGuitarix/Compressor/Dry/Wet" src="./img/knobs/simplegray.png" sprites="100" min="0" max="1" step="0.01" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); outline: none; width: 52px; height: 52px; background-position: 0px -5200px; background-size: 52px 5252px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.39px; top: -36.3168px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 374.5px; left: 145.5px; width: 52px; height: 78.5px; transform: translate(-98.0398px, -262.708px);" data-x="-98.03976440429688" data-y="-262.70848083496094"><webaudio-knob id="/CompressorGuitarix/Compressor/Knee" src="./img/knobs/simplegray.png" sprites="100" min="0" max="20" step="0.1" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -4888px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1002.48px; top: -36.3168px;">18.9</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 374.5px; left: 189.5px; width: 52px; height: 78.5px; transform: translate(-167.736px, -352.414px);" data-x="-167.73593139648438" data-y="-352.4136199951172"><webaudio-knob id="/CompressorGuitarix/Compressor/Ratio" src="./img/knobs/simplegray.png" sprites="100" min="1" max="20" step="0.1" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -4524px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.39px; top: -36.3168px;">17.6</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 455px; left: 159.148px; width: 52px; height: 78.5px; transform: translate(95.7399px, -431.01px);" data-x="95.73989868164062" data-y="-431.0103225708008"><webaudio-knob id="/CompressorGuitarix/Compressor/Release" src="./img/knobs/simplegray.png" sprites="100" min="0" max="10" step="0.01" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -5200px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1000.33px; top: -36.3168px;">10.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 535.5px; left: 151.07px; width: 52px; height: 78.5px; transform: translate(-53.7362px, -512.22px);" data-x="-53.736175537109375" data-y="-512.219856262207"><webaudio-knob id="/CompressorGuitarix/Compressor/Threshold" src="./img/knobs/simplegray.png" sprites="100" min="-96" max="10" step="0.1" width="52" height="52" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/simplegray.png&quot;); background-size: 52px 5252px; outline: none; width: 52px; height: 52px; background-position: 0px -4784px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1006.45px; top: -36.3168px;">2.4</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 534px; left: 242.5px; width: 66px; height: 80px; transform: translate(-106.502px, -309.871px);" data-x="-106.50180053710938" data-y="-309.8712158203125"><webaudio-switch id="/CompressorGuitarix/bypass" src="./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><label for="CompressorGuitarix" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 230px; left: 2px; top: 4.28125px; transform: translate(58.9077px, 280.513px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 27px;" class="drag" contenteditable="false" data-x="58.90765380859375" data-y="280.513427734375" font="Finger Paint">GCCompressor</label><label for="Compressor" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 141.5px; top: 40.2812px; border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" font="Finger Paint">Compressor</label><label for="3-gain" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 149.5px; top: 76.2812px; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px; transform: translate(81.5188px, 218.628px); border: none;" class="drag" contenteditable="false" font="Finger Paint" data-x="81.51882934570312" data-y="218.6278533935547">3-gain</label><label for="Makeup Gain" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 110px; left: 151.5px; top: 154.781px; transform: translate(-29.4418px, 14.9388px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="-29.44183349609375" data-y="14.93878173828125" font="Finger Paint">Makeup Gain</label><label for="Attack" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 167.234px; top: 263.281px; transform: translate(1.74521px, -186.961px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="1.745208740234375" data-y="-186.96058654785156" font="Finger Paint">Attack</label><label for="Dry/Wet" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 161.516px; top: 343.781px; transform: translate(86.7081px, -174.347px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="86.70806884765625" data-y="-174.34744262695312" font="Finger Paint">Dry/Wet</label><label for="Knee" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 148.5px; top: 424.281px; transform: translate(-106.709px, -255.001px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="-106.7093505859375" data-y="-255.0013427734375" font="Finger Paint">Knee</label><label for="Ratio" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 192.5px; top: 424.281px; transform: translate(-174.069px, -348.032px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="-174.06939697265625" data-y="-348.0322265625" font="Finger Paint">Ratio</label><label for="Release" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 162.148px; top: 504.781px; transform: translate(82.8695px, -428.101px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="82.8695068359375" data-y="-428.10084533691406" font="Finger Paint">Release</label><label for="Threshold" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 120px; left: 154.07px; top: 585.281px; transform: translate(-89.6943px, -508.991px); border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" data-x="-89.69430541992188" data-y="-508.9911804199219" font="Finger Paint">Threshold</label><label for="bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 245.5px; top: 585.281px; border: none; -webkit-text-stroke-color: rgb(8, 8, 8); color: rgb(244, 230, 78); font-family: &quot;Finger Paint&quot;; font-size: 16px;" class="drag" contenteditable="false" font="Finger Paint">bypass</label></div>`;

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
    this._root.getElementById(
      "/CompressorGuitarix/Compressor/3-gain/Makeup_Gain",
    ).value = this._plug.audioNode.getParamValue(
      "/CompressorGuitarix/Compressor/3-gain/Makeup_Gain",
    );

    this._root.getElementById("/CompressorGuitarix/Compressor/Attack").value =
      this._plug.audioNode.getParamValue(
        "/CompressorGuitarix/Compressor/Attack",
      );

    this._root.getElementById("/CompressorGuitarix/Compressor/Dry/Wet").value =
      this._plug.audioNode.getParamValue(
        "/CompressorGuitarix/Compressor/Dry/Wet",
      );

    this._root.getElementById("/CompressorGuitarix/Compressor/Knee").value =
      this._plug.audioNode.getParamValue("/CompressorGuitarix/Compressor/Knee");

    this._root.getElementById("/CompressorGuitarix/Compressor/Ratio").value =
      this._plug.audioNode.getParamValue(
        "/CompressorGuitarix/Compressor/Ratio",
      );

    this._root.getElementById("/CompressorGuitarix/Compressor/Release").value =
      this._plug.audioNode.getParamValue(
        "/CompressorGuitarix/Compressor/Release",
      );

    this._root.getElementById(
      "/CompressorGuitarix/Compressor/Threshold",
    ).value = this._plug.audioNode.getParamValue(
      "/CompressorGuitarix/Compressor/Threshold",
    );

    this._root.getElementById("/CompressorGuitarix/bypass").value =
      1 - this._plug.audioNode.getParamValue("/CompressorGuitarix/bypass");

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
      .getElementById("/CompressorGuitarix/Compressor/3-gain/Makeup_Gain")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/3-gain/Makeup_Gain",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Attack")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Attack",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Dry/Wet")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Dry/Wet",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Knee")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Knee",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Ratio")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Ratio",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Release")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Release",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CompressorGuitarix/Compressor/Threshold")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/Compressor/Threshold",
          e.target.value,
        ),
      );
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/CompressorGuitarix/bypass")
      .addEventListener("change", (e) =>
        this._plug.audioNode.setParamValue(
          "/CompressorGuitarix/bypass",
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
  customElements.define("wap-compressorguitarix", CompressorGuitarixGui);
  console.log("Element defined");
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
