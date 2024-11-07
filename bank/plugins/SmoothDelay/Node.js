/*
Code generated with Faust version 2.40.7
Compilation options: -lang wasm-ib -cn smoothDelay -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONsmoothDelay() {
  return '{"name": "smoothDelay","filename": "smoothDelay.dsp","version": "2.40.7","compile_options": "-lang wasm-ib -cn smoothDelay -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/1506CC7FDCA9DD6C99B4354F47BFE1A7AEE69520/web/wap"],"size": 1048676,"inputs": 1,"outputs": 1,"meta": [ { "author": "Yann Orlarey" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn smoothDelay -es 1 -mcd 16 -single -ftz 2" },{ "copyright": "Grame" },{ "delays_lib_name": "Faust Delay Library" },{ "delays_lib_version": "0.1" },{ "filename": "smoothDelay.dsp" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/delays.lib" },{ "library_path3": "/libraries/maths.lib" },{ "library_path4": "/libraries/platform.lib" },{ "library_path5": "/libraries/signals.lib" },{ "license": "STK-4.3" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "smoothDelay" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "1.0" }],"ui": [ {"type": "vgroup","label": "smoothDelay","items": [ {"type": "hslider","label": "Delay","address": "/smoothDelay/Delay","index": 1048616,"meta": [{ "OWL": "PARAMETER_A" },{ "style": "knob" },{ "unit": "ms" }],"init": 1,"min": 0.0001,"max": 500,"step": 0.1},{"type": "hslider","label": "Dry/Wet","address": "/smoothDelay/Dry/Wet","index": 28,"meta": [{ "OWL": "PARAMETER_D" },{ "style": "knob" }],"init": 0.3333,"min": 0,"max": 1,"step": 0.025},{"type": "hslider","label": "Feedback","address": "/smoothDelay/Feedback","index": 20,"meta": [{ "OWL": "PARAMETER_B" },{ "style": "knob" }],"init": 0,"min": 0,"max": 100,"step": 0.1},{"type": "hslider","label": "Interpolation","address": "/smoothDelay/Interpolation","index": 1048632,"meta": [{ "OWL": "PARAMETER_C" },{ "style": "knob" },{ "unit": "ms" }],"init": 10,"min": 1,"max": 100,"step": 0.1},{"type": "hslider","label": "Super Wet","address": "/smoothDelay/Super Wet","index": 24,"meta": [{ "OWL": "PARAMETER_E" },{ "style": "knob" }],"init": 0,"min": 0,"max": 0.5,"step": 0.025},{"type": "checkbox","label": "bypass","address": "/smoothDelay/bypass","index": 8}]}]}';
}
function getBase64CodesmoothDelay() {
  return "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ICJiYXNpY3NfbGliX25hbWUiOiAiRmF1c3QgQmFzaWMgRWxlbWVudCBMaWJyYXJ5IiB9LHsgImJhc2ljc19saWJfdmVyc2lvbiI6ICIwLjYiIH0seyAiY29tcGlsYXRpb25fb3B0aW9ucyI6ICItc2luZ2xlIC1zY2FsIC1JIGxpYnJhcmllcy8gLUkgcHJvamVjdC8gLWxhbmcgd2FzbSIgfSx7ICJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtY24gc21vb3RoRGVsYXkgLWVzIDEgLW1jZCAxNiAtc2luZ2xlIC1mdHogMiIgfSx7ICJjb3B5cmlnaHQiOiAiR3JhbWUiIH0seyAiZGVsYXlzX2xpYl9uYW1lIjogIkZhdXN0IERlbGF5IExpYnJhcnkiIH0seyAiZGVsYXlzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJmaWxlbmFtZSI6ICJzbW9vdGhEZWxheS5kc3AiIH0seyAibGlicmFyeV9wYXRoMCI6ICIvbGlicmFyaWVzL3N0ZGZhdXN0LmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgxIjogIi9saWJyYXJpZXMvYmFzaWNzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgyIjogIi9saWJyYXJpZXMvZGVsYXlzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgzIjogIi9saWJyYXJpZXMvbWF0aHMubGliIiB9LHsgImxpYnJhcnlfcGF0aDQiOiAiL2xpYnJhcmllcy9wbGF0Zm9ybS5saWIiIH0seyAibGlicmFyeV9wYXRoNSI6ICIvbGlicmFyaWVzL3NpZ25hbHMubGliIiB9LHsgImxpY2Vuc2UiOiAiU1RLLTQuMyIgfSx7ICJtYXRoc19saWJfYXV0aG9yIjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9jb3B5cmlnaHQiOiAiR1JBTUUiIH0seyAibWF0aHNfbGliX2xpY2Vuc2UiOiAiTEdQTCB3aXRoIGV4Y2VwdGlvbiIgfSx7ICJtYXRoc19saWJfbmFtZSI6ICJGYXVzdCBNYXRoIExpYnJhcnkiIH0seyAibWF0aHNfbGliX3ZlcnNpb24iOiAiMi41IiB9LHsgIm5hbWUiOiAic21vb3RoRGVsYXkiIH0seyAicGxhdGZvcm1fbGliX25hbWUiOiAiR2VuZXJpYyBQbGF0Zm9ybSBMaWJyYXJ5IiB9LHsgInBsYXRmb3JtX2xpYl92ZXJzaW9uIjogIjAuMiIgfSx7ICJzaWduYWxzX2xpYl9uYW1lIjogIkZhdXN0IFNpZ25hbCBSb3V0aW5nIExpYnJhcnkiIH0seyAic2lnbmFsc19saWJfdmVyc2lvbiI6ICIwLjEiIH0seyAidmVyc2lvbiI6ICIxLjAiIH1dLCJ1aSI6IFsgeyJ0eXBlIjogInZncm91cCIsImxhYmVsIjogInNtb290aERlbGF5IiwiaXRlbXMiOiBbIHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiRGVsYXkiLCJhZGRyZXNzIjogIi9zbW9vdGhEZWxheS9EZWxheSIsImluZGV4IjogMTA0ODYxNiwibWV0YSI6IFt7ICJPV0wiOiAiUEFSQU1FVEVSX0EiIH0seyAic3R5bGUiOiAia25vYiIgfSx7ICJ1bml0IjogIm1zIiB9XSwiaW5pdCI6IDEsIm1pbiI6IDAuMDAwMSwibWF4IjogNTAwLCJzdGVwIjogMC4xfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkRyeS9XZXQiLCJhZGRyZXNzIjogIi9zbW9vdGhEZWxheS9EcnkvV2V0IiwiaW5kZXgiOiAyOCwibWV0YSI6IFt7ICJPV0wiOiAiUEFSQU1FVEVSX0QiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAwLjMzMzMsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAyNX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJGZWVkYmFjayIsImFkZHJlc3MiOiAiL3Ntb290aERlbGF5L0ZlZWRiYWNrIiwiaW5kZXgiOiAyMCwibWV0YSI6IFt7ICJPV0wiOiAiUEFSQU1FVEVSX0IiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAwLCJtaW4iOiAwLCJtYXgiOiAxMDAsInN0ZXAiOiAwLjF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiSW50ZXJwb2xhdGlvbiIsImFkZHJlc3MiOiAiL3Ntb290aERlbGF5L0ludGVycG9sYXRpb24iLCJpbmRleCI6IDEwNDg2MzIsIm1ldGEiOiBbeyAiT1dMIjogIlBBUkFNRVRFUl9DIiB9LHsgInN0eWxlIjogImtub2IiIH0seyAidW5pdCI6ICJtcyIgfV0sImluaXQiOiAxMCwibWluIjogMSwibWF4IjogMTAwLCJzdGVwIjogMC4xfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIlN1cGVyIFdldCIsImFkZHJlc3MiOiAiL3Ntb290aERlbGF5L1N1cGVyIFdldCIsImluZGV4IjogMjQsIm1ldGEiOiBbeyAiT1dMIjogIlBBUkFNRVRFUl9FIiB9LHsgInN0eWxlIjogImtub2IiIH1dLCJpbml0IjogMCwibWluIjogMCwibWF4IjogMC41LCJzdGVwIjogMC4wMjV9LHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL3Ntb290aERlbGF5L2J5cGFzcyIsImluZGV4IjogOH1dfV19";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class smoothDelayNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "smoothDelay", options);

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
          smoothDelayNode.remap(
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
        smoothDelayNode.remap(wheel, 0, 16383, pw.min, pw.max),
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
export default class smoothDelay {
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
          ? "smoothDelay.wasm"
          : this.baseURL + "/smoothDelay.wasm";
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
          let smoothDelayProcessorString1 = smoothDelayProcessorString.replace(
            re,
            json,
          );
          let real_url = window.URL.createObjectURL(
            new Blob([smoothDelayProcessorString1], {
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
      this.node = new smoothDelayNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from smoothDelay-processor was detected.");
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
            var element = createsmoothDelayGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createsmoothDelayGUI(this.node);
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

let smoothDelayProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class smoothDelayProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                smoothDelayProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                smoothDelayProcessor.parse_items(group.items, obj, callback);
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
                smoothDelayProcessor.parse_items(item.items, obj, callback);
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
                smoothDelayProcessor.parse_items(item.items, obj, callback);
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
            smoothDelayProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, smoothDelayProcessor.parse_item1);
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
            
            this.smoothDelay_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.smoothDelay_instance.exports;
            this.HEAP = this.smoothDelay_instance.exports.memory.buffer;
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
                smoothDelayProcessor.parse_ui(this.json_object.ui, this, smoothDelayProcessor.parse_item2);
                
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
        registerProcessor('smoothDelay', smoothDelayProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "smoothDelay";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.smoothDelay = smoothDelay;
  window.FaustsmoothDelay = smoothDelay;
  window[dspName] = smoothDelay;
} else {
  module.exports = { smoothDelay };
}
