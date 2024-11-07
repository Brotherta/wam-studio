/*
Code generated with Faust version 2.40.12
Compilation options: -lang wasm-ib -cn deathgate -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONdeathgate() {
  return '{"name": "deathgate","filename": "deathgate.dsp","version": "2.40.12","compile_options": "-lang wasm-ib -cn deathgate -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/5E862E608BD8F8DBD989B4A60E5B4C8BC4E28624/web/wap"],"size": 1084,"inputs": 2,"outputs": 2,"meta": [ { "analyzers_lib_name": "Faust Analyzer Library" },{ "analyzers_lib_version": "0.1" },{ "author": "Oleg Kapitonov" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn deathgate -es 1 -mcd 16 -single -ftz 2" },{ "filename": "deathgate.dsp" },{ "filters_lib_filterbank_author": "Julius O. Smith III" },{ "filters_lib_filterbank_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_filterbank_license": "MIT-style STK-4.3 license" },{ "filters_lib_fir_author": "Julius O. Smith III" },{ "filters_lib_fir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_fir_license": "MIT-style STK-4.3 license" },{ "filters_lib_highpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_highpass_plus_lowpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_plus_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_highpass_plus_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_iir_author": "Julius O. Smith III" },{ "filters_lib_iir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_license": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_tf1_author": "Julius O. Smith III" },{ "filters_lib_tf1_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1s_author": "Julius O. Smith III" },{ "filters_lib_tf1s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1s_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2_author": "Julius O. Smith III" },{ "filters_lib_tf2_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2s_author": "Julius O. Smith III" },{ "filters_lib_tf2s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2s_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/filters.lib" },{ "library_path2": "/libraries/maths.lib" },{ "library_path3": "/libraries/platform.lib" },{ "library_path4": "/libraries/basics.lib" },{ "library_path5": "/libraries/analyzers.lib" },{ "library_path6": "/libraries/misceffects.lib" },{ "library_path7": "/libraries/signals.lib" },{ "license": "GPLv3" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "misceffects_lib_name": "Misc Effects Library" },{ "misceffects_lib_version": "2.0" },{ "name": "deathgate" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "signals_lib_name": "Faust Signal Routing Library" },{ "signals_lib_version": "0.1" },{ "version": "0.1b" }],"ui": [ {"type": "vgroup","label": "deathgate","items": [ {"type": "vslider","label": "DeadZone","shortname": "DeadZone","address": "/deathgate/DeadZone","index": 28,"meta": [{ "style": "knob" }],"init": -100,"min": -120,"max": 0,"step": 0.001},{"type": "vslider","label": "NoiseGate","shortname": "NoiseGate","address": "/deathgate/NoiseGate","index": 280,"meta": [{ "style": "knob" }],"init": -120,"min": -120,"max": 0,"step": 0.001}]}]}';
}
function getBase64Codedeathgate() {
  return "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lgFBACCWAbxBgICA/AdxBH0glgEFQwAAAAALOAK0CEEAKgK8AiAwlEEAKgLcAyBFlJJBACoC9AQgWJSSQQAqAoAGIGmUkkEAKgKAByB4lJJBACoCiAdBACoC9AcghQGUQQAqArQIII8BlJKUkiGXASAGIAhqIJcBOAIAIAcgCGoglwE4AgBBAEEAKgIoOAIsQQBBACoCODgCPEEAQQAqAkA4AkRBAEEAKgJQOAJUQQBBACoCZDgCaEEAQQAqAmA4AmRBAEEAKgKIATgCjAFBAEEAKgKEATgCiAFBAEEAKgKoATgCrAFBAEEAKgKkATgCqAFBAEEAKgLIATgCzAFBAEEAKgLEATgCyAFBAEEAKgLoATgC7AFBAEEAKgLkATgC6AFBAEEAKgKIAjgCjAJBAEEAKgKEAjgCiAJBAEEAKgKQAjgClAJBAEEAKAKcAjYCoAJBAEEAKAKoAjYCrAJBAEEAKgK0AjgCuAJBAEEAKgK8AjgCwAJBAEEAKgLMAjgC0AJBAEEAKgLYAjgC3AJBAEEAKgLUAjgC2AJBAEEAKgLgAjgC5AJBAEEAKgLwAjgC9AJBAEEAKgKAAzgChANBAEEAKgL8AjgCgANBAEEAKgKQAzgClANBAEEAKgKMAzgCkANBAEEAKgKcAzgCoANBAEEAKgKYAzgCnANBAEEAKgKoAzgCrANBAEEAKgKkAzgCqANBAEEAKgK0AzgCuANBAEEAKgKwAzgCtANBAEEAKgK8AzgCwANBAEEAKALEAzYCyANBAEEAKALMAzYC0ANBAEEAKgLUAzgC2ANBAEEAKgLcAzgC4ANBAEEAKgLwAzgC9ANBAEEAKgL8AzgCgARBAEEAKgL4AzgC/ANBAEEAKgKEBDgCiARBAEEAKgKUBDgCmARBAEEAKgKkBDgCqARBAEEAKgKgBDgCpARBAEEAKgK0BDgCuARBAEEAKgKwBDgCtARBAEEAKgLABDgCxARBAEEAKgK8BDgCwARBAEEAKgLMBDgC0ARBAEEAKgLIBDgCzARBAEEAKgLUBDgC2ARBAEEAKALcBDYC4ARBAEEAKALkBDYC6ARBAEEAKgLsBDgC8ARBAEEAKgL0BDgC+ARBAEEAKgKIBTgCjAVBAEEAKgKUBTgCmAVBAEEAKgKQBTgClAVBAEEAKgKcBTgCoAVBAEEAKgKsBTgCsAVBAEEAKgK8BTgC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MDg0LCJpbnB1dHMiOiAyLCJvdXRwdXRzIjogMiwibWV0YSI6IFsgeyAiYW5hbHl6ZXJzX2xpYl9uYW1lIjogIkZhdXN0IEFuYWx5emVyIExpYnJhcnkiIH0seyAiYW5hbHl6ZXJzX2xpYl92ZXJzaW9uIjogIjAuMSIgfSx7ICJhdXRob3IiOiAiT2xlZyBLYXBpdG9ub3YiIH0seyAiYmFzaWNzX2xpYl9uYW1lIjogIkZhdXN0IEJhc2ljIEVsZW1lbnQgTGlicmFyeSIgfSx7ICJiYXNpY3NfbGliX3ZlcnNpb24iOiAiMC42IiB9LHsgImNvbXBpbGF0aW9uX29wdGlvbnMiOiAiLXNpbmdsZSAtc2NhbCAtSSBsaWJyYXJpZXMvIC1JIHByb2plY3QvIC1sYW5nIHdhc20iIH0seyAiY29tcGlsZV9vcHRpb25zIjogIi1sYW5nIHdhc20taWIgLWNuIGRlYXRoZ2F0ZSAtZXMgMSAtbWNkIDE2IC1zaW5nbGUgLWZ0eiAyIiB9LHsgImZpbGVuYW1lIjogImRlYXRoZ2F0ZS5kc3AiIH0seyAiZmlsdGVyc19saWJfZmlsdGVyYmFua19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9maWx0ZXJiYW5rX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9maWx0ZXJiYW5rX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfZmlyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2hpZ2hwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9oaWdocGFzc19wbHVzX2xvd3Bhc3NfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfaGlnaHBhc3NfcGx1c19sb3dwYXNzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9oaWdocGFzc19wbHVzX2xvd3Bhc3NfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2lpcl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9paXJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2lpcl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfbG93cGFzczBfaGlnaHBhc3MxIjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3MwX2hpZ2hwYXNzMV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX25hbWUiOiAiRmF1c3QgRmlsdGVycyBMaWJyYXJ5IiB9LHsgImZpbHRlcnNfbGliX3RmMV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3RmMV9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdGYxc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMnNfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfdGYyc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAibGlicmFyeV9wYXRoMCI6ICIvbGlicmFyaWVzL3N0ZGZhdXN0LmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgxIjogIi9saWJyYXJpZXMvZmlsdGVycy5saWIiIH0seyAibGlicmFyeV9wYXRoMiI6ICIvbGlicmFyaWVzL21hdGhzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgzIjogIi9saWJyYXJpZXMvcGxhdGZvcm0ubGliIiB9LHsgImxpYnJhcnlfcGF0aDQiOiAiL2xpYnJhcmllcy9iYXNpY3MubGliIiB9LHsgImxpYnJhcnlfcGF0aDUiOiAiL2xpYnJhcmllcy9hbmFseXplcnMubGliIiB9LHsgImxpYnJhcnlfcGF0aDYiOiAiL2xpYnJhcmllcy9taXNjZWZmZWN0cy5saWIiIH0seyAibGlicmFyeV9wYXRoNyI6ICIvbGlicmFyaWVzL3NpZ25hbHMubGliIiB9LHsgImxpY2Vuc2UiOiAiR1BMdjMiIH0seyAibWF0aHNfbGliX2F1dGhvciI6ICJHUkFNRSIgfSx7ICJtYXRoc19saWJfY29weXJpZ2h0IjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9saWNlbnNlIjogIkxHUEwgd2l0aCBleGNlcHRpb24iIH0seyAibWF0aHNfbGliX25hbWUiOiAiRmF1c3QgTWF0aCBMaWJyYXJ5IiB9LHsgIm1hdGhzX2xpYl92ZXJzaW9uIjogIjIuNSIgfSx7ICJtaXNjZWZmZWN0c19saWJfbmFtZSI6ICJNaXNjIEVmZmVjdHMgTGlicmFyeSIgfSx7ICJtaXNjZWZmZWN0c19saWJfdmVyc2lvbiI6ICIyLjAiIH0seyAibmFtZSI6ICJkZWF0aGdhdGUiIH0seyAicGxhdGZvcm1fbGliX25hbWUiOiAiR2VuZXJpYyBQbGF0Zm9ybSBMaWJyYXJ5IiB9LHsgInBsYXRmb3JtX2xpYl92ZXJzaW9uIjogIjAuMiIgfSx7ICJzaWduYWxzX2xpYl9uYW1lIjogIkZhdXN0IFNpZ25hbCBSb3V0aW5nIExpYnJhcnkiIH0seyAic2lnbmFsc19saWJfdmVyc2lvbiI6ICIwLjEiIH0seyAidmVyc2lvbiI6ICIwLjFiIiB9XSwidWkiOiBbIHsidHlwZSI6ICJ2Z3JvdXAiLCJsYWJlbCI6ICJkZWF0aGdhdGUiLCJpdGVtcyI6IFsgeyJ0eXBlIjogInZzbGlkZXIiLCJsYWJlbCI6ICJEZWFkWm9uZSIsInNob3J0bmFtZSI6ICJEZWFkWm9uZSIsImFkZHJlc3MiOiAiL2RlYXRoZ2F0ZS9EZWFkWm9uZSIsImluZGV4IjogMjgsIm1ldGEiOiBbeyAic3R5bGUiOiAia25vYiIgfV0sImluaXQiOiAtMTAwLCJtaW4iOiAtMTIwLCJtYXgiOiAwLCJzdGVwIjogMC4wMDF9LHsidHlwZSI6ICJ2c2xpZGVyIiwibGFiZWwiOiAiTm9pc2VHYXRlIiwic2hvcnRuYW1lIjogIk5vaXNlR2F0ZSIsImFkZHJlc3MiOiAiL2RlYXRoZ2F0ZS9Ob2lzZUdhdGUiLCJpbmRleCI6IDI4MCwibWV0YSI6IFt7ICJzdHlsZSI6ICJrbm9iIiB9XSwiaW5pdCI6IC0xMjAsIm1pbiI6IC0xMjAsIm1heCI6IDAsInN0ZXAiOiAwLjAwMX1dfV19";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class deathgateNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "deathgate", options);

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
          deathgateNode.remap(
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
        deathgateNode.remap(wheel, 0, 16383, pw.min, pw.max),
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
export default class deathgate {
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
          ? "deathgate.wasm"
          : this.baseURL + "/deathgate.wasm";
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
          let deathgateProcessorString1 = deathgateProcessorString.replace(
            re,
            json,
          );
          let real_url = window.URL.createObjectURL(
            new Blob([deathgateProcessorString1], { type: "text/javascript" }),
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
      this.node = new deathgateNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from deathgate-processor was detected.");
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
            var element = createdeathgateGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createdeathgateGUI(this.node);
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

let deathgateProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class deathgateProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                deathgateProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                deathgateProcessor.parse_items(group.items, obj, callback);
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
                deathgateProcessor.parse_items(item.items, obj, callback);
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
                deathgateProcessor.parse_items(item.items, obj, callback);
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
            deathgateProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, deathgateProcessor.parse_item1);
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
            
            this.deathgate_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.deathgate_instance.exports;
            this.HEAP = this.deathgate_instance.exports.memory.buffer;
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
                deathgateProcessor.parse_ui(this.json_object.ui, this, deathgateProcessor.parse_item2);
                
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
        registerProcessor('deathgate', deathgateProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "deathgate";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.deathgate = deathgate;
  window.Faustdeathgate = deathgate;
  window[dspName] = deathgate;
} else {
  module.exports = { deathgate };
}
