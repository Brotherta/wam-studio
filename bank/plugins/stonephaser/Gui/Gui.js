import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class untitledGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);
    this.style.display = "inline-flex";
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgb(210, 82, 40), rgb(245, 208, 71)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/?name=untitled.dsp") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0px solid rgb(255, 255, 255);bottom:0px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:inline-block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:300px;hyphens:manual;inset:0px;isolation:auto;left:0px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:0px;rx:auto;ry:auto;speak:normal;stroke:none;top:0px;transform:matrix(1, 0, 0, 1, -1, 0);transition:all 0s ease 0s;visibility:visible;widows:2;width:201px;x:0px;y:0px;zoom:1;};</style>
<div id="untitled" class="resize-drag my-pedal gradiant-target" style="border: 0px solid rgb(255, 255, 255); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgb(210, 82, 40), rgb(245, 208, 71)), url(&quot;&quot;) 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; touch-action: none; width: 201px; position: relative; top: 0px; left: 0px; height: 300px; transform: translate(-1px, 0px);" data-x="-1" data-y="0"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 33px; left: 49px; transform: translate(60px, 168px);" data-x="60" data-y="168"><webaudio-switch id="/untitled/Bypass" src="./img/switches/switch_1.png" sprites="100" width="80" height="40" style="touch-action: none;"><style>

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
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 80px; height: 40px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 33.5px; left: 117px; transform: translate(-91px, 166px);" data-x="-91" data-y="166"><webaudio-knob id="/untitled/Color" src="./img/knobs/m400.png" sprites="100" min="0" max="1" step="1" width="40" height="40" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/m400.png&quot;); outline: none; width: 40px; height: 40px; background-position: 0px 0px; background-size: 40px 4040px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1005.94px; top: -36.5px;">0</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 116px; left: 17px; transform: translate(1px, -111px);" data-x="1" data-y="-111"><webaudio-knob id="/untitled/LFO frequency" src="./img/knobs/knob2.png" sprites="100" min="0.01" max="5" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/knob2.png&quot;); outline: none; width: 60px; height: 60px; background-position: 0px -4740px; background-size: 60px 6060px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.29px; top: -36.5px;">3.96</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 116px; left: 149px; transform: translate(-31px, -111px);" data-x="-31" data-y="-111"><webaudio-knob id="/untitled/Feedback depth" src="./img/knobs/knob2.png" sprites="100" min="0" max="99" step="1" width="60" height="60" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/knob2.png&quot;); outline: none; width: 60px; height: 60px; background-position: 0px -3540px; background-size: 60px 6060px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1012.88px; top: -36.5px;">59</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 196.5px; left: 13.8438px; transform: translate(105px, -107px);" data-x="105" data-y="-107"><webaudio-knob id="/untitled/Feedback bass cut" src="./img/knobs/knob2.png" sprites="100" min="10" max="5000" step="1" width="60" height="60" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/knob2.png&quot;); outline: none; width: 60px; height: 60px; background-position: 0px -5460px; background-size: 60px 6060px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1006.76px; top: -36.5px;">4568</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 196.5px; left: 152.141px; transform: translate(-134px, -107px);" data-x="-134" data-y="-107"><webaudio-knob id="/untitled/Dry/wet mix" src="./img/knobs/knob2.png" sprites="100" min="0" max="100" step="1" width="60" height="60" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/knob2.png&quot;); outline: none; width: 60px; height: 60px; background-position: 0px -1020px; background-size: 60px 6060px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1012.88px; top: -36.5px;">17</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 277px; left: 1px; width: 302px; height: 191px; transform: translate(111.778px, -40.1391px);" data-x="111.77759192157657" data-y="-40.139074745090085"><canvas id="/untitled/Bypass meter" type="hbargraph" label="Bypass meter" address="/untitled/Bypass meter" index="536" meta="[object Object],[object Object]" min="0" max="1" style="touch-action: none;"></canvas></div><label for="untitled" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 296px; left: 2px; top: 3.71875px; transform: translate(-47px, 269px); border: none; font-family: &quot;Vampiro One&quot;; color: rgb(255, 255, 255);" class="drag target-style-label" contenteditable="false" data-x="-47" data-y="269" font="Vampiro One">Stone Phaser</label><label for="Bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 64px; left: 52px; top: 84.7188px; transform: translate(259px, -45px); border: none;" class="drag" contenteditable="false" data-x="259" data-y="-45">Bypass</label><label for="Color" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 128px; left: 120px; top: 84.7188px; transform: translate(-135px, 163px); border: none; font-family: &quot;Vampiro One&quot;; font-size: 11px;" class="drag" contenteditable="false" data-x="-135" data-y="163" font="Vampiro One">Color</label><label for="LFO frequency" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 128px; left: 20px; top: 165.219px; transform: translate(-31px, -96px); border: none; font-family: &quot;Vampiro One&quot;; font-size: 11px;" class="drag" contenteditable="false" data-x="-31" data-y="-96" font="Vampiro One">LFO frequency</label><label for="Feedback depth" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 128px; left: 152px; top: 165.219px; transform: translate(-66px, -95px); border: none; font-family: &quot;Vampiro One&quot;; font-size: 11px;" class="drag" contenteditable="false" data-x="-66" data-y="-95" font="Vampiro One">Feedback depth</label><label for="Feedback bass cut" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 100px; left: 16.8438px; top: 245.719px; transform: translate(84px, -92px); border: none; font-family: &quot;Vampiro One&quot;; font-size: 11px;" class="drag" contenteditable="false" data-x="84" data-y="-92" font="Vampiro One">Feedback bass cut</label><label for="Dry/wet mix" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 128px; left: 155.141px; top: 245.719px; transform: translate(-168px, -92px); border: none; font-family: &quot;Vampiro One&quot;; font-size: 11px;" class="drag" contenteditable="false" data-x="-168" data-y="-92" font="Vampiro One">Dry/wet mix</label><label for="Bypass meter" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 300px; left: 4px; top: 438.719px; border: none;" class="drag" contenteditable="false">Bypass meter</label></div>`;

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
    let webaudioControls = this._root.querySelectorAll("webaudio-knob, webaudio-slider, webaudio-switch, img");
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
      if (!usedFonts.includes(e.getAttribute("font"))) usedFonts += "family=" + e.getAttribute("font") + "&";
    });
    let link = document.createElement("link");
    link.rel = "stylesheet";
    if (usedFonts.slice(0, -1))
      link.href = "https://fonts.googleapis.com/css2?" + usedFonts.slice(0, -1) + "&display=swap";
    document.querySelector("head").appendChild(link);

    // BMT Adapt for background-image
    let divs = this._root.querySelectorAll("div");
    divs.forEach((e) => {
      if ("background-image" in e.style) {
        let currentImagePath = e.style.backgroundImage.slice(4, -1);
        if (currentImagePath !== undefined) {
          let imagePath = e.style.backgroundImage.slice(5, -2);
          if (imagePath != "") e.style.backgroundImage = "url(" + this.basePath + "/" + imagePath + ")";
        }
      }
    });
  }

  setImageBackground() {
    // check if the shadowroot host has a background image
    let mainDiv = this._root.querySelector("#main");
    mainDiv.style.backgroundImage = "url(" + this.basePath + "/" + imageRelativeURI + ")";

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
    this._root.getElementById("/untitled/Color").value = this._plug.audioNode.getParamValue("/untitled/Color");

    this._root.getElementById("/untitled/LFO frequency").value =
      this._plug.audioNode.getParamValue("/untitled/LFO frequency");

    this._root.getElementById("/untitled/Feedback depth").value =
      this._plug.audioNode.getParamValue("/untitled/Feedback depth");

    this._root.getElementById("/untitled/Feedback bass cut").value =
      this._plug.audioNode.getParamValue("/untitled/Feedback bass cut");

    this._root.getElementById("/untitled/Dry/wet mix").value =
      this._plug.audioNode.getParamValue("/untitled/Dry/wet mix");

    this._root.getElementById("/untitled/Bypass").value = 1 - this._plug.audioNode.getParamValue("/untitled/Bypass");

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
      .getElementById("/untitled/Color")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/untitled/Color", e.target.value));
    this._root
      .getElementById("/untitled/LFO frequency")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/untitled/LFO frequency", e.target.value));
    this._root
      .getElementById("/untitled/Feedback depth")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/untitled/Feedback depth", e.target.value));
    this._root
      .getElementById("/untitled/Feedback bass cut")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/untitled/Feedback bass cut", e.target.value)
      );
    this._root
      .getElementById("/untitled/Dry/wet mix")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/untitled/Dry/wet mix", e.target.value));
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/untitled/Bypass")
      .addEventListener("change", (e) => this._plug.audioNode.setParamValue("/untitled/Bypass", 1 - e.target.value));
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
  customElements.define("wap-stonephaser", untitledGui);
  
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
