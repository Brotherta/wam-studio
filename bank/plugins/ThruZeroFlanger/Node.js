/*
Code generated with Faust version 2.40.12
Compilation options: -lang wasm-ib -cn ThruZeroFlanger -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONThruZeroFlanger() {
  return '{"name": "ThruZeroFlanger","filename": "ThruZeroFlanger.dsp","version": "2.40.12","compile_options": "-lang wasm-ib -cn ThruZeroFlanger -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/3D29FC1A4CBEE97F9AAEF48597159EE6ED0DC7D6/web/wap"],"size": 67692,"inputs": 2,"outputs": 2,"meta": [ { "author": "Oli Larkin (contact@olilarkin.co.uk)" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn ThruZeroFlanger -es 1 -mcd 16 -single -ftz 2" },{ "copyright": "Oliver Larkin" },{ "delays_lib_name": "Faust Delay Library" },{ "delays_lib_version": "0.1" },{ "description": "Stereo Thru Zero Flanger - warning can ZERO the sound!" },{ "filename": "ThruZeroFlanger.dsp" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/maths.lib" },{ "library_path3": "/libraries/platform.lib" },{ "library_path4": "/libraries/delays.lib" },{ "library_path5": "/libraries/signals.lib" },{ "licence": "GPL" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "ThruZeroFlanger" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "0.1" }],"ui": [ {"type": "vgroup","label": "ThruZeroFlanger","items": [ {"type": "hslider","label": "Delay","shortname": "Delay","address": "/ThruZeroFlanger/Delay","index": 34856,"meta": [{ "OWL": "PARAMETER_B" },{ "style": "knob" },{ "unit": "ms" }],"init": 10,"min": 0.5,"max": 20,"step": 0.01},{"type": "hslider","label": "Depth","shortname": "Depth","address": "/ThruZeroFlanger/Depth","index": 34872,"meta": [{ "OWL": "PARAMETER_D" },{ "style": "knob" },{ "unit": "%" }],"init": 20,"min": 3,"max": 100,"step": 1},{"type": "hslider","label": "L-ROffset","shortname": "L_ROffset","address": "/ThruZeroFlanger/L-ROffset","index": 67672,"meta": [{ "OWL": "PARAMETER_C" },{ "style": "knob" }],"init": 0,"min": 0,"max": 1,"step": 0.001},{"type": "hslider","label": "Rate","shortname": "Rate","address": "/ThruZeroFlanger/Rate","index": 34888,"meta": [{ "OWL": "PARAMETER_A" },{ "style": "knob" },{ "unit": "hz" }],"init": 0.1,"min": 0,"max": 1,"step": 0.001},{"type": "checkbox","label": "bypass","shortname": "bypass","address": "/ThruZeroFlanger/bypass","index": 2060}]}]}';
}
function getBase64CodeThruZeroFlanger() {
  return "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IH0seyAiY29tcGlsYXRpb25fb3B0aW9ucyI6ICItc2luZ2xlIC1zY2FsIC1JIGxpYnJhcmllcy8gLUkgcHJvamVjdC8gLWxhbmcgd2FzbSIgfSx7ICJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtY24gVGhydVplcm9GbGFuZ2VyIC1lcyAxIC1tY2QgMTYgLXNpbmdsZSAtZnR6IDIiIH0seyAiY29weXJpZ2h0IjogIk9saXZlciBMYXJraW4iIH0seyAiZGVsYXlzX2xpYl9uYW1lIjogIkZhdXN0IERlbGF5IExpYnJhcnkiIH0seyAiZGVsYXlzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJkZXNjcmlwdGlvbiI6ICJTdGVyZW8gVGhydSBaZXJvIEZsYW5nZXIgLSB3YXJuaW5nIGNhbiBaRVJPIHRoZSBzb3VuZCEiIH0seyAiZmlsZW5hbWUiOiAiVGhydVplcm9GbGFuZ2VyLmRzcCIgfSx7ICJsaWJyYXJ5X3BhdGgwIjogIi9saWJyYXJpZXMvc3RkZmF1c3QubGliIiB9LHsgImxpYnJhcnlfcGF0aDEiOiAiL2xpYnJhcmllcy9iYXNpY3MubGliIiB9LHsgImxpYnJhcnlfcGF0aDIiOiAiL2xpYnJhcmllcy9tYXRocy5saWIiIH0seyAibGlicmFyeV9wYXRoMyI6ICIvbGlicmFyaWVzL3BsYXRmb3JtLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg0IjogIi9saWJyYXJpZXMvZGVsYXlzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg1IjogIi9saWJyYXJpZXMvc2lnbmFscy5saWIiIH0seyAibGljZW5jZSI6ICJHUEwiIH0seyAibWF0aHNfbGliX2F1dGhvciI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfY29weXJpZ2h0IjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9saWNlbnNlIjogIkxHUEwgd2l0aCBleGNlcHRpb24iIH0seyAibWF0aHNfbGliX25hbWUiOiAiRmF1c3QgTWF0aCBMaWJyYXJ5IiB9LHsgIm1hdGhzX2xpYl92ZXJzaW9uIjogIjIuNSIgfSx7ICJuYW1lIjogIlRocnVaZXJvRmxhbmdlciIgfSx7ICJwbGF0Zm9ybV9saWJfbmFtZSI6ICJHZW5lcmljIFBsYXRmb3JtIExpYnJhcnkiIH0seyAicGxhdGZvcm1fbGliX3ZlcnNpb24iOiAiMC4yIiB9LHsgInNpZ25hbHNfbGliX25hbWUiOiAiRmF1c3QgU2lnbmFsIFJvdXRpbmcgTGlicmFyeSIgfSx7ICJzaWduYWxzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJ2ZXJzaW9uIjogIjAuMSIgfV0sInVpIjogWyB7InR5cGUiOiAidmdyb3VwIiwibGFiZWwiOiAiVGhydVplcm9GbGFuZ2VyIiwiaXRlbXMiOiBbIHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiRGVsYXkiLCJzaG9ydG5hbWUiOiAiRGVsYXkiLCJhZGRyZXNzIjogIi9UaHJ1WmVyb0ZsYW5nZXIvRGVsYXkiLCJpbmRleCI6IDM0ODU2LCJtZXRhIjogW3sgIk9XTCI6ICJQQVJBTUVURVJfQiIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9LHsgInVuaXQiOiAibXMiIH1dLCJpbml0IjogMTAsIm1pbiI6IDAuNSwibWF4IjogMjAsInN0ZXAiOiAwLjAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkRlcHRoIiwic2hvcnRuYW1lIjogIkRlcHRoIiwiYWRkcmVzcyI6ICIvVGhydVplcm9GbGFuZ2VyL0RlcHRoIiwiaW5kZXgiOiAzNDg3MiwibWV0YSI6IFt7ICJPV0wiOiAiUEFSQU1FVEVSX0QiIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJ1bml0IjogIiUiIH1dLCJpbml0IjogMjAsIm1pbiI6IDMsIm1heCI6IDEwMCwic3RlcCI6IDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiTC1ST2Zmc2V0Iiwic2hvcnRuYW1lIjogIkxfUk9mZnNldCIsImFkZHJlc3MiOiAiL1RocnVaZXJvRmxhbmdlci9MLVJPZmZzZXQiLCJpbmRleCI6IDY3NjcyLCJtZXRhIjogW3sgIk9XTCI6ICJQQVJBTUVURVJfQyIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9XSwiaW5pdCI6IDAsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAwMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJSYXRlIiwic2hvcnRuYW1lIjogIlJhdGUiLCJhZGRyZXNzIjogIi9UaHJ1WmVyb0ZsYW5nZXIvUmF0ZSIsImluZGV4IjogMzQ4ODgsIm1ldGEiOiBbeyAiT1dMIjogIlBBUkFNRVRFUl9BIiB9LHsgInN0eWxlIjogImtub2IiIH0seyAidW5pdCI6ICJoeiIgfV0sImluaXQiOiAwLjEsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAwMX0seyJ0eXBlIjogImNoZWNrYm94IiwibGFiZWwiOiAiYnlwYXNzIiwic2hvcnRuYW1lIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL1RocnVaZXJvRmxhbmdlci9ieXBhc3MiLCJpbmRleCI6IDIwNjB9XX1dfQ==";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class ThruZeroFlangerNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "ThruZeroFlanger", options);

    this.baseURL = baseURL;
    this.json = options.processorOptions.json;
    this.json_object = JSON.parse(this.json);

    // JSON parsing functions
    this.parse_ui = function (ui, obj) {
      for (var i = 0; i < ui.length; i++) {
        this.parse_group(ui[i], obj);
      }
    };

    this.parse_group = function (group, obj) {
      if (group.items) {
        this.parse_items(group.items, obj);
      }
    };

    this.parse_items = function (items, obj) {
      for (var i = 0; i < items.length; i++) {
        this.parse_item(items[i], obj);
      }
    };

    this.parse_item = function (item, obj) {
      if (
        item.type === "vgroup" ||
        item.type === "hgroup" ||
        item.type === "tgroup"
      ) {
        this.parse_items(item.items, obj);
      } else if (item.type === "hbargraph" || item.type === "vbargraph") {
        // Keep bargraph adresses
        obj.outputs_items.push(item.address);
      } else if (
        item.type === "vslider" ||
        item.type === "hslider" ||
        item.type === "button" ||
        item.type === "checkbox" ||
        item.type === "nentry"
      ) {
        // Keep inputs adresses
        obj.inputs_items.push(item.address);
        obj.descriptor.push(item);
        // Decode MIDI
        if (item.meta !== undefined) {
          for (var i = 0; i < item.meta.length; i++) {
            if (item.meta[i].midi !== undefined) {
              if (item.meta[i].midi.trim() === "pitchwheel") {
                obj.fPitchwheelLabel.push({
                  path: item.address,
                  min: parseFloat(item.min),
                  max: parseFloat(item.max),
                });
              } else if (item.meta[i].midi.trim().split(" ")[0] === "ctrl") {
                obj.fCtrlLabel[
                  parseInt(item.meta[i].midi.trim().split(" ")[1])
                ].push({
                  path: item.address,
                  min: parseFloat(item.min),
                  max: parseFloat(item.max),
                });
              }
            }
          }
        }
        // Define setXXX/getXXX, replacing '/c' with 'C' everywhere in the string
        var set_name = "set" + item.address;
        var get_name = "get" + item.address;
        set_name = set_name.replace(/\/./g, (x) => {
          return x.substr(1, 1).toUpperCase();
        });
        get_name = get_name.replace(/\/./g, (x) => {
          return x.substr(1, 1).toUpperCase();
        });
        obj[set_name] = (val) => {
          obj.setParamValue(item.address, val);
        };
        obj[get_name] = () => {
          return obj.getParamValue(item.address);
        };
        //console.log(set_name);
        //console.log(get_name);
      }
    };

    this.output_handler = null;

    // input/output items
    this.inputs_items = [];
    this.outputs_items = [];
    this.descriptor = [];

    // MIDI
    this.fPitchwheelLabel = [];
    this.fCtrlLabel = new Array(128);
    for (var i = 0; i < this.fCtrlLabel.length; i++) {
      this.fCtrlLabel[i] = [];
    }

    // Parse UI
    this.parse_ui(this.json_object.ui, this);

    // Set message handler
    this.port.onmessage = this.handleMessage.bind(this);
    try {
      if (this.parameters)
        this.parameters.forEach((p) => (p.automationRate = "k-rate"));
    } catch (e) {}
  }

  // To be called by the message port with messages coming from the processor
  handleMessage(event) {
    var msg = event.data;
    if (this.output_handler) {
      this.output_handler(msg.path, msg.value);
    }
  }

  // Public API

  /**
   * Destroy the node, deallocate resources.
   */
  destroy() {
    this.port.postMessage({ type: "destroy" });
    this.port.close();
  }

  /**
   *  Returns a full JSON description of the DSP.
   */
  getJSON() {
    return this.json;
  }

  // For WAP
  async getMetadata() {
    return new Promise((resolve) => {
      let real_url =
        this.baseURL === "" ? "main.json" : this.baseURL + "/main.json";
      fetch(real_url)
        .then((responseJSON) => {
          return responseJSON.json();
        })
        .then((json) => {
          resolve(json);
        });
    });
  }

  /**
   *  Set the control value at a given path.
   *
   * @param path - a path to the control
   * @param val - the value to be set
   */
  setParamValue(path, val) {
    // Needed for sample accurate control
    this.parameters.get(path).setValueAtTime(val, 0);
  }

  // For WAP
  setParam(path, val) {
    // Needed for sample accurate control
    this.parameters.get(path).setValueAtTime(val, 0);
  }

  /**
   *  Get the control value at a given path.
   *
   * @return the current control value
   */
  getParamValue(path) {
    return this.parameters.get(path).value;
  }

  // For WAP
  getParam(path) {
    return this.parameters.get(path).value;
  }

  /**
   * Setup a control output handler with a function of type (path, value)
   * to be used on each generated output value. This handler will be called
   * each audio cycle at the end of the 'compute' method.
   *
   * @param handler - a function of type function(path, value)
   */
  setOutputParamHandler(handler) {
    this.output_handler = handler;
  }

  /**
   * Get the current output handler.
   */
  getOutputParamHandler() {
    return this.output_handler;
  }

  getNumInputs() {
    return parseInt(this.json_object.inputs);
  }

  getNumOutputs() {
    return parseInt(this.json_object.outputs);
  }

  // For WAP
  inputChannelCount() {
    return parseInt(this.json_object.inputs);
  }

  outputChannelCount() {
    return parseInt(this.json_object.outputs);
  }

  /**
   * Returns an array of all input paths (to be used with setParamValue/getParamValue)
   */
  getParams() {
    return this.inputs_items;
  }

  // For WAP
  getDescriptor() {
    var desc = {};
    for (const item in this.descriptor) {
      if (this.descriptor.hasOwnProperty(item)) {
        if (this.descriptor[item].label != "bypass") {
          desc = Object.assign(
            {
              [this.descriptor[item].label]: {
                minValue: this.descriptor[item].min,
                maxValue: this.descriptor[item].max,
                defaultValue: this.descriptor[item].init,
              },
            },
            desc,
          );
        }
      }
    }
    return desc;
  }

  /**
   * Control change
   *
   * @param channel - the MIDI channel (0..15, not used for now)
   * @param ctrl - the MIDI controller number (0..127)
   * @param value - the MIDI controller value (0..127)
   */
  ctrlChange(channel, ctrl, value) {
    if (this.fCtrlLabel[ctrl] !== []) {
      for (var i = 0; i < this.fCtrlLabel[ctrl].length; i++) {
        var path = this.fCtrlLabel[ctrl][i].path;
        this.setParamValue(
          path,
          ThruZeroFlangerNode.remap(
            value,
            0,
            127,
            this.fCtrlLabel[ctrl][i].min,
            this.fCtrlLabel[ctrl][i].max,
          ),
        );
        if (this.output_handler) {
          this.output_handler(path, this.getParamValue(path));
        }
      }
    }
  }

  /**
   * PitchWeel
   *
   * @param channel - the MIDI channel (0..15, not used for now)
   * @param value - the MIDI controller value (0..16383)
   */
  pitchWheel(channel, wheel) {
    for (var i = 0; i < this.fPitchwheelLabel.length; i++) {
      var pw = this.fPitchwheelLabel[i];
      this.setParamValue(
        pw.path,
        ThruZeroFlangerNode.remap(wheel, 0, 16383, pw.min, pw.max),
      );
      if (this.output_handler) {
        this.output_handler(pw.path, this.getParamValue(pw.path));
      }
    }
  }

  /**
   * Generic MIDI message handler.
   */
  midiMessage(data) {
    var cmd = data[0] >> 4;
    var channel = data[0] & 0xf;
    var data1 = data[1];
    var data2 = data[2];

    if (channel === 9) {
      return;
    } else if (cmd === 11) {
      this.ctrlChange(channel, data1, data2);
    } else if (cmd === 14) {
      this.pitchWheel(channel, data2 * 128.0 + data1);
    }
  }

  // For WAP
  onMidi(data) {
    midiMessage(data);
  }

  /**
   * @returns {Object} describes the path for each available param and its current value
   */
  async getState() {
    var params = new Object();
    for (let i = 0; i < this.getParams().length; i++) {
      Object.assign(params, {
        [this.getParams()[i]]: `${this.getParam(this.getParams()[i])}`,
      });
    }
    return new Promise((resolve) => {
      resolve(params);
    });
  }

  /**
   * Sets each params with the value indicated in the state object
   * @param {Object} state
   */
  async setState(state) {
    return new Promise((resolve) => {
      for (const param in state) {
        if (state.hasOwnProperty(param)) this.setParam(param, state[param]);
      }
      try {
        this.gui.setAttribute("state", JSON.stringify(state));
      } catch (error) {
        console.warn("Plugin without gui or GUI not defined", error);
      }
      resolve(state);
    });
  }

  /**
   * A different call closer to the preset management
   * @param {Object} patch to assign as a preset to the node
   */
  setPatch(patch) {
    this.setState(this.presets[patch]);
  }

  static remap(v, mn0, mx0, mn1, mx1) {
    return ((1.0 * (v - mn0)) / (mx0 - mn0)) * (mx1 - mn1) + mn1;
  }
}

// Factory class
export default class ThruZeroFlanger {
  static fWorkletProcessors;

  /**
   * Factory constructor.
   *
   * @param context - the audio context
   * @param baseURL - the baseURL of the plugin folder
   */
  constructor(context, baseURL = "") {
    console.log("baseLatency " + context.baseLatency);
    console.log("outputLatency " + context.outputLatency);
    console.log("sampleRate " + context.sampleRate);

    this.context = context;
    this.baseURL = baseURL;
    this.pathTable = [];

    this.fWorkletProcessors = this.fWorkletProcessors || [];
  }

  heap2Str(buf) {
    let str = "";
    let i = 0;
    while (buf[i] !== 0) {
      str += String.fromCharCode(buf[i++]);
    }
    return str;
  }

  /**
   * Load additionnal resources to prepare the custom AudioWorkletNode. Returns a promise to be used with the created node.
   */
  async load() {
    try {
      const importObject = {
        env: {
          memoryBase: 0,
          tableBase: 0,
          _abs: Math.abs,

          // Float version
          _acosf: Math.acos,
          _asinf: Math.asin,
          _atanf: Math.atan,
          _atan2f: Math.atan2,
          _ceilf: Math.ceil,
          _cosf: Math.cos,
          _expf: Math.exp,
          _floorf: Math.floor,
          _fmodf: (x, y) => x % y,
          _logf: Math.log,
          _log10f: Math.log10,
          _max_f: Math.max,
          _min_f: Math.min,
          _remainderf: (x, y) => x - Math.round(x / y) * y,
          _powf: Math.pow,
          _roundf: Math.fround,
          _sinf: Math.sin,
          _sqrtf: Math.sqrt,
          _tanf: Math.tan,
          _acoshf: Math.acosh,
          _asinhf: Math.asinh,
          _atanhf: Math.atanh,
          _coshf: Math.cosh,
          _sinhf: Math.sinh,
          _tanhf: Math.tanh,
          _isnanf: Number.isNaN,
          _isinff: function (x) {
            return !isFinite(x);
          },
          _copysignf: function (x, y) {
            return Math.sign(x) === Math.sign(y) ? x : -x;
          },

          // Double version
          _acos: Math.acos,
          _asin: Math.asin,
          _atan: Math.atan,
          _atan2: Math.atan2,
          _ceil: Math.ceil,
          _cos: Math.cos,
          _exp: Math.exp,
          _floor: Math.floor,
          _fmod: (x, y) => x % y,
          _log: Math.log,
          _log10: Math.log10,
          _max_: Math.max,
          _min_: Math.min,
          _remainder: (x, y) => x - Math.round(x / y) * y,
          _pow: Math.pow,
          _round: Math.fround,
          _sin: Math.sin,
          _sqrt: Math.sqrt,
          _tan: Math.tan,
          _acosh: Math.acosh,
          _asinh: Math.asinh,
          _atanh: Math.atanh,
          _cosh: Math.cosh,
          _sinh: Math.sinh,
          _tanh: Math.tanh,
          _isnan: Number.isNaN,
          _isinf: function (x) {
            return !isFinite(x);
          },
          _copysign: function (x, y) {
            return Math.sign(x) === Math.sign(y) ? x : -x;
          },

          table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }),
        },
      };

      let real_url =
        this.baseURL === ""
          ? "ThruZeroFlanger.wasm"
          : this.baseURL + "/ThruZeroFlanger.wasm";
      const dspFile = await fetch(real_url);
      const dspBuffer = await dspFile.arrayBuffer();
      const dspModule = await WebAssembly.compile(dspBuffer);
      const dspInstance = await WebAssembly.instantiate(
        dspModule,
        importObject,
      );

      let HEAPU8 = new Uint8Array(dspInstance.exports.memory.buffer);
      let json = this.heap2Str(HEAPU8);
      let json_object = JSON.parse(json);
      let options = { wasm_module: dspModule, json: json };

      if (this.fWorkletProcessors.indexOf(name) === -1) {
        try {
          let re = /JSON_STR/g;
          let ThruZeroFlangerProcessorString1 =
            ThruZeroFlangerProcessorString.replace(re, json);
          let real_url = window.URL.createObjectURL(
            new Blob([ThruZeroFlangerProcessorString1], {
              type: "text/javascript",
            }),
          );
          await this.context.audioWorklet.addModule(real_url);
          // Keep the DSP name
          console.log("Keep the DSP name");
          this.fWorkletProcessors.push(name);
        } catch (e) {
          console.error(e);
          console.error("Faust " + this.name + " cannot be loaded or compiled");
          return null;
        }
      }
      this.node = new ThruZeroFlangerNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from ThruZeroFlanger-processor was detected.");
      };
      return this.node;
    } catch (e) {
      console.error(e);
      console.error("Faust " + this.name + " cannot be loaded or compiled");
      return null;
    }
  }

  async loadGui() {
    return new Promise((resolve, reject) => {
      try {
        // DO THIS ONLY ONCE. If another instance has already been added, do not add the html file again
        let real_url =
          this.baseURL === "" ? "main.html" : this.baseURL + "/main.html";
        if (!this.linkExists(real_url)) {
          // LINK DOES NOT EXIST, let's add it to the document
          var link = document.createElement("link");
          link.rel = "import";
          link.href = real_url;
          document.head.appendChild(link);
          link.onload = (e) => {
            // the file has been loaded, instanciate GUI
            // and get back the HTML elem
            // HERE WE COULD REMOVE THE HARD CODED NAME
            var element = createThruZeroFlangerGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createThruZeroFlangerGUI(this.node);
          resolve(element);
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  linkExists(url) {
    return document.querySelectorAll(`link[href="${url}"]`).length > 0;
  }
}

// Template string for AudioWorkletProcessor

let ThruZeroFlangerProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class ThruZeroFlangerProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                ThruZeroFlangerProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                ThruZeroFlangerProcessor.parse_items(group.items, obj, callback);
            }
        }
        
        static parse_items(items, obj, callback)
        {
            for (var i = 0; i < items.length; i++) {
                callback(items[i], obj, callback);
            }
        }
        
        static parse_item1(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                ThruZeroFlangerProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Nothing
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                obj.push({ name: item.address,
                         defaultValue: item.init,
                         minValue: item.min,
                         maxValue: item.max });
            }
        }
        
        static parse_item2(item, obj, callback)
        {
            if (item.type === "vgroup"
                || item.type === "hgroup"
                || item.type === "tgroup") {
                ThruZeroFlangerProcessor.parse_items(item.items, obj, callback);
            } else if (item.type === "hbargraph"
                       || item.type === "vbargraph") {
                // Keep bargraph adresses
                obj.outputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            } else if (item.type === "vslider"
                       || item.type === "hslider"
                       || item.type === "button"
                       || item.type === "checkbox"
                       || item.type === "nentry") {
                // Keep inputs adresses
                obj.inputs_items.push(item.address);
                obj.pathTable[item.address] = parseInt(item.index);
            }
        }
     
        static get parameterDescriptors() 
        {
            // Analyse JSON to generate AudioParam parameters
            var params = [];
            ThruZeroFlangerProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, ThruZeroFlangerProcessor.parse_item1);
            return params;
        }
       
        constructor(options)
        {
            super(options);
            this.running = true;
            
            const importObject = {
                    env: {
                        memoryBase: 0,
                        tableBase: 0,

                        // Integer version
                        _abs: Math.abs,

                        // Float version
                        _acosf: Math.acos,
                        _asinf: Math.asin,
                        _atanf: Math.atan,
                        _atan2f: Math.atan2,
                        _ceilf: Math.ceil,
                        _cosf: Math.cos,
                        _expf: Math.exp,
                        _floorf: Math.floor,
                        _fmodf: function(x, y) { return x % y; },
                        _logf: Math.log,
                        _log10f: Math.log10,
                        _max_f: Math.max,
                        _min_f: Math.min,
                        _remainderf: function(x, y) { return x - Math.round(x/y) * y; },
                        _powf: Math.pow,
                        _roundf: Math.fround,
                        _sinf: Math.sin,
                        _sqrtf: Math.sqrt,
                        _tanf: Math.tan,
                        _acoshf: Math.acosh,
                        _asinhf: Math.asinh,
                        _atanhf: Math.atanh,
                        _coshf: Math.cosh,
                        _sinhf: Math.sinh,
                        _tanhf: Math.tanh,

                        // Double version
                        _acos: Math.acos,
                        _asin: Math.asin,
                        _atan: Math.atan,
                        _atan2: Math.atan2,
                        _ceil: Math.ceil,
                        _cos: Math.cos,
                        _exp: Math.exp,
                        _floor: Math.floor,
                        _fmod: function(x, y) { return x % y; },
                        _log: Math.log,
                        _log10: Math.log10,
                        _max_: Math.max,
                        _min_: Math.min,
                        _remainder:function(x, y) { return x - Math.round(x/y) * y; },
                        _pow: Math.pow,
                        _round: Math.fround,
                        _sin: Math.sin,
                        _sqrt: Math.sqrt,
                        _tan: Math.tan,
                        _acosh: Math.acosh,
                        _asinh: Math.asinh,
                        _atanh: Math.atanh,
                        _cosh: Math.cosh,
                        _sinh: Math.sinh,
                        _tanh: Math.tanh,

                        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
                    }
            };
            
            this.ThruZeroFlanger_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
            this.json_object = JSON.parse(options.processorOptions.json);
         
            this.output_handler = function(path, value) { this.port.postMessage({ path: path, value: value }); };
            
            this.ins = null;
            this.outs = null;

            this.dspInChannnels = [];
            this.dspOutChannnels = [];

            this.numIn = parseInt(this.json_object.inputs);
            this.numOut = parseInt(this.json_object.outputs);

            // Memory allocator
            this.ptr_size = 4;
            this.sample_size = 4;
            this.integer_size = 4;
            
            this.factory = this.ThruZeroFlanger_instance.exports;
            this.HEAP = this.ThruZeroFlanger_instance.exports.memory.buffer;
            this.HEAP32 = new Int32Array(this.HEAP);
            this.HEAPF32 = new Float32Array(this.HEAP);

            // Warning: keeps a ref on HEAP in Chrome and prevent proper GC
            //console.log(this.HEAP);
            //console.log(this.HEAP32);
            //console.log(this.HEAPF32);

            // bargraph
            this.outputs_timer = 5;
            this.outputs_items = [];

            // input items
            this.inputs_items = [];
        
            // Start of HEAP index

            // DSP is placed first with index 0. Audio buffer start at the end of DSP.
            this.audio_heap_ptr = parseInt(this.json_object.size);

            // Setup pointers offset
            this.audio_heap_ptr_inputs = this.audio_heap_ptr;
            this.audio_heap_ptr_outputs = this.audio_heap_ptr_inputs + (this.numIn * this.ptr_size);

            // Setup buffer offset
            this.audio_heap_inputs = this.audio_heap_ptr_outputs + (this.numOut * this.ptr_size);
            this.audio_heap_outputs = this.audio_heap_inputs + (this.numIn * NUM_FRAMES * this.sample_size);
            
            // Start of DSP memory : DSP is placed first with index 0
            this.dsp = 0;

            this.pathTable = [];
         
            // Send output values to the AudioNode
            this.update_outputs = function ()
            {
                if (this.outputs_items.length > 0 && this.output_handler && this.outputs_timer-- === 0) {
                    this.outputs_timer = 5;
                    for (var i = 0; i < this.outputs_items.length; i++) {
                        this.output_handler(this.outputs_items[i], this.HEAPF32[this.pathTable[this.outputs_items[i]] >> 2]);
                    }
                }
            }
            
            this.initAux = function ()
            {
                var i;
                
                if (this.numIn > 0) {
                    this.ins = this.audio_heap_ptr_inputs;
                    for (i = 0; i < this.numIn; i++) {
                        this.HEAP32[(this.ins >> 2) + i] = this.audio_heap_inputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Ins buffer tables
                    var dspInChans = this.HEAP32.subarray(this.ins >> 2, (this.ins + this.numIn * this.ptr_size) >> 2);
                    for (i = 0; i < this.numIn; i++) {
                        this.dspInChannnels[i] = this.HEAPF32.subarray(dspInChans[i] >> 2, (dspInChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                if (this.numOut > 0) {
                    this.outs = this.audio_heap_ptr_outputs;
                    for (i = 0; i < this.numOut; i++) {
                        this.HEAP32[(this.outs >> 2) + i] = this.audio_heap_outputs + ((NUM_FRAMES * this.sample_size) * i);
                    }
                    
                    // Prepare Out buffer tables
                    var dspOutChans = this.HEAP32.subarray(this.outs >> 2, (this.outs + this.numOut * this.ptr_size) >> 2);
                    for (i = 0; i < this.numOut; i++) {
                        this.dspOutChannnels[i] = this.HEAPF32.subarray(dspOutChans[i] >> 2, (dspOutChans[i] + NUM_FRAMES * this.sample_size) >> 2);
                    }
                }
                
                // Parse UI
                ThruZeroFlangerProcessor.parse_ui(this.json_object.ui, this, ThruZeroFlangerProcessor.parse_item2);
                
                // Init DSP
                this.factory.init(this.dsp, sampleRate); // 'sampleRate' is defined in AudioWorkletGlobalScope  
            }

            this.setParamValue = function (path, val)
            {
                this.HEAPF32[this.pathTable[path] >> 2] = val;
            }

            this.getParamValue = function (path)
            {
                return this.HEAPF32[this.pathTable[path] >> 2];
            }

            // Init resulting DSP
            this.initAux();
        }
        
        process(inputs, outputs, parameters) 
        {
            var input = inputs[0];
            var output = outputs[0];
            
            // Check inputs
            if (this.numIn > 0 && (!input || !input[0] || input[0].length === 0)) {
                //console.log("Process input error");
                return true;
            }
            // Check outputs
            if (this.numOut > 0 && (!output || !output[0] || output[0].length === 0)) {
                //console.log("Process output error");
                return true;
            }
            
            // Copy inputs
            if (input !== undefined) {
                for (var chan = 0; chan < Math.min(this.numIn, input.length); ++chan) {
                    var dspInput = this.dspInChannnels[chan];
                    dspInput.set(input[chan]);
                }
            }
            
            /*
            TODO: sample accurate control change is not yet handled
            When no automation occurs, params[i][1] has a length of 1,
            otherwise params[i][1] has a length of NUM_FRAMES with possible control change each sample
            */
            
            // Update controls
            for (const path in parameters) {
                const paramArray = parameters[path];
                this.setParamValue(path, paramArray[0]);
            }
        
          	// Compute
            try {
                this.factory.compute(this.dsp, NUM_FRAMES, this.ins, this.outs);
            } catch(e) {
                console.log("ERROR in compute (" + e + ")");
            }
            
            // Update bargraph
            this.update_outputs();
            
            // Copy outputs
            if (output !== undefined) {
                for (var chan = 0; chan < Math.min(this.numOut, output.length); ++chan) {
                    var dspOutput = this.dspOutChannnels[chan];
                    output[chan].set(dspOutput);
                }
            }
            
            return this.running;
    	}
        
        handleMessage(event)
        {
            var msg = event.data;
            switch (msg.type) {
                case "destroy": this.running = false; break;
            }
        }
    }

    // Globals
    const NUM_FRAMES = 128;
    try {
        registerProcessor('ThruZeroFlanger', ThruZeroFlangerProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "ThruZeroFlanger";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.ThruZeroFlanger = ThruZeroFlanger;
  window.FaustThruZeroFlanger = ThruZeroFlanger;
  window[dspName] = ThruZeroFlanger;
} else {
  module.exports = { ThruZeroFlanger };
}
