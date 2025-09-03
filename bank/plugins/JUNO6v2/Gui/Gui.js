import '../utils/webaudio-controls.js'

      const getBaseURL = () => {
        const base = new URL('.', import.meta.url);
        return `${base}`;
      };
      export default class JUNO6v2Gui extends HTMLElement {
              constructor(plug) {
                 
        super();
            this._plug = plug;
            this._plug.gui = this;
        console.log(this._plug);
          
        this._root = this.attachShadow({ mode: 'open' });
        this.style.display = "inline-flex";
        
        this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgba(170, 85, 85, 0.34), rgba(147, 83, 83, 0.34)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/zebras1.jpeg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0.666667px dashed rgb(73, 73, 73);bottom:0px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:inline-block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:492.135px;hyphens:manual;inset:0px;isolation:auto;left:0px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;overlay:none;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:0px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:0px;transform:matrix(1, 0, 0, 1, 59.4844, 17.8854);transition:all;translate:none;visibility:visible;widows:2;width:1231.99px;x:0px;y:0px;zoom:1;};</style>
<div id="JUNO6v2" class="resize-drag my-pedal target-style-container gradiant-target" style="border: 1px dashed rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgba(170, 85, 85, 0.34), rgba(147, 83, 83, 0.34)), url(&quot;https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/zebras1.jpeg&quot;) 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; touch-action: none; width: 1231.99px; position: relative; top: 0px; left: 0px; height: 492.141px; transform: translate(59.4844px, 17.8854px);" data-x="59.484375" data-y="17.885421752929688"><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 1217.99px; position: absolute; top: 32.526px; left: 3.98959px; height: 706.372px; display: none;"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 1203.99px; position: absolute; top: 68.0642px; left: 10.9861px; height: 667.283px; display: none;"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: none; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 103.602px; left: 14.5365px; width: 1196.89px; height: 547.387px;"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 322.257px; left: 27.1233px; width: 72.9583px; height: 94.8958px; transform: translate(-9.61979px, -287.969px);" data-x="-9.619792938232422" data-y="-287.9687690734863"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 139.141px; left: 102.21px; width: 239.865px; height: 236.953px; transform: translate(-9.13542px, -105.672px);" data-x="-9.135421752929688" data-y="-105.671875"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; width: 85.9983px; position: absolute; top: 174.679px; left: 243.399px; height: 257.873px; display: none;"><div style="border: none; padding: 1px; margin: 1px; text-align: center; display: inline-block;"><button id="/JUNO6v2/MAIN/LFO/TRIG/LFO" type="button" label="LFO" shortname="TRIG_LFO" address="/JUNO6v2/MAIN/LFO/TRIG/LFO" index="76" meta="[object Object]">LFO</button></div></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 235.651px; left: 336.941px; width: 468.75px; height: 237.354px; transform: translate(0px, -202.49px);" data-x="0" data-y="-202.48959350585938"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 235.651px; left: 809.693px; width: 61.7396px; height: 237.458px; transform: translate(0px, -202.651px);" data-x="0" data-y="-202.65106201171875"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 235.651px; left: 861.021px; width: 280.479px; height: 232.594px; transform: translate(12.7031px, -202.078px);" data-x="12.703125" data-y="-202.07814025878906"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 235.651px; left: 1145.5px; width: 56.6146px; height: 232.938px; transform: translate(15.1756px, -203.979px);" data-x="15.175594860028468" data-y="-203.9791717529297"></div><div id="JUNO6v2" class="resize-drag" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: contain; border-radius: 15px; background-color: transparent; touch-action: none; position: absolute; top: 443.542px; left: 523.443px; width: 200.938px; height: 196.297px; transform: translate(416.792px, -172.021px);" data-x="416.79168701171875" data-y="-172.0208740234375"></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 357.797px; left: 30.6754px; width: 65.9896px; height: 80.1997px; transform: translate(-9.21355px, -285.349px);" data-x="-9.213546752929688" data-y="-285.34894943237305"><webaudio-switch id="/JUNO6v2/MAIN/POWER/ON" src="./img/switches/Power_switch_01.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/Power_switch_01.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 105.762px; width: 41.9965px; height: 166.806px; transform: translate(-2.70834px, -192.005px);" data-x="-2.708343505859375" data-y="-192.0052032470703"><webaudio-knob id="/JUNO6v2/MAIN/LFO/RATE" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12288px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.96</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 149.755px; width: 91.6493px; height: 166.806px; transform: translate(-5.60938px, -194.469px);" data-x="-5.609375" data-y="-194.46874237060547"><webaudio-knob id="/JUNO6v2/MAIN/LFO/DELAY_TIME" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12160px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1023.45px; top: -35.8333px;">0.95</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 210.219px; left: 246.951px; width: 80.8941px; height: 190.799px; transform: translate(-7.31248px, -133.656px);" data-x="-7.3124847412109375" data-y="-133.65628051757812"><webaudio-knob id="/JUNO6v2/MAIN/LFO/TRIG/TRIG_MODE" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="1" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1025.05px; top: -35.8333px;">0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 340.493px; width: 41.9965px; height: 166.806px; transform: translate(2.13541px, -191.818px);" data-x="2.135406494140625" data-y="-191.81771850585938"><webaudio-knob id="/JUNO6v2/MAIN/DCO/LFO" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12288px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.96</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 384.486px; width: 41.9965px; height: 166.806px; transform: translate(18.3958px, -192.802px);" data-x="18.395843505859375" data-y="-192.80209350585938"><webaudio-knob id="/JUNO6v2/MAIN/DCO/PWM" src="./img/knobs/vslider1.png" sprites="100" min="0.01" max="0.99" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12288px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.96</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 428.479px; width: 48.2379px; height: 166.806px; transform: translate(28.8594px, -192.115px);" data-x="28.859405517578125" data-y="-192.11459350585938"><webaudio-knob id="/JUNO6v2/MAIN/DCO/MODE" src="./img/knobs/vslider1.png" sprites="100" min="0" max="2" step="1" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1009.39px; top: -35.8333px;">0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 357.797px; left: 478.714px; width: 65.9896px; height: 80.1997px; transform: translate(64.3334px, -228.578px);" data-x="64.3333740234375" data-y="-228.57815551757812"><webaudio-switch id="/JUNO6v2/MAIN/DCO/RECT" src="./img/switches/switch_2.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_2.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 357.797px; left: 546.7px; width: 65.9896px; height: 80.1997px; transform: translate(44.9688px, -226.974px);" data-x="44.96881103515625" data-y="-226.97396850585938"><webaudio-switch id="/JUNO6v2/MAIN/DCO/SAW" src="./img/switches/switch_2.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_2.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 357.797px; left: 614.686px; width: 65.9896px; height: 80.1997px; transform: translate(17.4346px, -227.472px);" data-x="17.434570756565904" data-y="-227.47161731070196"><webaudio-switch id="/JUNO6v2/MAIN/DCO/SUB" src="./img/switches/switch_2.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_2.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 682.672px; width: 70.816px; height: 166.806px; transform: translate(-7.58999px, -190.199px);" data-x="-7.589988721956274" data-y="-190.19936372195633"><webaudio-knob id="/JUNO6v2/MAIN/DCO/SUB_OSC" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1013.03px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 755.484px; width: 48.6632px; height: 166.806px; transform: translate(-9.34369px, -189.297px);" data-x="-9.34368896484375" data-y="-189.29689025878906"><webaudio-knob id="/JUNO6v2/MAIN/DCO/NOISE" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1001.95px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 813.245px; width: 42.2309px; height: 166.806px; transform: translate(2.63764px, -190.912px);" data-x="2.637644086336877" data-y="-190.91184016659253"><webaudio-knob id="/JUNO6v2/MAIN/HPF/FREQ" src="./img/knobs/vslider1.png" sprites="100" min="0" max="10" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 995.682px; top: -35.8333px;">10.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 864.573px; width: 42.2309px; height: 166.806px; transform: translate(14.7396px, -190.359px);" data-x="14.73956298828125" data-y="-190.359375"><webaudio-knob id="/JUNO6v2/MAIN/VCF/FREQ" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.74px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 908.8px; width: 41.9965px; height: 166.806px; transform: translate(16.6562px, -190.016px);" data-x="16.65625" data-y="-190.015625"><webaudio-knob id="/JUNO6v2/MAIN/VCF/RES" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12288px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.96</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 952.793px; width: 53.2639px; height: 166.806px; transform: translate(14.8699px, -190.495px);" data-x="14.869873046875" data-y="-190.49478149414062"><webaudio-knob id="/JUNO6v2/MAIN/VCF/POLAR" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="1" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1011.9px; top: -35.8333px;">0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 1008.05px; width: 41.9965px; height: 166.806px; transform: translate(12.4426px, -190.021px);" data-x="12.442626953125" data-y="-190.02084350585938"><webaudio-knob id="/JUNO6v2/MAIN/VCF/ENV" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -11776px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.92</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 1052.05px; width: 41.9965px; height: 166.806px; transform: translate(18.0365px, -190.677px);" data-x="18.0364990234375" data-y="-190.6770782470703"><webaudio-knob id="/JUNO6v2/MAIN/VCF/LFO" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -11904px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.93</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 1096.04px; width: 43.9149px; height: 166.806px; transform: translate(18.6041px, -189.432px);" data-x="18.6041259765625" data-y="-189.43228149414062"><webaudio-knob id="/JUNO6v2/MAIN/VCF/KYBD" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -11648px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 999.578px; top: -35.8333px;">0.91</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 271.191px; left: 1149.05px; width: 48.2379px; height: 166.806px; transform: translate(16.2083px, -190.302px);" data-x="16.208251953125" data-y="-190.30210876464844"><webaudio-knob id="/JUNO6v2/MAIN/VCA/MODE" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="1" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1009.39px; top: -35.8333px;">0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 479.082px; left: 526.995px; width: 41.9965px; height: 166.806px; transform: translate(418.734px, -178.708px);" data-x="418.73443603515625" data-y="-178.70831298828125"><webaudio-knob id="/JUNO6v2/MAIN/ENV/A" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 479.082px; left: 570.988px; width: 41.9965px; height: 166.806px; transform: translate(424.1px, -179.361px);" data-x="424.100268488598" data-y="-179.36095045128968"><webaudio-knob id="/JUNO6v2/MAIN/ENV/D" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 479.082px; left: 614.981px; width: 41.9965px; height: 166.806px; transform: translate(429.229px, -179.464px);" data-x="429.229248046875" data-y="-179.46353149414062"><webaudio-knob id="/JUNO6v2/MAIN/ENV/S" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -384px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">0.03</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 479.082px; left: 658.974px; width: 41.9965px; height: 166.806px; transform: translate(437.516px, -178.417px);" data-x="437.515625" data-y="-178.41668701171875"><webaudio-knob id="/JUNO6v2/MAIN/ENV/R" src="./img/knobs/vslider1.png" sprites="100" min="0" max="1" step="0.01" width="40" height="128" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/vslider1.png&quot;); background-size: 40px 12928px; outline: none; width: 40px; height: 128px; background-position: 0px -12800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 998.62px; top: -35.8333px;">1.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 654.984px; left: 416.995px; transform: translate(-297.015px, -330.096px);" data-x="-297.0152135594409" data-y="-330.0956469962434"><webaudio-knob id="/JUNO6v2/freq" src="./img/knobs/Jambalaya.png" sprites="100" min="20" max="20000" step="0.01" width="67" height="67" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/Jambalaya.png&quot;); outline: none; width: 67px; height: 67px; background-position: 0px 0px; background-size: 67px 6767px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1009.07px; top: -35.8333px;">20.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 654.984px; left: 548.983px; transform: translate(-335.995px, -330.104px);" data-x="-335.9947814941406" data-y="-330.10418701171875"><webaudio-knob id="/JUNO6v2/gain" src="./img/knobs/Jambalaya.png" sprites="100" min="0" max="1" step="0.01" width="67" height="67" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/Jambalaya.png&quot;); outline: none; width: 67px; height: 67px; background-position: 0px 0px; background-size: 67px 6767px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1012.12px; top: -35.8333px;">0.00</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 654.984px; left: 680.971px; transform: translate(-369.844px, -330.55px);" data-x="-369.8436022971931" data-y="-330.5495654319585"><webaudio-knob id="/JUNO6v2/gate" src="./img/knobs/Jambalaya.png" sprites="100" min="0" max="1" step="1" width="67" height="67" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/Jambalaya.png&quot;); outline: none; width: 67px; height: 67px; background-position: 0px 0px; background-size: 67px 6767px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s, visibility 0.1s; opacity: 0; visibility: hidden; left: 1019.77px; top: -35.8333px;">0</div>
</webaudio-knob></div><label for="Polyphonic" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 1228.89px; left: 1.54689px; top: 3.53646px; border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" font="Fruktur">Polyphonic</label><label for="Voices" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 1214.89px; left: 8.08334px; top: 38.6146px; border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" font="Fruktur">Voices</label><label for="JUNO6v2" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 420px; left: 15.0799px; top: 74.1528px; transform: translate(412.75px, 243.062px); border: none; font-family: Fruktur; font-size: 65px; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="412.74952533513294" data-y="243.06161334782826" font="Fruktur">JUNO6v2</label><label for="MAIN" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 1193.78px; left: 18.6302px; top: 109.691px; border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" font="Fruktur">MAIN</label><label for="POWER" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 67.9861px; left: 31.217px; top: 328.345px; transform: translate(-10.4583px, -282.115px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-10.458335876464844" data-y="-282.1145820617676" font="Fruktur">POWER</label><label for="LFO" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 120px; left: 106.304px; top: 145.229px; transform: translate(41.1875px, -103.318px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="41.18750762939453" data-y="-103.31771850585938" font="Fruktur">LFO</label><label for="TRIG" style="display: none; touch-action: none; position: absolute; z-index: 1; width: 82.8906px; left: 247.493px; top: 180.767px; border: none; transform: translate(170.526px, -59.6615px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="170.52603149414062" data-y="-59.66145324707031" font="Fruktur">TRIG</label><label for="DCO" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 465.651px; left: 341.035px; top: 241.74px; transform: translate(-32.401px, -205.224px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-32.4010009765625" data-y="-205.22396850585938" font="Fruktur">DCO</label><label for="HPF" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 44.2274px; left: 813.786px; top: 241.74px; transform: translate(5.06763px, -200.057px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="5.067626953125" data-y="-200.05731201171875" font="Fruktur">HPF</label><label for="VCF" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 277.378px; left: 865.115px; top: 241.74px; transform: translate(-3.1355px, -203.557px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-3.135498046875" data-y="-203.55728912353516" font="Fruktur">VCF</label><label for="VCA" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 50.2344px; left: 1149.59px; top: 241.74px; transform: translate(12.4949px, -202.594px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="12.494873046875" data-y="-202.59376525878906" font="Fruktur">VCA</label><label for="ENV" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 175.972px; left: 527.536px; top: 449.63px; transform: translate(426.833px, -174.646px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="426.8333740234375" data-y="-174.64581298828125" font="Fruktur">ENV</label><label for="ON" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 63.9931px; left: 33.2135px; top: 408.545px; transform: translate(97.0938px, -331.12px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="97.09375762939453" data-y="-331.11981201171875" font="Fruktur">ON</label><label for="RATE" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 108.3px; top: 408.545px; transform: translate(-5.48958px, -190.854px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-5.4895782470703125" data-y="-190.85414123535156" font="Fruktur">RATE</label><label for="DELAY TIME" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 89.6528px; left: 152.293px; top: 408.545px; transform: translate(-0.163469px, -191.125px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-0.1634687556404799" data-y="-191.12523362109187" font="Fruktur">DELAY TIME</label><label for="TRIG MODE" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 78.8976px; left: 249.49px; top: 347.573px; border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" font="Fruktur">TRIG MODE</label><label for="LFO" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 343.031px; top: 408.545px; transform: translate(0.739594px, -187.01px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="0.739593505859375" data-y="-187.01040649414062" font="Fruktur">LFO</label><label for="PWM" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 387.024px; top: 408.545px; transform: translate(16.2136px, -187.719px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="16.21356201171875" data-y="-187.71871948242188" font="Fruktur">PWM</label><label for="MODE" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 46.2413px; left: 431.017px; top: 408.545px; transform: translate(27.6562px, -187.719px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="27.65625" data-y="-187.71875" font="Fruktur">MODE</label><label for="RECT" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 63.9931px; left: 481.252px; top: 408.545px; transform: translate(61.9896px, -230.203px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="61.9896240234375" data-y="-230.203125" font="Fruktur">RECT</label><label for="SAW" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 63.9931px; left: 549.238px; top: 408.545px; transform: translate(44.6354px, -227.771px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="44.63543701171875" data-y="-227.77081298828125" font="Fruktur">SAW</label><label for="SUB" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 63.9931px; left: 617.224px; top: 408.545px; transform: translate(18.3906px, -227.354px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="18.390625" data-y="-227.35415649414062" font="Fruktur">SUB</label><label for="SUB OSC" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 68.8195px; left: 685.21px; top: 408.545px; transform: translate(-2.31769px, -183.391px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-2.31768798828125" data-y="-183.390625" font="Fruktur">SUB OSC</label><label for="NOISE" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 46.6667px; left: 758.023px; top: 408.545px; transform: translate(-1.11456px, -184.682px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-1.11456298828125" data-y="-184.68228149414062" font="Fruktur">NOISE</label><label for="FREQ" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40.2344px; left: 815.783px; top: 408.545px; transform: translate(1.21875px, -185.224px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="1.21875" data-y="-185.22393798828125" font="Fruktur">FREQ</label><label for="FREQ" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40.2344px; left: 867.111px; top: 408.545px; transform: translate(12.9375px, -185.521px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="12.9375" data-y="-185.52084350585938" font="Fruktur">FREQ</label><label for="RES" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 911.339px; top: 408.545px; transform: translate(17.9167px, -185.125px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="17.91668701171875" data-y="-185.125" font="Fruktur">RES</label><label for="POLAR" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 51.2674px; left: 955.332px; top: 408.545px; transform: translate(20.2812px, -184.88px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="20.28125" data-y="-184.88021850585938" font="Fruktur">POLAR</label><label for="ENV" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 1010.59px; top: 408.545px; transform: translate(22.099px, -185.359px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="22.0989990234375" data-y="-185.359375" font="Fruktur">ENV</label><label for="LFO" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 1054.59px; top: 408.545px; transform: translate(15.9845px, -185.422px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="15.9844970703125" data-y="-185.421875" font="Fruktur">LFO</label><label for="KYBD" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 41.9184px; left: 1098.58px; top: 408.545px; transform: translate(13.6823px, -186.062px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="13.6822509765625" data-y="-186.0625" font="Fruktur">KYBD</label><label for="MODE" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 46.2413px; left: 1151.59px; top: 408.545px; transform: translate(14.573px, -188.219px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="14.572998046875" data-y="-188.21878051757812" font="Fruktur">MODE</label><label for="A" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 529.533px; top: 616.436px; transform: translate(419.839px, -175.625px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="419.838623046875" data-y="-175.62503051757812" font="Fruktur">A</label><label for="D" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 573.526px; top: 616.436px; transform: translate(422.406px, -175.38px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="422.40631103515625" data-y="-175.38015747070312" font="Fruktur">D</label><label for="S" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 617.519px; top: 616.436px; transform: translate(430.12px, -175.995px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="430.1197509765625" data-y="-175.99481201171875" font="Fruktur">S</label><label for="R" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 661.512px; top: 616.436px; transform: translate(438.937px, -176.583px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="438.93743896484375" data-y="-176.5833740234375" font="Fruktur">R</label><label for="freq" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 127.995px; left: 419.533px; top: 704.344px; transform: translate(-331.812px, -300.828px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-331.81248474121094" data-y="-300.82818603515625" font="Fruktur">freq</label><label for="gain" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 127.995px; left: 551.521px; top: 704.344px; transform: translate(-369.396px, -300.927px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-369.3958435058594" data-y="-300.9270935058594" font="Fruktur">gain</label><label for="gate" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 127.995px; left: 683.509px; top: 704.344px; transform: translate(-401.781px, -299.776px); border: none; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-401.78125" data-y="-299.7760314941406" font="Fruktur">gate</label><label for="JUNO6v2" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(45.6562px, 531.266px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="45.65625" data-y="531.2656631469727" font="Fruktur">labelText</label><label for="JUNO6v2" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(87.0521px, 459.51px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="87.05208587646484" data-y="459.5104160308838" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(87.9844px, 432.224px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="87.984375" data-y="432.2239570617676" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(110.734px, 372.026px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="110.734375" data-y="372.02605056762695" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; border: none; transform: translate(505.099px, 178.125px); font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="505.0989532470703" data-y="178.1250343322754" font="Fruktur">ENV</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; border: none; transform: translate(507.928px, 77.5022px); font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="507.92793061321254" data-y="77.50222311402632" font="Fruktur">LFO</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(99.5469px, 309.266px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="99.546875" data-y="309.26563453674316" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; border: none; transform: translate(507.068px, 128.594px); font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="507.06773376464844" data-y="128.59375" font="Fruktur">MAN</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(156.818px, 518.932px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="156.81771850585938" data-y="518.9323310852051" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(33.2083px, 403.479px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="33.208324268000936" data-y="403.4792917515215" font="Fruktur">labelText</label><label for="RECT" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: none; touch-action: none; border: none; transform: translate(169.557px, 388.786px); font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="169.5572967529297" data-y="388.7864685058594" font="Fruktur">labelText</label><label for="JUNO6v2" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; transform: translate(299.745px, 77.4323px); border: none; font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="299.74478912353516" data-y="77.43229675292969" font="Fruktur">AUTO</label><label for="undefined" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; transform: translate(304.031px, 181.63px); border: none; font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="304.03123474121094" data-y="181.63023376464844" font="Fruktur">MAN</label><label for="RATE" contenteditable="false" class="drag" style="text-align: center; position: absolute; display: block; touch-action: none; transform: translate(248.313px, 218.906px); border: none; font-size: 12px; font-family: Fruktur; color: rgb(238, 255, 0); -webkit-text-stroke: 1px rgb(5, 5, 5);" data-x="248.31251525878906" data-y="218.9062957763672" font="Fruktur">TRIG MODE</label></div>`;
  
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
        this._root.getElementById('/JUNO6v2/MAIN/LFO/RATE').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/LFO/RATE');
        

        this._root.getElementById('/JUNO6v2/MAIN/LFO/DELAY_TIME').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/LFO/DELAY_TIME');
        

        this._root.getElementById('/JUNO6v2/MAIN/LFO/TRIG/TRIG_MODE').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/LFO/TRIG/TRIG_MODE');
        

        this._root.getElementById('/JUNO6v2/MAIN/DCO/LFO').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/LFO');
        

        this._root.getElementById('/JUNO6v2/MAIN/DCO/PWM').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/PWM');
        

        this._root.getElementById('/JUNO6v2/MAIN/DCO/MODE').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/MODE');
        

        this._root.getElementById('/JUNO6v2/MAIN/DCO/SUB_OSC').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/SUB_OSC');
        

        this._root.getElementById('/JUNO6v2/MAIN/DCO/NOISE').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/NOISE');
        

        this._root.getElementById('/JUNO6v2/MAIN/HPF/FREQ').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/HPF/FREQ');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/FREQ').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/FREQ');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/RES').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/RES');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/POLAR').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/POLAR');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/ENV').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/ENV');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/LFO').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/LFO');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCF/KYBD').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCF/KYBD');
        

        this._root.getElementById('/JUNO6v2/MAIN/VCA/MODE').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/VCA/MODE');
        

        this._root.getElementById('/JUNO6v2/MAIN/ENV/A').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/ENV/A');
        

        this._root.getElementById('/JUNO6v2/MAIN/ENV/D').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/ENV/D');
        

        this._root.getElementById('/JUNO6v2/MAIN/ENV/S').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/ENV/S');
        

        this._root.getElementById('/JUNO6v2/MAIN/ENV/R').value = this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/ENV/R');
        

        this._root.getElementById('/JUNO6v2/freq').value = this._plug.audioNode.getParamValue('/JUNO6v2/freq');
        

        this._root.getElementById('/JUNO6v2/gain').value = this._plug.audioNode.getParamValue('/JUNO6v2/gain');
        

        this._root.getElementById('/JUNO6v2/gate').value = this._plug.audioNode.getParamValue('/JUNO6v2/gate');
        

          this._root.getElementById('/JUNO6v2/MAIN/POWER/ON').value = 1 - this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/POWER/ON');
         

          this._root.getElementById('/JUNO6v2/MAIN/DCO/RECT').value = 1 - this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/RECT');
         

          this._root.getElementById('/JUNO6v2/MAIN/DCO/SAW').value = 1 - this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/SAW');
         

          this._root.getElementById('/JUNO6v2/MAIN/DCO/SUB').value = 1 - this._plug.audioNode.getParamValue('/JUNO6v2/MAIN/DCO/SUB');
         
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
                 this._root.getElementById("/JUNO6v2/MAIN/LFO/RATE").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/LFO/RATE", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/LFO/DELAY_TIME").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/LFO/DELAY_TIME", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/LFO/TRIG/TRIG_MODE").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/LFO/TRIG/TRIG_MODE", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/LFO").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/LFO", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/PWM").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/PWM", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/MODE").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/MODE", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/SUB_OSC").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/SUB_OSC", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/NOISE").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/NOISE", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/HPF/FREQ").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/HPF/FREQ", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/FREQ").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/FREQ", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/RES").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/RES", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/POLAR").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/POLAR", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/ENV").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/ENV", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/LFO").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/LFO", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCF/KYBD").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCF/KYBD", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/VCA/MODE").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/VCA/MODE", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/ENV/A").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/ENV/A", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/ENV/D").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/ENV/D", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/ENV/S").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/ENV/S", e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/ENV/R").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/ENV/R", e.target.value));
this._root.getElementById("/JUNO6v2/freq").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/freq", e.target.value));
this._root.getElementById("/JUNO6v2/gain").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/gain", e.target.value));
this._root.getElementById("/JUNO6v2/gate").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/gate", e.target.value));

              }
          
              setSliders() {
                 
              }
          
              setSwitches() {
                 this._root.getElementById("/JUNO6v2/MAIN/POWER/ON").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/POWER/ON", 1 - e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/RECT").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/RECT", 1 - e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/SAW").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/SAW", 1 - e.target.value));
this._root.getElementById("/JUNO6v2/MAIN/DCO/SUB").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/JUNO6v2/MAIN/DCO/SUB", 1 - e.target.value));

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
          customElements.define('wap-juno6v2', 
                                JUNO6v2Gui);
          console.log("Element defined");
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      