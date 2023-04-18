import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class deathgateGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:rgb(128, 128, 128) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/psyche9.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:1px dashed rgb(73, 73, 73);bottom:103px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:270px;hyphens:manual;inset:59px 1030px 103px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:1030px;rx:auto;ry:auto;speak:normal;stroke:none;top:59px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;visibility:visible;widows:2;width:200px;x:0px;y:0px;zoom:1;};</style>
        <div id="deathgate" class="resize-drag my-pedal target-style-container gradiant-target" style="border: 1px solid rgb(73, 73, 73);text-align: center;display: grid;vertical-align: baseline;padding: 1px;margin: 2px;box-sizing: border-box;background-size: 100% 100%;box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px;border-radius: 15px;background-color: grey;touch-action: none;width: 200px;position: relative;top: 0px;left: 0px;height: 270px;transform: none;background-image: url(&quot;/./img/background/psyche9.jpg&quot;);grid-template-rows: 70% 30%;" data-x="0" data-y="0"><div id="grid" style="display: flex;flex-direction: column;align-self: center;"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="60" data-y="-19"><webaudio-knob id="/deathgate/DeadZone" src="/./img/knobs/Jambalaya.png" sprites="100" min="-120" max="0" step="0.001" width="50" height="50" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/Jambalaya.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px -800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><label for="DeadZone" style="text-align: center; text-shadow: black 1px 0 5px; display: block; touch-action: none; position: static; z-index: 1; border: none; font-size: 20px; color: rgb(255, 255, 255); font-family: Shojumaru; place-self: center;" class="drag" contenteditable="false" data-x="-37" data-y="-17" font="Shojumaru">Dead Zone</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="61" data-y="-8"><webaudio-knob id="/deathgate/NoiseGate" src="/./img/knobs/Jambalaya.png" sprites="100" min="-120" max="0" step="0.001" width="50" height="50" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/Jambalaya.png&quot;); background-size: 50px 5050px; outline: none; width: 50px; height: 50px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><label for="NoiseGate" style="text-align: center; text-shadow: black 1px 0 5px; display: block; touch-action: none; position: static; z-index: 1; border: none; font-size: 20px; color: rgb(255, 255, 255); font-family: Shojumaru; place-self: center;" class="drag" contenteditable="false" data-x="13" data-y="6" font="Shojumaru">Noise Gate</label></div><label for="deathgate" style="display: block; touch-action: none; position: static; z-index: 1; border: none; font-size: 25px; color: rgb(0, 0, 0); font-family: &quot;Faster One&quot;; -webkit-text-stroke: 1px rgb(255, 255, 255); place-self: center;" class="drag" contenteditable="false" data-x="-83" data-y="205" font="Faster One">deathgate</label></div>`;
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
    this._root.getElementById("/deathgate/DeadZone").value = this._plug.audioNode.getParamValue("/deathgate/DeadZone");

    this._root.getElementById("/deathgate/NoiseGate").value =
      this._plug.audioNode.getParamValue("/deathgate/NoiseGate");

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
      .getElementById("/deathgate/DeadZone")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/deathgate/DeadZone", e.target.value));
    this._root
      .getElementById("/deathgate/NoiseGate")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/deathgate/NoiseGate", e.target.value));
  }

  setSliders() {}

  setSwitches() {}

  setInactive() {
    let switches = this._root.querySelectorAll(".switch webaudio-switch");

    switches.forEach((s) => {
      console.log("### SWITCH ID = " + s.id);
      this._plug.audioNode.setParamValue(s.id, 0);
    });
  }
}
try {
  customElements.define("wap-deathgate", deathgateGui);
  console.log("Element defined");
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
