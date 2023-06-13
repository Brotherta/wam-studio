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
        
        this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:rgb(128, 128, 128) url("http://127.0.0.1:8080/fausteditor/dist/PedalEditor/Front-End/img/background/flames1.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:1px solid rgb(73, 73, 73);bottom:223.711px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:390.555px;hyphens:manual;inset:58.2344px 897.18px 223.711px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:897.18px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.2344px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:266.82px;x:0px;y:0px;zoom:1;};</style>
<div id="greyhole" class="resize-drag my-pedal gradiant-target" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 266.823px; position: relative; top: 0px; left: 0px; height: 390.555px; transform: translate(0px, 0px); background-image: url(&quot;./img/background/flames1.jpg&quot;);" data-x="0" data-y="0"><div id="greyhole" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: none; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 76px; position: absolute; top: 33px; left: 196px; height: 680px;"></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 69px; left: 205.016px; width: 59px; height: 78.5px; transform: translate(-64.6911px, 119.268px);" data-x="-64.69105300231195" data-y="119.26825180725834"><webaudio-knob id="/greyhole/Greyhole/Dry/Wet" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="1" step="0.01" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -1180px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1006.79px; top: -36.5px;">0.20</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 149.5px; left: 202.398px; width: 59px; height: 78.5px; transform: translate(-182.25px, -129.038px);" data-x="-182.2503265136706" data-y="-129.03762153727087"><webaudio-knob id="/greyhole/Greyhole/damping" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="0.99" step="0.001" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -3068px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.73px; top: -36.5px;">0.517</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 230px; left: 200px; width: 59px; height: 78.5px; transform: translate(-179.59px, -124.534px);" data-x="-179.59033203125" data-y="-124.53384399414062"><webaudio-knob id="/greyhole/Greyhole/delayTime" src="./img/knobs/lineshadow2.png" sprites="100" min="0.001" max="1.45" step="0.0001" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -649px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 999.676px; top: -36.5px;">0.1708</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 310.5px; left: 202.5px; width: 59px; height: 78.5px; transform: translate(-102.853px, -291.963px);" data-x="-102.85277963992996" data-y="-291.9630142183804"><webaudio-knob id="/greyhole/Greyhole/diffusion" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="0.99" step="0.0001" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -5428px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 999.676px; top: -36.5px;">0.9202</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 391px; left: 200.328px; width: 59px; height: 78.5px; transform: translate(-99.5844px, -286.842px);" data-x="-99.58441162109375" data-y="-286.842041015625"><webaudio-knob id="/greyhole/Greyhole/feedback" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="1" step="0.01" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -5900px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1005.79px; top: -36.5px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 471.5px; left: 200px; width: 59px; height: 78.5px; transform: translate(-141.803px, -280.268px);" data-x="-141.80300375757082" data-y="-280.26817302840425"><webaudio-knob id="/greyhole/Greyhole/modDepth" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="1" step="0.001" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -5900px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.73px; top: -36.5px;">1.000</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 552px; left: 201.539px; width: 59px; height: 78.5px; transform: translate(-19.9845px, -534.438px);" data-x="-19.984527587890625" data-y="-534.4382400512695"><webaudio-knob id="/greyhole/Greyhole/modFreq" src="./img/knobs/lineshadow2.png" sprites="100" min="0" max="10" step="0.01" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -5900px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1002.73px; top: -36.5px;">10.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 632.5px; left: 214px; width: 59px; height: 78.5px; transform: translate(-32.092px, -528.661px);" data-x="-32.092010498046875" data-y="-528.6607360839844"><webaudio-knob id="/greyhole/Greyhole/size" src="./img/knobs/lineshadow2.png" sprites="100" min="0.5" max="3" step="0.0001" width="59" height="59" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/lineshadow2.png&quot;); background-size: 59px 5959px; outline: none; width: 59px; height: 59px; background-position: 0px -5900px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1000.68px; top: -36.5px;">3.0000</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 631px; left: 276px; width: 66px; height: 80px; transform: translate(-174.78px, -350.818px);" data-x="-174.77978966551194" data-y="-350.81830284910563"><webaudio-switch id="/greyhole/bypass" src="./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
</webaudio-switch></div><label for="greyhole" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 538px; left: 2px; top: 21px; transform: translate(-134.318px, 309.94px); border: none; font-family: &quot;Bungee Shade&quot;; color: rgb(255, 255, 255); font-size: 36px;" class="drag target-style-label" contenteditable="false" data-x="-134.3175410158987" data-y="309.9395390622263" font="Bungee Shade">greyhole</label><label for="Greyhole" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 72px; left: 201px; top: 40.2344px; border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" font="Skranji">Greyhole</label><label for="Dry/Wet" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 100px; left: 208.016px; top: 118.734px; transform: translate(-83.8952px, 133.686px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-83.89520263671875" data-y="133.68576049804688" font="Skranji">Dry/Wet</label><label for="damping" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 70px; left: 205.398px; top: 199.234px; transform: translate(-189.764px, -118.742px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-189.76416015625" data-y="-118.74235534667969" font="Skranji">damping</label><label for="delayTime" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 73.3906px; left: 203px; top: 279.734px; transform: translate(-183.611px, -112.505px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-183.6109619140625" data-y="-112.50503540039062" font="Skranji">delayTime</label><label for="diffusion" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 80px; left: 205.5px; top: 360.234px; transform: translate(-112.338px, -279.583px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-112.33758544921875" data-y="-279.5825500488281" font="Skranji">diffusion</label><label for="feedback" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 67.3438px; left: 203.328px; top: 440.734px; transform: translate(-102.291px, -273.114px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-102.29104614257812" data-y="-273.113525390625" font="Skranji">feedback</label><label for="modDepth" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 76.4609px; left: 203px; top: 521.234px; transform: translate(-146.03px, -267.885px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-146.03030395507812" data-y="-267.88494873046875" font="Skranji">modDepth</label><label for="modFreq" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 90px; left: 204.539px; top: 601.734px; transform: translate(-36.1485px, -521.233px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-36.148468017578125" data-y="-521.2330474853516" font="Skranji">modFreq</label><label for="size" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 217px; top: 682.234px; transform: translate(-24.5464px, -515.679px); border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" data-x="-24.54644775390625" data-y="-515.6787567138672" font="Skranji">size</label><label for="bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 64px; left: 279px; top: 682.234px; border: none; font-family: Skranji; color: rgb(255, 255, 255);" class="drag" contenteditable="false" font="Skranji">bypass</label></div>`;
  
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
        this._root.getElementById('/greyhole/Greyhole/Dry/Wet').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/Dry/Wet');
        

        this._root.getElementById('/greyhole/Greyhole/damping').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/damping');
        

        this._root.getElementById('/greyhole/Greyhole/delayTime').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/delayTime');
        

        this._root.getElementById('/greyhole/Greyhole/diffusion').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/diffusion');
        

        this._root.getElementById('/greyhole/Greyhole/feedback').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/feedback');
        

        this._root.getElementById('/greyhole/Greyhole/modDepth').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/modDepth');
        

        this._root.getElementById('/greyhole/Greyhole/modFreq').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/modFreq');
        

        this._root.getElementById('/greyhole/Greyhole/size').value = this._plug.audioNode.getParamValue('/greyhole/Greyhole/size');
        

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
                 this._root.getElementById("/greyhole/Greyhole/Dry/Wet").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/Dry/Wet", e.target.value));
this._root.getElementById("/greyhole/Greyhole/damping").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/damping", e.target.value));
this._root.getElementById("/greyhole/Greyhole/delayTime").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/delayTime", e.target.value));
this._root.getElementById("/greyhole/Greyhole/diffusion").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/diffusion", e.target.value));
this._root.getElementById("/greyhole/Greyhole/feedback").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/feedback", e.target.value));
this._root.getElementById("/greyhole/Greyhole/modDepth").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/modDepth", e.target.value));
this._root.getElementById("/greyhole/Greyhole/modFreq").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/modFreq", e.target.value));
this._root.getElementById("/greyhole/Greyhole/size").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/greyhole/Greyhole/size", e.target.value));

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
          ;
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      