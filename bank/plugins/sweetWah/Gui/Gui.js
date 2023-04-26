import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class SweetGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML =
      '<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgb(42, 3, 43), rgb(84, 13, 54)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/?name=Sweet.dsp") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0px dashed rgb(73, 73, 73);bottom:0px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:inline-block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:300px;hyphens:manual;inset:0px;isolation:auto;left:0px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:0px;rx:auto;ry:auto;speak:normal;stroke:none;top:0px;transform:matrix(1, 0, 0, 1, 7.27274, 6.36364);transition:all 0s ease 0s;visibility:visible;widows:2;width:200px;x:0px;y:0px;zoom:1;};</style>\n' +
      '<div id="Sweet" class="resize-drag my-pedal target-style-container gradiant-target" style="border: 0px solid rgb(73, 73, 73); text-align: center; display: grid; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgb(42, 3, 43), rgb(84, 13, 54)), url(&quot;&quot;) 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; touch-action: none; width: 200px; position: relative; top: 0px; left: 0px; height: 300px; transform: none; grid-template-rows: repeat(3, 1fr);" data-x="7.272735595703125" data-y="6.363639831542969"><div id="grid" style="display: grid;grid-template-columns: repeat(2, 1fr);"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="31.818145751953125" data-y="74.54544448852539"><webaudio-knob id="/Sweet/Frequency" src="/./img/knobs/knob2.png" sprites="100" min="0" max="12" step="0.001" width="60" height="60" style="touch-action: none; display: block;"><style>\n' +
      "\n" +
      ".webaudioctrl-tooltip{\n" +
      "  display:inline-block;\n" +
      "  position:absolute;\n" +
      "  margin:0 -1000px;\n" +
      "  z-index: 999;\n" +
      "  background:#eee;\n" +
      "  color:#000;\n" +
      "  border:1px solid #666;\n" +
      "  border-radius:4px;\n" +
      "  padding:5px 10px;\n" +
      "  text-align:center;\n" +
      "  left:0; top:0;\n" +
      "  font-size:11px;\n" +
      "  opacity:0;\n" +
      "  visibility:hidden;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:before{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -8px;\n" +
      "\tborder: 8px solid transparent;\n" +
      "\tborder-top: 8px solid #666;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:after{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -6px;\n" +
      "\tborder: 6px solid transparent;\n" +
      "\tborder-top: 6px solid #eee;\n" +
      "}\n" +
      "\n" +
      "webaudio-knob{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "  cursor:pointer;\n" +
      "  font-family: sans-serif;\n" +
      "  font-size: 11px;\n" +
      "}\n" +
      ".webaudio-knob-body{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  z-index:1;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "}\n" +
      "</style>\n" +
      '<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/knob2.png&quot;); background-size: 60px 6060px; outline: none; width: 60px; height: 60px; background-position: 0px -1980px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1005.23px; top: -44px;">0.000</div>\n' +
      '</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="98.15615374483684" data-y="-93.01260900715103"><webaudio-knob id="/Sweet/High" src="/./img/knobs/knob2.png" sprites="100" min="0" max="1" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>\n' +
      "\n" +
      ".webaudioctrl-tooltip{\n" +
      "  display:inline-block;\n" +
      "  position:absolute;\n" +
      "  margin:0 -1000px;\n" +
      "  z-index: 999;\n" +
      "  background:#eee;\n" +
      "  color:#000;\n" +
      "  border:1px solid #666;\n" +
      "  border-radius:4px;\n" +
      "  padding:5px 10px;\n" +
      "  text-align:center;\n" +
      "  left:0; top:0;\n" +
      "  font-size:11px;\n" +
      "  opacity:0;\n" +
      "  visibility:hidden;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:before{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -8px;\n" +
      "\tborder: 8px solid transparent;\n" +
      "\tborder-top: 8px solid #666;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:after{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -6px;\n" +
      "\tborder: 6px solid transparent;\n" +
      "\tborder-top: 6px solid #eee;\n" +
      "}\n" +
      "\n" +
      "webaudio-knob{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "  cursor:pointer;\n" +
      "  font-family: sans-serif;\n" +
      "  font-size: 11px;\n" +
      "}\n" +
      ".webaudio-knob-body{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  z-index:1;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "}\n" +
      "</style>\n" +
      '<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/knob2.png&quot;); background-size: 60px 6060px; outline: none; width: 60px; height: 60px; background-position: 0px -4800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.29px; top: -44px;">0.00</div>\n' +
      '</webaudio-knob></div><label for="Frequency" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; color: rgb(255, 255, 255); border: none; -webkit-text-stroke-width: 0px; font-family: Galada; font-size: 17px; place-self: center;" class="drag" contenteditable="false" data-x="19.09088134765625" data-y="91.81817626953125" font="Galada">Frequency</label><label for="High" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; color: rgb(255, 255, 255); border: none; -webkit-text-stroke-width: 0px; font-family: Galada; font-size: 17px; place-self: center;" class="drag" contenteditable="false" data-x="105.45455932617188" data-y="-82.7272720336914" font="Galada">High</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="95.88475346306006" data-y="-87.29702449104144"><webaudio-knob id="/Sweet/Low" src="/./img/knobs/knob2.png" sprites="100" min="0" max="1" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>\n' +
      "\n" +
      ".webaudioctrl-tooltip{\n" +
      "  display:inline-block;\n" +
      "  position:absolute;\n" +
      "  margin:0 -1000px;\n" +
      "  z-index: 999;\n" +
      "  background:#eee;\n" +
      "  color:#000;\n" +
      "  border:1px solid #666;\n" +
      "  border-radius:4px;\n" +
      "  padding:5px 10px;\n" +
      "  text-align:center;\n" +
      "  left:0; top:0;\n" +
      "  font-size:11px;\n" +
      "  opacity:0;\n" +
      "  visibility:hidden;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:before{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -8px;\n" +
      "\tborder: 8px solid transparent;\n" +
      "\tborder-top: 8px solid #666;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:after{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -6px;\n" +
      "\tborder: 6px solid transparent;\n" +
      "\tborder-top: 6px solid #eee;\n" +
      "}\n" +
      "\n" +
      "webaudio-knob{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "  cursor:pointer;\n" +
      "  font-family: sans-serif;\n" +
      "  font-size: 11px;\n" +
      "}\n" +
      ".webaudio-knob-body{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  z-index:1;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "}\n" +
      "</style>\n" +
      '<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/knob2.png&quot;); background-size: 60px 6060px; outline: none; width: 60px; height: 60px; background-position: 0px -4800px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.29px; top: -44px;">0.00</div>\n' +
      '</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="19.090911865234375" data-y="-254.5454559326172"><webaudio-knob id="/Sweet/Mix" src="/./img/knobs/knob2.png" sprites="100" min="0" max="1" step="0.01" width="60" height="60" style="touch-action: none; display: block;"><style>\n' +
      "\n" +
      ".webaudioctrl-tooltip{\n" +
      "  display:inline-block;\n" +
      "  position:absolute;\n" +
      "  margin:0 -1000px;\n" +
      "  z-index: 999;\n" +
      "  background:#eee;\n" +
      "  color:#000;\n" +
      "  border:1px solid #666;\n" +
      "  border-radius:4px;\n" +
      "  padding:5px 10px;\n" +
      "  text-align:center;\n" +
      "  left:0; top:0;\n" +
      "  font-size:11px;\n" +
      "  opacity:0;\n" +
      "  visibility:hidden;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:before{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -8px;\n" +
      "\tborder: 8px solid transparent;\n" +
      "\tborder-top: 8px solid #666;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:after{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -6px;\n" +
      "\tborder: 6px solid transparent;\n" +
      "\tborder-top: 6px solid #eee;\n" +
      "}\n" +
      "\n" +
      "webaudio-knob{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "  cursor:pointer;\n" +
      "  font-family: sans-serif;\n" +
      "  font-size: 11px;\n" +
      "}\n" +
      ".webaudio-knob-body{\n" +
      "  display:inline-block;\n" +
      "  position:relative;\n" +
      "  z-index:1;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "}\n" +
      "</style>\n" +
      '<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/knob2.png&quot;); background-size: 60px 6060px; outline: none; width: 60px; height: 60px; background-position: 0px -3000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1008.29px; top: -44px;">0.00</div>\n' +
      '</webaudio-knob></div><label for="Low" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; color: rgb(255, 255, 255); border: none; -webkit-text-stroke-width: 0px; font-family: Galada; font-size: 17px; place-self: center;" class="drag" contenteditable="false" data-x="104.54545593261719" data-y="-70.90910339355469" font="Galada">Frequency</label><label for="Mix" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: none; color: rgb(255, 255, 255); -webkit-text-stroke-width: 0px; font-family: Galada; font-size: 17px; place-self: center;" class="drag" contenteditable="false" data-x="12.727279663085938" data-y="-241.81817626953125" font="Galada">Dry/Wet</label></div><label for="Sweet" style="display: block; touch-action: none; position: static; z-index: 1; border: none; color: rgb(255, 255, 255); -webkit-text-stroke-width: 0px; font-family: Galada; font-size: 29px; place-self: center;" class="drag" contenteditable="false" data-x="22.727294921875" data-y="202.72727584838867" font="Galada">Sweet Wah</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="65.45445251464844" data-y="-115.45462036132812"><webaudio-switch id="/Sweet/bypass" src="/./img/switches/switch_1.png" sprites="100" width="60" height="40" style="touch-action: none;"><style>\n' +
      "\n" +
      ".webaudioctrl-tooltip{\n" +
      "  display:inline-block;\n" +
      "  position:absolute;\n" +
      "  margin:0 -1000px;\n" +
      "  z-index: 999;\n" +
      "  background:#eee;\n" +
      "  color:#000;\n" +
      "  border:1px solid #666;\n" +
      "  border-radius:4px;\n" +
      "  padding:5px 10px;\n" +
      "  text-align:center;\n" +
      "  left:0; top:0;\n" +
      "  font-size:11px;\n" +
      "  opacity:0;\n" +
      "  visibility:hidden;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:before{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -8px;\n" +
      "\tborder: 8px solid transparent;\n" +
      "\tborder-top: 8px solid #666;\n" +
      "}\n" +
      ".webaudioctrl-tooltip:after{\n" +
      '  content: "";\n' +
      "\tposition: absolute;\n" +
      "\ttop: 100%;\n" +
      "\tleft: 50%;\n" +
      " \tmargin-left: -6px;\n" +
      "\tborder: 6px solid transparent;\n" +
      "\tborder-top: 6px solid #eee;\n" +
      "}\n" +
      "\n" +
      "webaudio-switch{\n" +
      "  display:inline-block;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "  font-family: sans-serif;\n" +
      "  font-size: 11px;\n" +
      "  cursor:pointer;\n" +
      "}\n" +
      ".webaudio-switch-body{\n" +
      "  display:inline-block;\n" +
      "  margin:0;\n" +
      "  padding:0;\n" +
      "}\n" +
      "</style>\n" +
      '<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 60px; height: 40px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden;"></div></div>\n' +
      "</webaudio-switch></div></div>";

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
    this._root.getElementById("/Sweet/Frequency").value = this._plug.audioNode.getParamValue("/Sweet/Frequency");

    this._root.getElementById("/Sweet/High").value = this._plug.audioNode.getParamValue("/Sweet/High");

    this._root.getElementById("/Sweet/Low").value = this._plug.audioNode.getParamValue("/Sweet/Low");

    this._root.getElementById("/Sweet/Mix").value = this._plug.audioNode.getParamValue("/Sweet/Mix");

    this._root.getElementById("/Sweet/bypass").value = 1 - this._plug.audioNode.getParamValue("/Sweet/bypass");

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
      .getElementById("/Sweet/Frequency")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/Sweet/Frequency", e.target.value));
    this._root
      .getElementById("/Sweet/High")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/Sweet/High", e.target.value));
    this._root
      .getElementById("/Sweet/Low")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/Sweet/Low", e.target.value));
    this._root
      .getElementById("/Sweet/Mix")
      .addEventListener("input", (e) => this._plug.audioNode.setParamValue("/Sweet/Mix", e.target.value));
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/Sweet/bypass")
      .addEventListener("change", (e) => this._plug.audioNode.setParamValue("/Sweet/bypass", 1 - e.target.value));
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
  customElements.define("wap-sweet", SweetGui);
  console.log("Element defined");
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
