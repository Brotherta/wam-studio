import "../../utils/webaudio-controls.js";

const getBaseURL = () => {
  const base = new URL(".", import.meta.url);
  return `${base}`;
};
export default class compressorGui extends HTMLElement {
  constructor(plug) {
    super();
    this._plug = plug;
    this._plug.gui = this;
    console.log(this._plug);

    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>
        .my-pedal {
          animation: none 0s ease 0s 1 normal none running;
          appearance: none;
          background: linear-gradient(to top, rgb(25, 70, 130), rgb(25, 79, 136))
              repeat scroll 0% 0% / auto padding-box border-box,
            rgba(0, 0, 0, 0)
              url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/?name=compressor.dsp")
              repeat scroll 0% 0% / 100% 100% padding-box border-box;
          border: 0px solid rgb(52, 73, 130);
          bottom: 0px;
          clear: none;
          clip: auto;
          color: rgb(33, 37, 41);
          columns: auto auto;
          contain: none;
          content: normal;
          cursor: auto;
          cx: 0px;
          cy: 0px;
          d: none;
          direction: ltr;
          display: inline-block;
          fill: rgb(0, 0, 0);
          filter: none;
          flex: 0 1 auto;
          float: none;
          font: 16px / 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          gap: normal;
          grid: none / none / none / row / auto / auto;
          height: 350px;
          hyphens: manual;
          inset: 0px;
          isolation: auto;
          left: 0px;
          margin: 2px;
          marker: none;
          mask: none;
          offset: none 0px auto 0deg;
          opacity: 1;
          order: 0;
          orphans: 2;
          outline: rgb(33, 37, 41) none 0px;
          overflow: visible;
          padding: 1px;
          page: auto;
          perspective: none;
          position: unset;
          quotes: auto;
          r: 0px;
          resize: none;
          right: 0px;
          rx: auto;
          ry: auto;
          speak: normal;
          stroke: none;
          top: 0px;
          transform: none;
          transition: all 0s ease 0s;
          visibility: visible;
          widows: 2;
          width: 300px;
          x: 0px;
          y: 0px;
          zoom: 1;
        }
      </style>
      <div
        id="compressor"
        class="resize-drag my-pedal gradiant-target"
        style="
          border: 0px solid rgb(52, 73, 130);
          text-align: center;
          display: grid;
          vertical-align: baseline;
          padding: 1px;
          margin: 2px;
          box-sizing: border-box;
          background: linear-gradient(to top, rgb(25, 52, 130), rgb(25, 37, 136)), url(&quot;&quot;))))) 0% 0% / 100% 100%;
          box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px,
            rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset,
            rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset,
            rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px,
            rgba(0, 0, 0, 0.9) 1px 1px 1px 0px;
          touch-action: none;
          width: 300px;
          position: relative;
          top: 0px;
          left: 0px;
          height: 350px;
          transform: none;
          grid-template-rows: repeat(3, 1fr);
        "
      >
        <label
          for="compressor"
          style="
            display: block;
            touch-action: none;
            position: static;
            z-index: 1;
            border: none;
            grid-row: 2;
            font-family: 'Bungee Shade';
            font-size: 30px;
            place-self: center;
            color: white;
          "
          class="drag target-style-label"
          contenteditable="false"
          font="Bungee Shade"
          >DISTORDER</label
        >
        <div
          id="grid"
          style="
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(1, 1fr);
            margin-top: 15px;
          "
        >
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/bass"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="-15"
              max="15"
              step="0.1"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -3200px;
                  transform: rotate(0deg);
                "
              ></div>
              <div
                class="webaudioctrl-tooltip"
                style="
                  display: inline-block;
                  width: auto;
                  height: auto;
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                  left: 1013.35px;
                  top: -44px;
                "
              >
                0.0
              </div>
            </webaudio-knob>
          </div>
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/drive"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="0"
              max="100"
              step="0.01"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -4032px;
                  transform: rotate(0deg);
                "
              ></div>
              <div
                class="webaudioctrl-tooltip"
                style="
                  display: inline-block;
                  width: auto;
                  height: auto;
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                  left: 1010.29px;
                  top: -44px;
                "
              >
                0.00
              </div>
            </webaudio-knob>
          </div>
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/middle"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="-15"
              max="15"
              step="0.1"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -3200px;
                  transform: rotate(0deg);
                "
              ></div>
              <div
                class="webaudioctrl-tooltip"
                style="
                  display: inline-block;
                  width: auto;
                  height: auto;
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                  left: 1013.35px;
                  top: -44px;
                "
              >
                0.0
              </div>
            </webaudio-knob>
          </div>
          <label
            for="bass"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              border: none;
              font-family: Skranji;
              place-self: top;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            width=""
            height=""
            >bass</label
          ><label
            for="drive"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              font-family: Skranji;
              place-self: top;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            >drive</label
          ><label
            for="middle"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              font-family: Skranji;
              border: none;
              place-self: top;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            >middle</label
          >
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/treble"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="-15"
              max="15"
              step="0.1"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -3200px;
                  transform: rotate(0deg);
                "
              ></div>
              <div class="webaudioctrl-tooltip"></div>
            </webaudio-knob>
          </div>
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/voice"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="0"
              max="1"
              step="0.001"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -3200px;
                  transform: rotate(0deg);
                "
              ></div>
              <div
                class="webaudioctrl-tooltip"
                style="
                  display: inline-block;
                  width: auto;
                  height: auto;
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                  left: 1007.23px;
                  top: -44px;
                "
              >
                0.000
              </div>
            </webaudio-knob>
          </div>
          <div
            class="drag"
            style="
              padding: 1px;
              margin: 1px;
              text-align: center;
              display: inline-block;
              box-sizing: border-box;
              touch-action: none;
              position: static;
              place-self: center;
            "
          >
            <webaudio-knob
              id="/compressor/volume"
              src="/./img/knobs/Carbon.png"
              sprites="100"
              min="0"
              max="1"
              step="0.001"
              width=""
              height=""
              style="touch-action: none; display: block"
              ><style>
                .webaudioctrl-tooltip {
                  display: inline-block;
                  position: absolute;
                  margin: 0 -1000px;
                  z-index: 999;
                  background: #eee;
                  color: #000;
                  border: 1px solid #666;
                  border-radius: 4px;
                  padding: 5px 10px;
                  text-align: center;
                  left: 0;
                  top: 0;
                  font-size: 11px;
                  opacity: 0;
                  visibility: hidden;
                }
                .webaudioctrl-tooltip:before {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -8px;
                  border: 8px solid transparent;
                  border-top: 8px solid #666;
                }
                .webaudioctrl-tooltip:after {
                  content: "";
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  margin-left: -6px;
                  border: 6px solid transparent;
                  border-top: 6px solid #eee;
                }
      
                webaudio-knob {
                  display: inline-block;
                  position: relative;
                  margin: 0;
                  padding: 0;
                  cursor: pointer;
                  font-family: sans-serif;
                  font-size: 11px;
                }
                .webaudio-knob-body {
                  display: inline-block;
                  position: relative;
                  z-index: 1;
                  margin: 0;
                  padding: 0;
                }
              </style>
              <div
                class="webaudio-knob-body"
                tabindex="1"
                touch-action="none"
                style="
                  background-image: url('/./img/knobs/Carbon.png');
                  background-size: 64px 6464px;
                  outline: none;
                  width: 64px;
                  height: 64px;
                  background-position: 0px -3200px;
                  transform: rotate(0deg);
                "
              ></div>
              <div
                class="webaudioctrl-tooltip"
                style="
                  display: inline-block;
                  width: auto;
                  height: auto;
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                  left: 1007.23px;
                  top: -44px;
                "
              >
                0.000
              </div>
            </webaudio-knob>
          </div>
          <label
            for="treble"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              font-family: Skranji;
              place-self: center;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            >treble</label
          ><label
            for="voice"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              font-family: Skranji;
              place-self: center;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            >voice</label
          ><label
            for="volume"
            style="
              text-align: center;
              display: block;
              touch-action: none;
              position: static;
              z-index: 1;
              font-family: Skranji;
              place-self: center;
              color: white;
            "
            class="drag"
            contenteditable="false"
            font="Skranji"
            >volume</label
          >
        </div>
        <div
          class="drag"
          style="
            padding: 1px;
            margin: 1px;
            text-align: center;
            display: inline-block;
            box-sizing: border-box;
            touch-action: none;
            position: static;
            place-self: center;
          "
          data-x="195"
          data-y="29"
        >
          <webaudio-switch
            id="/compressor/99_bypass"
            src="/./img/switches/switch_1.png"
            sprites="100"
            width="64"
            height="40"
            style="touch-action: none"
            ><style>
              .webaudioctrl-tooltip {
                display: inline-block;
                position: absolute;
                margin: 0 -1000px;
                z-index: 999;
                background: #eee;
                color: #000;
                border: 1px solid #666;
                border-radius: 4px;
                padding: 5px 10px;
                text-align: center;
                left: 0;
                top: 0;
                font-size: 11px;
                opacity: 0;
                visibility: hidden;
              }
              .webaudioctrl-tooltip:before {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -8px;
                border: 8px solid transparent;
                border-top: 8px solid #666;
              }
              .webaudioctrl-tooltip:after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -6px;
                border: 6px solid transparent;
                border-top: 6px solid #eee;
              }
      
              webaudio-switch {
                display: inline-block;
                margin: 0;
                padding: 0;
                font-family: sans-serif;
                font-size: 11px;
                cursor: pointer;
              }
              .webaudio-switch-body {
                display: inline-block;
                margin: 0;
                padding: 0;
              }
            </style>
            <div
              class="webaudio-switch-body"
              tabindex="1"
              touch-action="none"
              style="
                background-image: url('/./img/switches/switch_1.png');
                background-size: 100% 200%;
                width: 64px;
                height: 35px;
                outline: none;
                background-position: 0px -100%;
              "
            >
              <div
                class="webaudioctrl-tooltip"
                style="
                  transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s;
                  opacity: 0;
                  visibility: hidden;
                "
              ></div>
            </div>
          </webaudio-switch>
        </div>
      </div>
      `;
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
    this._root.getElementById("/compressor/bass").value =
      this._plug.audioNode.getParamValue("/compressor/bass");

    this._root.getElementById("/compressor/drive").value =
      this._plug.audioNode.getParamValue("/compressor/drive");

    this._root.getElementById("/compressor/middle").value =
      this._plug.audioNode.getParamValue("/compressor/middle");

    this._root.getElementById("/compressor/treble").value =
      this._plug.audioNode.getParamValue("/compressor/treble");

    this._root.getElementById("/compressor/voice").value =
      this._plug.audioNode.getParamValue("/compressor/voice");

    this._root.getElementById("/compressor/volume").value =
      this._plug.audioNode.getParamValue("/compressor/volume");

    this._root.getElementById("/compressor/99_bypass").value =
      1 - this._plug.audioNode.getParamValue("/compressor/99_bypass");

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
      .getElementById("/compressor/bass")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/compressor/bass", e.target.value),
      );
    this._root
      .getElementById("/compressor/drive")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/compressor/drive", e.target.value),
      );
    this._root
      .getElementById("/compressor/middle")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/compressor/middle",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/compressor/treble")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/compressor/treble",
          e.target.value,
        ),
      );
    this._root
      .getElementById("/compressor/voice")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue("/compressor/voice", e.target.value),
      );
    this._root
      .getElementById("/compressor/volume")
      .addEventListener("input", (e) =>
        this._plug.audioNode.setParamValue(
          "/compressor/volume",
          e.target.value,
        ),
      );
  }

  setSliders() {}

  setSwitches() {
    this._root
      .getElementById("/compressor/99_bypass")
      .addEventListener("change", (e) =>
        this._plug.audioNode.setParamValue(
          "/compressor/99_bypass",
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
  customElements.define("wap-compressor", compressorGui);
} catch (error) {
  console.log(error);
  console.log("Element already defined");
}
