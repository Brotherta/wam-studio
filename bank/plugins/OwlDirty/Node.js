/*
Code generated with Faust version 2.40.7
Compilation options: -lang wasm-ib -cn OwlDirty -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONOwlDirty() {
  return '{"name": "OwlDirty","filename": "OwlDirty.dsp","version": "2.40.7","compile_options": "-lang wasm-ib -cn OwlDirty -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/9707300B4D812F6386FF4F3FF1602D766DABD514/web/wap"],"size": 172268,"inputs": 2,"outputs": 2,"meta": [ { "author": "Xavier Godart" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn OwlDirty -es 1 -mcd 16 -single -ftz 2" },{ "copyright": "(c) Empirical Noises 2017" },{ "delays_lib_name": "Faust Delay Library" },{ "delays_lib_version": "0.1" },{ "filename": "OwlDirty.dsp" },{ "filters_lib_allpass_fcomb_author": "Julius O. Smith III" },{ "filters_lib_allpass_fcomb_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_allpass_fcomb_license": "MIT-style STK-4.3 license" },{ "filters_lib_dcblocker_author": "Julius O. Smith III" },{ "filters_lib_dcblocker_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_dcblocker_license": "MIT-style STK-4.3 license" },{ "filters_lib_fir_author": "Julius O. Smith III" },{ "filters_lib_fir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_fir_license": "MIT-style STK-4.3 license" },{ "filters_lib_highpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_author": "Julius O. Smith III" },{ "filters_lib_iir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_license": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_pole_author": "Julius O. Smith III" },{ "filters_lib_pole_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_pole_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1_author": "Julius O. Smith III" },{ "filters_lib_tf1_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1s_author": "Julius O. Smith III" },{ "filters_lib_tf1s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1s_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2_author": "Julius O. Smith III" },{ "filters_lib_tf2_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2s_author": "Julius O. Smith III" },{ "filters_lib_tf2s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2s_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "filters_lib_zero_author": "Julius O. Smith III" },{ "filters_lib_zero_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_zero_license": "MIT-style STK-4.3 license" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/signals.lib" },{ "library_path3": "/libraries/filters.lib" },{ "library_path4": "/libraries/delays.lib" },{ "library_path5": "/libraries/maths.lib" },{ "library_path6": "/libraries/platform.lib" },{ "library_path7": "/libraries/routes.lib" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "OwlDirty" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "routes_lib_hadamard_author": "Remy Muller, revised by RM" },{ "routes_lib_name": "Faust Signal Routing Library" },{ "routes_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "1.0.0" }],"ui": [ {"type": "vgroup","label": "OwlDirty","items": [ {"type": "hslider","label": "DECAY","address": "/OwlDirty/DECAY","index": 24,"meta": [{ "style": "knobs" }],"init": 0.7,"min": 0.5,"max": 1,"step": 0.01},{"type": "hslider","label": "DRIVE","address": "/OwlDirty/DRIVE","index": 20,"meta": [{ "style": "knobs" }],"init": 0,"min": 0,"max": 0.7,"step": 0.1},{"type": "hslider","label": "MIX","address": "/OwlDirty/MIX","index": 4,"meta": [{ "style": "knobs" }],"init": 0.75,"min": 0,"max": 1,"step": 0.01},{"type": "hslider","label": "TONE","address": "/OwlDirty/TONE","index": 16,"meta": [{ "OWL": "B" },{ "style": "knobs" }],"init": 4000,"min": 900,"max": 8000,"step": 0.01},{"type": "checkbox","label": "bypass","address": "/OwlDirty/bypass","index": 0}]}]}';
}
function getBase64CodeOwlDirty() {
  return "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aWMgRWxlbWVudCBMaWJyYXJ5IiB9LHsgImJhc2ljc19saWJfdmVyc2lvbiI6ICIwLjYiIH0seyAiY29tcGlsYXRpb25fb3B0aW9ucyI6ICItc2luZ2xlIC1zY2FsIC1JIGxpYnJhcmllcy8gLUkgcHJvamVjdC8gLWxhbmcgd2FzbSIgfSx7ICJjb21waWxlX29wdGlvbnMiOiAiLWxhbmcgd2FzbS1pYiAtY24gT3dsRGlydHkgLWVzIDEgLW1jZCAxNiAtc2luZ2xlIC1mdHogMiIgfSx7ICJjb3B5cmlnaHQiOiAiKGMpIEVtcGlyaWNhbCBOb2lzZXMgMjAxNyIgfSx7ICJkZWxheXNfbGliX25hbWUiOiAiRmF1c3QgRGVsYXkgTGlicmFyeSIgfSx7ICJkZWxheXNfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgImZpbGVuYW1lIjogIk93bERpcnR5LmRzcCIgfSx7ICJmaWx0ZXJzX2xpYl9hbGxwYXNzX2Zjb21iX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2FsbHBhc3NfZmNvbWJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2FsbHBhc3NfZmNvbWJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2RjYmxvY2tlcl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9kY2Jsb2NrZXJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2RjYmxvY2tlcl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfZmlyX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2Zpcl9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfZmlyX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9oaWdocGFzc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9oaWdocGFzc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfaWlyX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2lpcl9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfaWlyX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczEiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczFfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9uYW1lIjogIkZhdXN0IEZpbHRlcnMgTGlicmFyeSIgfSx7ICJmaWx0ZXJzX2xpYl9wb2xlX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX3BvbGVfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3BvbGVfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3RmMV9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdGYxc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMnNfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfdGYyc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAiZmlsdGVyc19saWJfemVyb19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl96ZXJvX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl96ZXJvX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJsaWJyYXJ5X3BhdGgwIjogIi9saWJyYXJpZXMvc3RkZmF1c3QubGliIiB9LHsgImxpYnJhcnlfcGF0aDEiOiAiL2xpYnJhcmllcy9iYXNpY3MubGliIiB9LHsgImxpYnJhcnlfcGF0aDIiOiAiL2xpYnJhcmllcy9zaWduYWxzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgzIjogIi9saWJyYXJpZXMvZmlsdGVycy5saWIiIH0seyAibGlicmFyeV9wYXRoNCI6ICIvbGlicmFyaWVzL2RlbGF5cy5saWIiIH0seyAibGlicmFyeV9wYXRoNSI6ICIvbGlicmFyaWVzL21hdGhzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGg2IjogIi9saWJyYXJpZXMvcGxhdGZvcm0ubGliIiB9LHsgImxpYnJhcnlfcGF0aDciOiAiL2xpYnJhcmllcy9yb3V0ZXMubGliIiB9LHsgIm1hdGhzX2xpYl9hdXRob3IiOiAiR1JBTUUiIH0seyAibWF0aHNfbGliX2NvcHlyaWdodCI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfbGljZW5zZSI6ICJMR1BMIHdpdGggZXhjZXB0aW9uIiB9LHsgIm1hdGhzX2xpYl9uYW1lIjogIkZhdXN0IE1hdGggTGlicmFyeSIgfSx7ICJtYXRoc19saWJfdmVyc2lvbiI6ICIyLjUiIH0seyAibmFtZSI6ICJPd2xEaXJ0eSIgfSx7ICJwbGF0Zm9ybV9saWJfbmFtZSI6ICJHZW5lcmljIFBsYXRmb3JtIExpYnJhcnkiIH0seyAicGxhdGZvcm1fbGliX3ZlcnNpb24iOiAiMC4yIiB9LHsgInJvdXRlc19saWJfaGFkYW1hcmRfYXV0aG9yIjogIlJlbXkgTXVsbGVyLCByZXZpc2VkIGJ5IFJNIiB9LHsgInJvdXRlc19saWJfbmFtZSI6ICJGYXVzdCBTaWduYWwgUm91dGluZyBMaWJyYXJ5IiB9LHsgInJvdXRlc19saWJfdmVyc2lvbiI6ICIwLjIiIH0seyAic2lnbmFsc19saWJfbmFtZSI6ICJGYXVzdCBTaWduYWwgUm91dGluZyBMaWJyYXJ5IiB9LHsgInNpZ25hbHNfbGliX3ZlcnNpb24iOiAiMC4xIiB9LHsgInZlcnNpb24iOiAiMS4wLjAiIH1dLCJ1aSI6IFsgeyJ0eXBlIjogInZncm91cCIsImxhYmVsIjogIk93bERpcnR5IiwiaXRlbXMiOiBbIHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiREVDQVkiLCJhZGRyZXNzIjogIi9Pd2xEaXJ0eS9ERUNBWSIsImluZGV4IjogMjQsIm1ldGEiOiBbeyAic3R5bGUiOiAia25vYnMiIH1dLCJpbml0IjogMC43LCJtaW4iOiAwLjUsIm1heCI6IDEsInN0ZXAiOiAwLjAxfSx7InR5cGUiOiAiaHNsaWRlciIsImxhYmVsIjogIkRSSVZFIiwiYWRkcmVzcyI6ICIvT3dsRGlydHkvRFJJVkUiLCJpbmRleCI6IDIwLCJtZXRhIjogW3sgInN0eWxlIjogImtub2JzIiB9XSwiaW5pdCI6IDAsIm1pbiI6IDAsIm1heCI6IDAuNywic3RlcCI6IDAuMX0seyJ0eXBlIjogImhzbGlkZXIiLCJsYWJlbCI6ICJNSVgiLCJhZGRyZXNzIjogIi9Pd2xEaXJ0eS9NSVgiLCJpbmRleCI6IDQsIm1ldGEiOiBbeyAic3R5bGUiOiAia25vYnMiIH1dLCJpbml0IjogMC43NSwibWluIjogMCwibWF4IjogMSwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJoc2xpZGVyIiwibGFiZWwiOiAiVE9ORSIsImFkZHJlc3MiOiAiL093bERpcnR5L1RPTkUiLCJpbmRleCI6IDE2LCJtZXRhIjogW3sgIk9XTCI6ICJCIiB9LHsgInN0eWxlIjogImtub2JzIiB9XSwiaW5pdCI6IDQwMDAsIm1pbiI6IDkwMCwibWF4IjogODAwMCwic3RlcCI6IDAuMDF9LHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogImJ5cGFzcyIsImFkZHJlc3MiOiAiL093bERpcnR5L2J5cGFzcyIsImluZGV4IjogMH1dfV19";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class OwlDirtyNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "OwlDirty", options);

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
          OwlDirtyNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max)
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
      this.setParamValue(pw.path, OwlDirtyNode.remap(wheel, 0, 16383, pw.min, pw.max));
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
export default class OwlDirty {
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

      let real_url = this.baseURL === "" ? "OwlDirty.wasm" : this.baseURL + "/OwlDirty.wasm";
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
          let OwlDirtyProcessorString1 = OwlDirtyProcessorString.replace(re, json);
          let real_url = window.URL.createObjectURL(new Blob([OwlDirtyProcessorString1], { type: "text/javascript" }));
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
      this.node = new OwlDirtyNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from OwlDirty-processor was detected.");
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
            var element = createOwlDirtyGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createOwlDirtyGUI(this.node);
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

let OwlDirtyProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class OwlDirtyProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                OwlDirtyProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                OwlDirtyProcessor.parse_items(group.items, obj, callback);
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
                OwlDirtyProcessor.parse_items(item.items, obj, callback);
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
                OwlDirtyProcessor.parse_items(item.items, obj, callback);
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
            OwlDirtyProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, OwlDirtyProcessor.parse_item1);
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
            
            this.OwlDirty_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.OwlDirty_instance.exports;
            this.HEAP = this.OwlDirty_instance.exports.memory.buffer;
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
                OwlDirtyProcessor.parse_ui(this.json_object.ui, this, OwlDirtyProcessor.parse_item2);
                
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
        registerProcessor('OwlDirty', OwlDirtyProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "OwlDirty";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.OwlDirty = OwlDirty;
  window.FaustOwlDirty = OwlDirty;
  window[dspName] = OwlDirty;
} else {
  module.exports = { OwlDirty };
}
