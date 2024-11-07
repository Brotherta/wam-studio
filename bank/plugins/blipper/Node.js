/*
Code generated with Faust version 2.40.12
Compilation options: -lang wasm-ib -cn blipper -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONblipper() {
  return '{"name": "blipper","filename": "blipper.dsp","version": "2.40.12","compile_options": "-lang wasm-ib -cn blipper -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/E684414FD8D102DAFBE79DF82EC2AD3C2BC3DBEC/web/wap"],"size": 16528,"inputs": 2,"outputs": 2,"meta": [ { "analyzers_lib_name": "Faust Analyzer Library" },{ "analyzers_lib_version": "0.1" },{ "author": "Oli Larkin (contact@olilarkin.co.uk)" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn blipper -es 1 -mcd 16 -single -ftz 2" },{ "copyright": "Oliver Larkin" },{ "description": "Envelope Follower controlling pitch of a triangle oscillator, good with percussive input" },{ "filename": "blipper.dsp" },{ "filters_lib_lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_pole_author": "Julius O. Smith III" },{ "filters_lib_pole_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_pole_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/maths.lib" },{ "library_path3": "/libraries/platform.lib" },{ "library_path4": "/libraries/signals.lib" },{ "library_path5": "/libraries/analyzers.lib" },{ "library_path6": "/libraries/oscillators.lib" },{ "library_path7": "/libraries/filters.lib" },{ "licence": "GPL" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "blipper" },{ "oscillators_lib_name": "Faust Oscillator Library" },{ "oscillators_lib_version": "0.3" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "0.2" }],"ui": [ {"type": "vgroup","label": "blipper","items": [ {"type": "hslider","label": "BasePitch","shortname": "BasePitch","address": "/blipper/BasePitch","index": 88,"meta": [{ "OWL": "PARAMETER_A" },{ "style": "knob" },{ "unit": "semitones" }],"init": 60,"min": 24,"max": 96,"step": 0.1},{"type": "hslider","label": "Mix","shortname": "Mix","address": "/blipper/Mix","index": 36,"meta": [{ "OWL": "PARAMETER_D" },{ "style": "knob" }],"init": 0.5,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "PitchMod","shortname": "PitchMod","address": "/blipper/PitchMod","index": 100,"meta": [{ "OWL": "PARAMETER_B" },{ "style": "knob" },{ "unit": "semitones" }],"init": 24,"min": -64,"max": 64,"step": 1},{"type": "hslider","label": "Release","shortname": "Release","address": "/blipper/Release","index": 56,"meta": [{ "OWL": "PARAMETER_C" },{ "style": "knob" },{ "unit": "ms" }],"init": 20,"min": 2,"max": 100,"step": 1},{"type": "checkbox","label": "bypass","shortname": "bypass","address": "/blipper/bypass","index": 16}]}]}';
}
function getBase64Codeblipper() {
  return "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gIAAACAAIAFIBH8gAAUgAQsPC4yAgIAAACAAIAFqIAI4AgALC4WZgIAAAQBBAAv+GHsibmFtZSI6ICJibGlwcGVyIiwiZmlsZW5hbWUiOiAiYmxpcHBlci5kc3AiLCJ2ZXJzaW9uIjogIjIuNDAuMTIiLCJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtY24gYmxpcHBlciAtZXMgMSAtbWNkIDE2IC1zaW5nbGUgLWZ0eiAyIiwiaW5jbHVkZV9wYXRobmFtZXMiOiBbIi91c3IvbG9jYWwvc2hhcmUvZmF1c3QiLCIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0IiwiL3Vzci9zaGFyZS9mYXVzdCIsIi4iLCIvdG1wL3Nlc3Npb25zL0U2ODQ0MTRGRDhEMTAyREFGQkU3OURGODJFQzJBRDNDMkJDM0RCRUMvd2ViL3dhcCJdLCJzaXplIjogMTY1MjgsImlucHV0cyI6IDIsIm91dHB1dHMiOiAyLCJtZXRhIjogWyB7ICJhbmFseXplcnNfbGliX25hbWUiOiAiRmF1c3QgQW5hbHl6ZXIgTGlicmFyeSIgfSx7ICJhbmFseXplcnNfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgImF1dGhvciI6ICJPbGkgTGFya2luIChjb250YWN0QG9saWxhcmtpbi5jby51aykiIH0seyAiYmFzaWNzX2xpYl9uYW1lIjogIkZhdXN0IEJhc2ljIEVsZW1lbnQgTGlicmFyeSIgfSx7ICJiYXNpY3NfbGliX3ZlcnNpb24iOiAiMC42IiB9LHsgImNvbXBpbGF0aW9uX29wdGlvbnMiOiAiLXNpbmdsZSAtc2NhbCAtSSBsaWJyYXJpZXMvIC1JIHByb2plY3QvIC1sYW5nIHdhc20iIH0seyAiY29tcGlsZV9vcHRpb25zIjogIi1sYW5nIHdhc20taWIgLWNuIGJsaXBwZXIgLWVzIDEgLW1jZCAxNiAtc2luZ2xlIC1mdHogMiIgfSx7ICJjb3B5cmlnaHQiOiAiT2xpdmVyIExhcmtpbiIgfSx7ICJkZXNjcmlwdGlvbiI6ICJFbnZlbG9wZSBGb2xsb3dlciBjb250cm9sbGluZyBwaXRjaCBvZiBhIHRyaWFuZ2xlIG9zY2lsbGF0b3IsIGdvb2Qgd2l0aCBwZXJjdXNzaXZlIGlucHV0IiB9LHsgImZpbGVuYW1lIjogImJsaXBwZXIuZHNwIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3MwX2hpZ2hwYXNzMSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX25hbWUiOiAiRmF1c3QgRmlsdGVycyBMaWJyYXJ5IiB9LHsgImZpbHRlcnNfbGliX3BvbGVfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfcG9sZV9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfcG9sZV9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAibGlicmFyeV9wYXRoMCI6ICIvbGlicmFyaWVzL3N0ZGZhdXN0LmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgxIjogIi9saWJyYXJpZXMvYmFzaWNzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgyIjogIi9saWJyYXJpZXMvbWF0aHMubGliIiB9LHsgImxpYnJhcnlfcGF0aDMiOiAiL2xpYnJhcmllcy9wbGF0Zm9ybS5saWIiIH0seyAibGlicmFyeV9wYXRoNCI6ICIvbGlicmFyaWVzL3NpZ25hbHMubGliIiB9LHsgImxpYnJhcnlfcGF0aDUiOiAiL2xpYnJhcmllcy9hbmFseXplcnMubGliIiB9LHsgImxpYnJhcnlfcGF0aDYiOiAiL2xpYnJhcmllcy9vc2NpbGxhdG9ycy5saWIiIH0seyAibGlicmFyeV9wYXRoNyI6ICIvbGlicmFyaWVzL2ZpbHRlcnMubGliIiB9LHsgImxpY2VuY2UiOiAiR1BMIiB9LHsgIm1hdGhzX2xpYl9hdXRob3IiOiAiR1JBTUUiIH0seyAibWF0aHNfbGliX2NvcHlyaWdodCI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfbGljZW5zZSI6ICJMR1BMIHdpdGggZXhjZXB0aW9uIiB9LHsgIm1hdGhzX2xpYl9uYW1lIjogIkZhdXN0IE1hdGggTGlicmFyeSIgfSx7ICJtYXRoc19saWJfdmVyc2lvbiI6ICIyLjUiIH0seyAibmFtZSI6ICJibGlwcGVyIiB9LHsgIm9zY2lsbGF0b3JzX2xpYl9uYW1lIjogIkZhdXN0IE9zY2lsbGF0b3IgTGlicmFyeSIgfSx7ICJvc2NpbGxhdG9yc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAicGxhdGZvcm1fbGliX25hbWUiOiAiR2VuZXJpYyBQbGF0Zm9ybSBMaWJyYXJ5IiB9LHsgInBsYXRmb3JtX2xpYl92ZXJzaW9uIjogIjAuMiIgfSx7ICJzaWduYWxzX2xpYl9uYW1lIjogIkZhdXN0IFNpZ25hbCBSb3V0aW5nIExpYnJhcnkiIH0seyAic2lnbmFsc19saWJfdmVyc2lvbiI6ICIwLjEiIH0seyAidmVyc2lvbiI6ICIwLjIiIH1dLCJ1aSI6IFsgeyJ0eXBlIjogInZncm91cCIsImxhYmVsIjogImJsaXBwZXIiLCJpdGVtcyI6IFsgeyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJCYXNlUGl0Y2giLCJzaG9ydG5hbWUiOiAiQmFzZVBpdGNoIiwiYWRkcmVzcyI6ICIvYmxpcHBlci9CYXNlUGl0Y2giLCJpbmRleCI6IDg4LCJtZXRhIjogW3sgIk9XTCI6ICJQQVJBTUVURVJfQSIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9LHsgInVuaXQiOiAic2VtaXRvbmVzIiB9XSwiaW5pdCI6IDYwLCJtaW4iOiAyNCwibWF4IjogOTYsInN0ZXAiOiAwLjF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiTWl4Iiwic2hvcnRuYW1lIjogIk1peCIsImFkZHJlc3MiOiAiL2JsaXBwZXIvTWl4IiwiaW5kZXgiOiAzNiwibWV0YSI6IFt7ICJPV0wiOiAiUEFSQU1FVEVSX0QiIH0seyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAwLjUsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIlBpdGNoTW9kIiwic2hvcnRuYW1lIjogIlBpdGNoTW9kIiwiYWRkcmVzcyI6ICIvYmxpcHBlci9QaXRjaE1vZCIsImluZGV4IjogMTAwLCJtZXRhIjogW3sgIk9XTCI6ICJQQVJBTUVURVJfQiIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9LHsgInVuaXQiOiAic2VtaXRvbmVzIiB9XSwiaW5pdCI6IDI0LCJtaW4iOiAtNjQsIm1heCI6IDY0LCJzdGVwIjogMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJSZWxlYXNlIiwic2hvcnRuYW1lIjogIlJlbGVhc2UiLCJhZGRyZXNzIjogIi9ibGlwcGVyL1JlbGVhc2UiLCJpbmRleCI6IDU2LCJtZXRhIjogW3sgIk9XTCI6ICJQQVJBTUVURVJfQyIgfSx7ICJzdHlsZSI6ICJrbm9iIiB9LHsgInVuaXQiOiAibXMiIH1dLCJpbml0IjogMjAsIm1pbiI6IDIsIm1heCI6IDEwMCwic3RlcCI6IDF9LHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogImJ5cGFzcyIsInNob3J0bmFtZSI6ICJieXBhc3MiLCJhZGRyZXNzIjogIi9ibGlwcGVyL2J5cGFzcyIsImluZGV4IjogMTZ9XX1dfQ==";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class blipperNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "blipper", options);

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
          blipperNode.remap(
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
        blipperNode.remap(wheel, 0, 16383, pw.min, pw.max),
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
export default class blipper {
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
        this.baseURL === "" ? "blipper.wasm" : this.baseURL + "/blipper.wasm";
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
          let blipperProcessorString1 = blipperProcessorString.replace(
            re,
            json,
          );
          let real_url = window.URL.createObjectURL(
            new Blob([blipperProcessorString1], { type: "text/javascript" }),
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
      this.node = new blipperNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from blipper-processor was detected.");
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
            var element = createblipperGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createblipperGUI(this.node);
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

let blipperProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class blipperProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                blipperProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                blipperProcessor.parse_items(group.items, obj, callback);
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
                blipperProcessor.parse_items(item.items, obj, callback);
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
                blipperProcessor.parse_items(item.items, obj, callback);
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
            blipperProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, blipperProcessor.parse_item1);
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
            
            this.blipper_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.blipper_instance.exports;
            this.HEAP = this.blipper_instance.exports.memory.buffer;
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
                blipperProcessor.parse_ui(this.json_object.ui, this, blipperProcessor.parse_item2);
                
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
        registerProcessor('blipper', blipperProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "blipper";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.blipper = blipper;
  window.Faustblipper = blipper;
  window[dspName] = blipper;
} else {
  module.exports = { blipper };
}
