import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class CombFilterLloydGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this.style.display = "inline-flex";

    this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgba(179, 175, 50, 0.49), rgba(219, 41, 41, 0.49)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/psyche11.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0px solid rgb(201, 38, 104);bottom:228.7px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:299.723px;hyphens:manual;inset:58.4972px 785.305px 228.7px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;overlay:none;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:785.305px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.4972px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:215.98px;x:0px;y:0px;zoom:1;};</style>
<div id="CombFilterLloyd" class="resize-drag my-pedal gradiant-target" style="border: 0px solid rgb(201, 38, 104); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgba(179, 175, 50, 0.49), rgba(219, 41, 41, 0.49)), url(&quot;https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/psyche11.jpg&quot;) 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; touch-action: none; width: 215.98px; position: relative; top: 0px; left: 0px; height: 299.73px; transform: translate(0px, 0px); opacity: 1;" data-x="0" data-y="0"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 32.8821px; left: 8.76561px; transform: translate(11.969px, -10.0739px);" data-x="11.968951654759621" data-y="-10.073887395533404"><webaudio-knob id="/CombFilterLloyd/Intdel" src="./img/knobs/m400.png" sprites="100" min="0" max="256" step="1" width="53" height="53" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/m400.png&quot;); outline: none; width: 53px; height: 53px; background-position: 0px -159px; background-size: 53px 5353px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1012.53px; top: -36.3168px;">8</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 113.536px; left: 8.99289px; transform: translate(119.47px, -90.8388px);" data-x="119.47012329101562" data-y="-90.83883285522461"><webaudio-knob id="/CombFilterLloyd/aN" src="./img/knobs/m400.png" sprites="100" min="-0.99" max="0.99" step="0.01" width="53" height="53" style="touch-action: none; display: block;"><style>

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
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/m400.png&quot;); background-size: 53px 5353px; outline: none; width: 53px; height: 53px; background-position: 0px -5300px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1004.88px; top: -36.3168px;">0.99</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 194.189px; left: 0.889191px; width: 65.9872px; height: 80.2557px; transform: translate(68.8374px, -14.3208px);" data-x="68.83740234375" data-y="-14.320831298828125"><webaudio-switch id="/CombFilterLloyd/bypass" src="./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>

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
</webaudio-switch></div><label for="CombFilterLloyd" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 230px; left: 1.89488px; top: 4.39346px; transform: translate(-7.33426px, 232.927px); border: none; color: rgb(216, 219, 41); font-size: 26px; font-family: Shojumaru; -webkit-text-stroke: 2px rgb(5, 5, 5);" class="drag" contenteditable="false" data-x="-7.334259033203125" data-y="232.92700958251953" font="Shojumaru">Comb Filter</label><label for="Intdel" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 240px; left: 11.6534px; top: 82.9446px; color: rgb(216, 219, 41); font-size: 21px; font-family: Shojumaru; -webkit-text-stroke: 2px rgb(5, 5, 5); transform: translate(-80.6781px, -4.02664px); border: none;" class="drag" contenteditable="false" font="Shojumaru" data-x="-80.67807006835938" data-y="-4.026641845703125">Delay</label><label for="aN" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 40px; left: 11.8807px; top: 163.598px; color: rgb(216, 219, 41); font-size: 21px; font-family: Shojumaru; -webkit-text-stroke: 2px rgb(5, 5, 5); transform: translate(126.945px, -83.9784px); border: none;" class="drag target-style-label" contenteditable="false" font="Shojumaru" data-x="126.94509887695312" data-y="-83.9784164428711">aN</label><label for="bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 63.9986px; left: 3.77698px; top: 245.842px; border: none; color: rgb(216, 219, 41); font-size: 21px; font-family: Shojumaru; -webkit-text-stroke: 1px rgb(5, 5, 5);" class="drag" contenteditable="false" font="Shojumaru">bypass</label></div>`;

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
    this._root.getElementById("/CombFilterLloyd/Intdel").value =
      this._plug.audioNode.getParamValue("/CombFilterLloyd/Intdel");

    this._root.getElementById("/CombFilterLloyd/aN").value =
      this._plug.audioNode.getParamValue("/CombFilterLloyd/aN");

    this._root.getElementById("/CombFilterLloyd/bypass").value =
      1 - this._plug.audioNode.getParamValue("/CombFilterLloyd/bypass");

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
      .getElementById("/CombFilterLloyd/Intdel")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CombFilterLloyd/Intdel",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/CombFilterLloyd/aN")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/CombFilterLloyd/aN",
          e.target.value,
        ),
      );
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/CombFilterLloyd/bypass")
      .addEventListener("change", (e) =>
        this._plug.audioNode.setParamValue(
          "/CombFilterLloyd/bypass",
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
  customElements.define("wap-combfilterlloyd", CombFilterLloydGui);
  console.log("Element defined");
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
