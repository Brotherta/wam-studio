import '../../utils/webaudio-controls.js'

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
        this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:linear-gradient(to top, rgb(165, 40, 200), rgb(203, 37, 37)) repeat scroll 0% 0% / auto padding-box border-box, rgba(0, 0, 0, 0) url("https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/metal11.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:0.8px solid rgb(73, 73, 73);bottom:221.619px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:314.6px;hyphens:manual;inset:58.1813px 563.025px 221.619px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:563.025px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.1813px;transform:matrix(1, 0, 0, 1, -123.585, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:242.575px;x:0px;y:0px;zoom:1;};</style>
        <div id="CompressorGuitarix" class="resize-drag my-pedal gradiant-target" style="border: medium none; text-align: center; display: grid; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background: linear-gradient(to top, rgb(165, 40, 200), rgb(203, 37, 37)), url(&quot;https://mainline.i3s.unice.fr/PedalEditor/Back-End/functional-pedals/commonAssets/img/background/metal11.jpg&quot;) 0% 0% / 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; touch-action: none; width: 242.581px; position: relative; top: 0px; left: 0px; height: 314.602px; transform: none; grid-template-rows: repeat(3, 1fr);" data-x="-123.58500671386719" data-y="0"><label for="CompressorGuitarix" style="display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; font-size: 23px; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); place-self: center;" class="drag" data-x="24.30723447651809" data-y="205.06692295986232" font="Skranji" contenteditable="false">CompressorGT</label><div id="grid" style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="160.23912811279297" data-y="-152.86180114746094"><webaudio-knob id="/CompressorGuitarix/Attack" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="0" max="1" step="0.001" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px 0px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 995.242px; top: -44px;">0.000</div>
        </webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="42.95683288574219" data-y="-69.84754943847656"><webaudio-knob id="/CompressorGuitarix/Knee" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="0" max="20" step="0.1" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px -600px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1001.36px; top: -44px;">0.0</div>
        </webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="71.66630554199219" data-y="-232.56246948242188"><webaudio-knob id="/CompressorGuitarix/Ratio" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="1" max="20" step="0.1" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px -200px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1001.36px; top: -44px;">0.0</div>
        </webaudio-knob></div><label for="Attack" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="152.79295349121094" data-y="-152.02780151367188" font="Skranji" contenteditable="false">Attack</label><label for="Knee" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="39.34161376953125" data-y="-64.65458679199219" font="Skranji" contenteditable="false">Knee</label><label for="Ratio" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="58.94419860839844" data-y="-233.0755844116211" font="Skranji" contenteditable="false">Ratio</label><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="-0.185699462890625" data-y="-229.85718536376953"><webaudio-knob id="/CompressorGuitarix/Release" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="0" max="10" step="0.01" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px -200px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><div class="drag target-style" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="2.1013031005859375" data-y="-394.30323791503906"><webaudio-knob id="/CompressorGuitarix/Threshold" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="-96" max="10" step="0.1" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px -2840px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1001.36px; top: -44px;">0.0</div>
        </webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="139.0149688720703" data-y="39.26655578613281"><webaudio-knob id="/CompressorGuitarix/3-gain/Makeup_Gain" src="/./img/knobs/MiniMoog_Main.png" sprites="100" min="-96" max="96" step="0.1" width="40" height="40" style="touch-action: none; display: block;"><style>
        
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
        <div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/knobs/MiniMoog_Main.png&quot;); background-size: 40px 4040px; outline: none; width: 40px; height: 40px; background-position: 0px -2000px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip"></div>
        </webaudio-knob></div><label for="Release" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="-13.810928344726562" data-y="-225.3245849609375" font="Skranji" contenteditable="false">Release</label><label for="Threshold" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="-44.207786560058594" data-y="-393.5933074951172" font="Skranji" contenteditable="false">Threshold</label><label for="Makeup Gain" style="text-align: center; display: block; touch-action: none; position: static; z-index: 1; border: medium none; font-family: Skranji; -webkit-text-stroke: 1px rgb(108, 109, 39); color: rgb(215, 222, 202); font-size: 17px; place-self: center;" class="drag" data-x="136.86427307128906" data-y="43.00633239746094" font="Skranji" contenteditable="false">Gain</label></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: static; place-self: center;" data-x="83.762451171875" data-y="-240.10812997817993"><webaudio-switch id="/CompressorGuitarix/bypass" src="/./img/switches/switch_1.png" sprites="100" width="42" height="24" style="touch-action: none;"><style>
        
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
        <div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;/./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 42px; height: 24px; outline: none; background-position: 0px -100%;"><div class="webaudioctrl-tooltip"></div></div>
        </webaudio-switch></div></div>

        `;
  
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
          console.log("Element defined");
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      