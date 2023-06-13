import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class OwlDirtyGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgba(0, 255, 89, 1), rgba(212, 0, 255, 1)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/?name=OwlDirty.dsp") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0px dashed rgb(73, 73, 73);bottom:198.719px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:300px;hyphens:manual;inset:58.2812px 611px 198.719px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:611px;rx:auto;ry:auto;speak:normal;stroke:none;top:58.2812px;transform:none;transition:all 0s ease 0s;visibility:visible;widows:2;width:200px;x:0px;y:0px;zoom:1;};</style>
        <div id="OwlDirty" class="resize-drag my-pedal target-style-container gradiant-target" style="border: 0px solid rgb(73, 73, 73); text-align: center; display: grid; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgba(0, 255, 89, 1), rgba(212, 0, 255, 1)) repeat scroll 0% 0%, rgba(0, 0, 0, 0) url(&quot;&quot;) repeat scroll 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; touch-action: none; width: 200px; position: relative; top: 0px; left: 0px; height: 300px; opacity: 1; transform: none; grid-template-rows: repeat(3, 1fr);"><div id="grid" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr);height: 90%;"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center; margin-top: 5px" data-x="22.354522705078125" data-y="3.800140380859375"><webaudio-knob id="/OwlDirty/DECAY" src="/./img/knobs/simplegray.png" sprites="100" min="0.5" max="1" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/simplegray.png&quot;); background-size: 60px 6060px; outline: currentcolor none medium; width: 60px; height: 60px; background-position: 0px -2340px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="109.48489379882812" data-y="-75.41824340820312"><webaudio-knob id="/OwlDirty/DRIVE" src="/./img/knobs/simplegray.png" sprites="100" min="0" max="0.7" step="0.1" width="60" height="60" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/simplegray.png&quot;); background-size: 60px 6060px; outline: currentcolor none medium; width: 60px; height: 60px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><label for="DECAY" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; font-size: 20px; color: rgb(255, 255, 255); -webkit-text-stroke: 1px rgb(0, 0, 0); font-family: Skranji; border: medium none; place-self: center;" class="drag" font="Skranji" data-x="-10.343902587890625" data-y="12.185302734375" contenteditable="false">DECAY</label><label for="DRIVE" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; font-size: 20px; color: rgb(255, 255, 255); -webkit-text-stroke: 1px rgb(0, 0, 0); font-family: Skranji; border: medium none; place-self: center;" class="drag" font="Skranji" data-x="78.38241577148438" data-y="-60.107879638671875" contenteditable="false">DRIVE</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="22.09991455078125" data-y="-65.15768432617188"><webaudio-knob id="/OwlDirty/MIX" src="/./img/knobs/simplegray.png" sprites="100" min="0" max="1" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/simplegray.png&quot;); background-size: 60px 6060px; outline: currentcolor none medium; width: 60px; height: 60px; background-position: 0px -4500px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.3px; top: -44px;">0.00</div>
        </webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="108.75548194026459" data-y="-142.88422753239183"><webaudio-knob id="/OwlDirty/TONE" src="/./img/knobs/simplegray.png" sprites="100" min="900" max="8000" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/simplegray.png&quot;); background-size: 60px 6060px; outline: currentcolor none medium; width: 60px; height: 60px; background-position: 0px -2580px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.3px; top: -44px;">0.00</div>
        </webaudio-knob></div><label for="MIX" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; font-size: 20px; color: rgb(255, 255, 255); -webkit-text-stroke: 1px rgb(0, 0, 0); font-family: Skranji; border: medium none; place-self: center;" class="drag" font="Skranji" data-x="-11.404998779296875" data-y="-46.06732177734375" contenteditable="false">MIX</label><label for="TONE" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; font-size: 20px; color: rgb(255, 255, 255); -webkit-text-stroke: 1px rgb(0, 0, 0); font-family: Skranji; border: medium none; place-self: center;" class="drag" font="Skranji" data-x="74.60150146484375" data-y="-115.583740234375" contenteditable="false">TONE</label></div><label for="OwlDirty" style="display: block; touch-action: none; position: fixed; z-index: 1; border: medium none; font-size: 25px; color: rgb(255, 255, 255); -webkit-text-stroke: 1px rgb(0, 0, 0); font-family: Skranji; place-self: center; top : 137%" class="drag" font="Skranji" data-x="37.96380615234375" data-y="0" contenteditable="false">OwlDirty</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="41.74237060546875" data-y="-114.38226318359375"><webaudio-switch id="/OwlDirty/bypass" src="/./img/switches/switch_1.png" sprites="100" width="64" height="40" style="touch-action: none;"><style>
        
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
          margin:5px;
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
        <div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 64px; height: 40px; outline: currentcolor none medium; background-position: 0px -100%;"><div class="webaudioctrl-tooltip"></div></div>
        </webaudio-switch></div></div>`;

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
    this._root.getElementById("/OwlDirty/DECAY").value = this._plug.audioNode.getParamValue("/OwlDirty/DECAY");

    this._root.getElementById("/OwlDirty/DRIVE").value = this._plug.audioNode.getParamValue("/OwlDirty/DRIVE");

    this._root.getElementById("/OwlDirty/MIX").value = this._plug.audioNode.getParamValue("/OwlDirty/MIX");

    this._root.getElementById("/OwlDirty/TONE").value = this._plug.audioNode.getParamValue("/OwlDirty/TONE");

    this._root.getElementById("/OwlDirty/bypass").value = 1 - this._plug.audioNode.getParamValue("/OwlDirty/bypass");

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
      .getElementById("/OwlDirty/DECAY")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/OwlDirty/DECAY", e.target.value));
    this._root
      .getElementById("/OwlDirty/DRIVE")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/OwlDirty/DRIVE", e.target.value));
    this._root
      .getElementById("/OwlDirty/MIX")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/OwlDirty/MIX", e.target.value));
    this._root
      .getElementById("/OwlDirty/TONE")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/OwlDirty/TONE", e.target.value));
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/OwlDirty/bypass")
      .addEventListener("change", (e) => this._plug.audioNode.setParamValue("/OwlDirty/bypass", 1 - e.target.value));
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
  customElements.define("wap-owldirty", OwlDirtyGui);
  ;
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
