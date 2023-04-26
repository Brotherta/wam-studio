/*
Code generated with Faust version 2.40.7
Compilation options: -lang wasm-ib -cn OwlShimmer -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONOwlShimmer() {
  return '{"name": "OwlShimmer","filename": "OwlShimmer.dsp","version": "2.40.7","compile_options": "-lang wasm-ib -cn OwlShimmer -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/8ECE23C372405301C6EC086F5176565D82AF4767/web/wap"],"size": 639148,"inputs": 2,"outputs": 2,"meta": [ { "author": "Xavier Godart" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn OwlShimmer -es 1 -mcd 16 -single -ftz 2" },{ "copyright": "(c) Empirical Noises 2017" },{ "delays_lib_name": "Faust Delay Library" },{ "delays_lib_version": "0.1" },{ "filename": "OwlShimmer.dsp" },{ "filters_lib_allpass_comb_author": "Julius O. Smith III" },{ "filters_lib_allpass_comb_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_allpass_comb_license": "MIT-style STK-4.3 license" },{ "filters_lib_highpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_tf1_author": "Julius O. Smith III" },{ "filters_lib_tf1_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1s_author": "Julius O. Smith III" },{ "filters_lib_tf1s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1s_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/signals.lib" },{ "library_path3": "/libraries/filters.lib" },{ "library_path4": "/libraries/delays.lib" },{ "library_path5": "/libraries/misceffects.lib" },{ "library_path6": "/libraries/maths.lib" },{ "library_path7": "/libraries/platform.lib" },{ "library_path8": "/libraries/routes.lib" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "misceffects_lib_name": "Misc Effects Library" },{ "misceffects_lib_version": "2.0" },{ "name": "OwlShimmer" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "routes_lib_hadamard_author": "Remy Muller, revised by RM" },{ "routes_lib_name": "Faust Signal Routing Library" },{ "routes_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "1.0.0" }],"ui": [ {"type": "vgroup","label": "OwlShimmer","items": [ {"type": "hslider","label": "DECAY","address": "/OwlShimmer/DECAY","index": 20,"meta": [{ "style": "knobs" }],"init": 0.7,"min": 0.5,"max": 1,"step": 0.01},{"type": "hslider","label": "MIX","address": "/OwlShimmer/MIX","index": 4,"meta": [{ "style": "knobs" }],"init": 0.75,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "SHIMMER","address": "/OwlShimmer/SHIMMER","index": 102536,"meta": [{ "style": "knobs" }],"init": 0.3,"min": 0,"max": 0.7,"step": 0.01},{"type": "hslider","label": "TONE","address": "/OwlShimmer/TONE","index": 16,"meta": [{ "style": "knobs" }],"init": 4000,"min": 900,"max": 8000,"step": 0.01},{"type": "checkbox","label": "bypass","address": "/OwlShimmer/bypass","index": 0}]}]}';
}
function getBase64CodeOwlShimmer() {
  return "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AtTAAwuQgICAAAAgACABEAogABAMIAAQCQu2gICAAABBAEMAAAAAOAIAQQBDAABAPzgCBEEAQwAAekU4AhBBAEMzMzM/OAIUQQBDmpmZPjgCiKEGC5CAgIAAACAAIAFIBH8gAQUgAAsPC5CAgIAAACAAIAFIBH8gAAUgAQsPC4yAgIAAACAAIAFqIAI4AgALC8WegIAAAQBBAAu+HnsibmFtZSI6ICJ1bnRpdGxlZCIsImZpbGVuYW1lIjogInVudGl0bGVkLmRzcCIsInZlcnNpb24iOiAiMi40MC43IiwiY29tcGlsZV9vcHRpb25zIjogIi1sYW5nIHdhc20taWIgLWNuIHVudGl0bGVkIC1lcyAxIC1tY2QgMTYgLXNpbmdsZSAtZnR6IDIiLCJpbmNsdWRlX3BhdGhuYW1lcyI6IFsiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdCIsIi91c3IvbG9jYWwvc2hhcmUvZmF1c3QiLCIvdXNyL3NoYXJlL2ZhdXN0IiwiLiIsIi90bXAvc2Vzc2lvbnMvOEVDRTIzQzM3MjQwNTMwMUM2RUMwODZGNTE3NjU2NUQ4MkFGNDc2Ny93ZWIvd2FwIl0sInNpemUiOiA2MzkxNDgsImlucHV0cyI6IDIsIm91dHB1dHMiOiAyLCJtZXRhIjogWyB7ICJhdXRob3IiOiAiWGF2aWVyIEdvZGFydCIgfSx7ICJiYXNpY3NfbGliX25hbWUiOiAiRmF1c3QgQmFzaWMgRWxlbWVudCBMaWJyYXJ5IiB9LHsgImJhc2ljc19saWJfdmVyc2lvbiI6ICIwLjYiIH0seyAiY29tcGlsYXRpb25fb3B0aW9ucyI6ICItc2luZ2xlIC1zY2FsIC1JIGxpYnJhcmllcy8gLUkgcHJvamVjdC8gLWxhbmcgd2FzbSIgfSx7ICJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtY24gdW50aXRsZWQgLWVzIDEgLW1jZCAxNiAtc2luZ2xlIC1mdHogMiIgfSx7ICJjb3B5cmlnaHQiOiAiKGMpIEVtcGlyaWNhbCBOb2lzZXMgMjAxNyIgfSx7ICJkZWxheXNfbGliX25hbWUiOiAiRmF1c3QgRGVsYXkgTGlicmFyeSIgfSx7ICJkZWxheXNfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgImZpbGVuYW1lIjogInVudGl0bGVkLmRzcCIgfSx7ICJmaWx0ZXJzX2xpYl9hbGxwYXNzX2NvbWJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfYWxscGFzc19jb21iX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9hbGxwYXNzX2NvbWJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczEiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczFfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9uYW1lIjogIkZhdXN0IEZpbHRlcnMgTGlicmFyeSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYxX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMXNfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYxc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfdGYxc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAibGlicmFyeV9wYXRoMCI6ICIvbGlicmFyaWVzL3N0ZGZhdXN0LmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgxIjogIi9saWJyYXJpZXMvYmFzaWNzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgyIjogIi9saWJyYXJpZXMvc2lnbmFscy5saWIiIH0seyAibGlicmFyeV9wYXRoMyI6ICIvbGlicmFyaWVzL2ZpbHRlcnMubGliIiB9LHsgImxpYnJhcnlfcGF0aDQiOiAiL2xpYnJhcmllcy9kZWxheXMubGliIiB9LHsgImxpYnJhcnlfcGF0aDUiOiAiL2xpYnJhcmllcy9taXNjZWZmZWN0cy5saWIiIH0seyAibGlicmFyeV9wYXRoNiI6ICIvbGlicmFyaWVzL21hdGhzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg3IjogIi9saWJyYXJpZXMvcGxhdGZvcm0ubGliIiB9LHsgImxpYnJhcnlfcGF0aDgiOiAiL2xpYnJhcmllcy9yb3V0ZXMubGliIiB9LHsgIm1hdGhzX2xpYl9hdXRob3IiOiAiR1JBTUUiIH0seyAibWF0aHNfbGliX2NvcHlyaWdodCI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfbGljZW5zZSI6ICJMR1BMIHdpdGggZXhjZXB0aW9uIiB9LHsgIm1hdGhzX2xpYl9uYW1lIjogIkZhdXN0IE1hdGggTGlicmFyeSIgfSx7ICJtYXRoc19saWJfdmVyc2lvbiI6ICIyLjUiIH0seyAibWlzY2VmZmVjdHNfbGliX25hbWUiOiAiTWlzYyBFZmZlY3RzIExpYnJhcnkiIH0seyAibWlzY2VmZmVjdHNfbGliX3ZlcnNpb24iOiAiMi4wIiB9LHsgIm5hbWUiOiAidW50aXRsZWQiIH0seyAicGxhdGZvcm1fbGliX25hbWUiOiAiR2VuZXJpYyBQbGF0Zm9ybSBMaWJyYXJ5IiB9LHsgInBsYXRmb3JtX2xpYl92ZXJzaW9uIjogIjAuMiIgfSx7ICJyb3V0ZXNfbGliX2hhZGFtYXJkX2F1dGhvciI6ICJSZW15IE11bGxlciwgcmV2aXNlZCBieSBSTSIgfSx7ICJyb3V0ZXNfbGliX25hbWUiOiAiRmF1c3QgU2lnbmFsIFJvdXRpbmcgTGlicmFyeSIgfSx7ICJyb3V0ZXNfbGliX3ZlcnNpb24iOiAiMC4yIiB9LHsgInNpZ25hbHNfbGliX25hbWUiOiAiRmF1c3QgU2lnbmFsIFJvdXRpbmcgTGlicmFyeSIgfSx7ICJzaWduYWxzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJ2ZXJzaW9uIjogIjEuMC4wIiB9XSwidWkiOiBbIHsidHlwZSI6ICJ2Z3JvdXAiLCJsYWJlbCI6ICJ1bnRpdGxlZCIsIml0ZW1zIjogWyB7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkRFQ0FZIiwiYWRkcmVzcyI6ICIvdW50aXRsZWQvREVDQVkiLCJpbmRleCI6IDIwLCJtZXRhIjogW3sgInN0eWxlIjogImtub2JzIiB9XSwiaW5pdCI6IDAuNywibWluIjogMC41LCJtYXgiOiAxLCJzdGVwIjogMC4wMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJNSVgiLCJhZGRyZXNzIjogIi91bnRpdGxlZC9NSVgiLCJpbmRleCI6IDQsIm1ldGEiOiBbeyAic3R5bGUiOiAia25vYnMiIH1dLCJpbml0IjogMC43NSwibWluIjogMCwibWF4IjogMSwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiU0hJTU1FUiIsImFkZHJlc3MiOiAiL3VudGl0bGVkL1NISU1NRVIiLCJpbmRleCI6IDEwMjUzNiwibWV0YSI6IFt7ICJzdHlsZSI6ICJrbm9icyIgfV0sImluaXQiOiAwLjMsIm1pbiI6IDAsIm1heCI6IDAuNywic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiVE9ORSIsImFkZHJlc3MiOiAiL3VudGl0bGVkL1RPTkUiLCJpbmRleCI6IDE2LCJtZXRhIjogW3sgInN0eWxlIjogImtub2JzIiB9XSwiaW5pdCI6IDQwMDAsIm1pbiI6IDkwMCwibWF4IjogODAwMCwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL3VudGl0bGVkL2J5cGFzcyIsImluZGV4IjogMH1dfV19";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class OwlShimmerNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "OwlShimmer", options);

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
      if (item.type === "vgroup" || item.type === "hgroup" || item.type === "tgroup") {
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
                obj.fCtrlLabel[parseInt(item.meta[i].midi.trim().split(" ")[1])].push({
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
      if (this.parameters) this.parameters.forEach((p) => (p.automationRate = "k-rate"));
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
      let real_url = this.baseURL === "" ? "main.json" : this.baseURL + "/main.json";
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
            desc
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
          OwlShimmerNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max)
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
      this.setParamValue(pw.path, OwlShimmerNode.remap(wheel, 0, 16383, pw.min, pw.max));
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
      Object.assign(params, { [this.getParams()[i]]: `${this.getParam(this.getParams()[i])}` });
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
export default class OwlShimmer {
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

      let real_url = this.baseURL === "" ? "OwlShimmer.wasm" : this.baseURL + "/OwlShimmer.wasm";
      const dspFile = await fetch(real_url);
      const dspBuffer = await dspFile.arrayBuffer();
      const dspModule = await WebAssembly.compile(dspBuffer);
      const dspInstance = await WebAssembly.instantiate(dspModule, importObject);

      let HEAPU8 = new Uint8Array(dspInstance.exports.memory.buffer);
      let json = this.heap2Str(HEAPU8);
      let json_object = JSON.parse(json);
      let options = { wasm_module: dspModule, json: json };

      if (this.fWorkletProcessors.indexOf(name) === -1) {
        try {
          let re = /JSON_STR/g;
          let OwlShimmerProcessorString1 = OwlShimmerProcessorString.replace(re, json);
          let real_url = window.URL.createObjectURL(
            new Blob([OwlShimmerProcessorString1], { type: "text/javascript" })
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
      this.node = new OwlShimmerNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from OwlShimmer-processor was detected.");
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
        let real_url = this.baseURL === "" ? "main.html" : this.baseURL + "/main.html";
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
            var element = createOwlShimmer(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createOwlShimmer(this.node);
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

let OwlShimmerProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class OwlShimmerProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                OwlShimmerProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                OwlShimmerProcessor.parse_items(group.items, obj, callback);
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
                OwlShimmerProcessor.parse_items(item.items, obj, callback);
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
                OwlShimmerProcessor.parse_items(item.items, obj, callback);
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
            OwlShimmerProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, OwlShimmerProcessor.parse_item1);
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
            
            this.OwlShimmer_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.OwlShimmer_instance.exports;
            this.HEAP = this.OwlShimmer_instance.exports.memory.buffer;
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
                OwlShimmerProcessor.parse_ui(this.json_object.ui, this, OwlShimmerProcessor.parse_item2);
                
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
        registerProcessor('OwlShimmer', OwlShimmerProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "OwlShimmer";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.OwlShimmer = OwlShimmer;
  window.FaustOwlShimmer = OwlShimmer;
  window[dspName] = OwlShimmer;
} else {
  module.exports = { OwlShimmer };
}
