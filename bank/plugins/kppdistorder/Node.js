/*
Code generated with Faust version 2.40.7
Compilation options: -lang wasm-ib -cn kppdistorder -es 1 -mcd 16 -single -ftz 2 
*/

function getJSONkppdistorder() {
  return '{"name": "kppdistorder","filename": "kppdistorder.dsp","version": "2.40.7","compile_options": "-lang wasm-ib -cn kppdistorder -es 1 -mcd 16 -single -ftz 2","include_pathnames": ["/usr/local/share/faust","/usr/local/share/faust","/usr/share/faust",".","/tmp/sessions/7C833049AA677A209A185B4C309ED02EDF90252B/web/wap"],"size": 336,"inputs": 2,"outputs": 2,"meta": [ { "analyzers_lib_name": "Faust Analyzer Library" },{ "analyzers_lib_version": "0.1" },{ "author": "Oleg Kapitonov" },{ "basics_lib_bypass1_author": "Julius Smith" },{ "basics_lib_name": "Faust Basic Element Library" },{ "basics_lib_version": "0.6" },{ "compilation_options": "-single -scal -I libraries/ -I project/ -lang wasm" },{ "compile_options": "-lang wasm-ib -cn kppdistorder -es 1 -mcd 16 -single -ftz 2" },{ "filename": "kppdistorder.dsp" },{ "filters_lib_dcblocker_author": "Julius O. Smith III" },{ "filters_lib_dcblocker_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_dcblocker_license": "MIT-style STK-4.3 license" },{ "filters_lib_filterbank_author": "Julius O. Smith III" },{ "filters_lib_filterbank_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_filterbank_license": "MIT-style STK-4.3 license" },{ "filters_lib_fir_author": "Julius O. Smith III" },{ "filters_lib_fir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_fir_license": "MIT-style STK-4.3 license" },{ "filters_lib_highpass_author": "Julius O. Smith III" },{ "filters_lib_highpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_highshelf_author": "Julius O. Smith III" },{ "filters_lib_highshelf_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_highshelf_license": "MIT-style STK-4.3 license" },{ "filters_lib_iir_author": "Julius O. Smith III" },{ "filters_lib_iir_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_iir_license": "MIT-style STK-4.3 license" },{ "filters_lib_lowpass0_highpass1": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass0_highpass1_author": "Julius O. Smith III" },{ "filters_lib_lowpass_author": "Julius O. Smith III" },{ "filters_lib_lowpass_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_lowpass_license": "MIT-style STK-4.3 license" },{ "filters_lib_name": "Faust Filters Library" },{ "filters_lib_peak_eq_author": "Julius O. Smith III" },{ "filters_lib_peak_eq_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_peak_eq_license": "MIT-style STK-4.3 license" },{ "filters_lib_pole_author": "Julius O. Smith III" },{ "filters_lib_pole_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_pole_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1_author": "Julius O. Smith III" },{ "filters_lib_tf1_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf1s_author": "Julius O. Smith III" },{ "filters_lib_tf1s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf1s_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2_author": "Julius O. Smith III" },{ "filters_lib_tf2_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2_license": "MIT-style STK-4.3 license" },{ "filters_lib_tf2s_author": "Julius O. Smith III" },{ "filters_lib_tf2s_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_tf2s_license": "MIT-style STK-4.3 license" },{ "filters_lib_version": "0.3" },{ "filters_lib_zero_author": "Julius O. Smith III" },{ "filters_lib_zero_copyright": "Copyright (C) 2003-2019 by Julius O. Smith III <jos@ccrma.stanford.edu>" },{ "filters_lib_zero_license": "MIT-style STK-4.3 license" },{ "library_path0": "/libraries/stdfaust.lib" },{ "library_path1": "/libraries/basics.lib" },{ "library_path2": "/libraries/filters.lib" },{ "library_path3": "/libraries/maths.lib" },{ "library_path4": "/libraries/platform.lib" },{ "library_path5": "/libraries/analyzers.lib" },{ "license": "GPLv3" },{ "maths_lib_author": "GRAME" },{ "maths_lib_copyright": "GRAME" },{ "maths_lib_license": "LGPL with exception" },{ "maths_lib_name": "Faust Math Library" },{ "maths_lib_version": "2.5" },{ "name": "kppdistorder" },{ "platform_lib_name": "Generic Platform Library" },{ "platform_lib_version": "0.2" },{ "version": "1.2" }],"ui": [ {"type": "vgroup","label": "kppdistorder","items": [ {"type": "checkbox","label": "99_bypass","address": "/kppdistorder/99_bypass","index": 0},{"type": "vslider","label": "bass","address": "/kppdistorder/bass","index": 128,"init": 0,"min": -15,"max": 15,"step": 0.1},{"type": "vslider","label": "drive","address": "/kppdistorder/drive","index": 72,"init": 63,"min": 0,"max": 100,"step": 0.01},{"type": "vslider","label": "middle","address": "/kppdistorder/middle","index": 152,"init": 0,"min": -15,"max": 15,"step": 0.1},{"type": "vslider","label": "treble","address": "/kppdistorder/treble","index": 172,"init": 0,"min": -15,"max": 15,"step": 0.1},{"type": "vslider","label": "voice","address": "/kppdistorder/voice","index": 280,"init": 0.5,"min": 0,"max": 1,"step": 0.001},{"type": "vslider","label": "volume","address": "/kppdistorder/volume","index": 4,"init": 0.5,"min": 0,"max": 1,"step": 0.001}]}]}';
}
function getBase64Codekppdistorder() {
  return "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bmFtZSI6ICJjb21wcmVzc29yLmRzcCIsInZlcnNpb24iOiAiMi40MC43IiwiY29tcGlsZV9vcHRpb25zIjogIi1sYW5nIHdhc20taWIgLWNuIGNvbXByZXNzb3IgLWVzIDEgLW1jZCAxNiAtc2luZ2xlIC1mdHogMiIsImluY2x1ZGVfcGF0aG5hbWVzIjogWyIvdXNyL2xvY2FsL3NoYXJlL2ZhdXN0IiwiL3Vzci9sb2NhbC9zaGFyZS9mYXVzdCIsIi91c3Ivc2hhcmUvZmF1c3QiLCIuIiwiL3RtcC9zZXNzaW9ucy83QzgzMzA0OUFBNjc3QTIwOUExODVCNEMzMDlFRDAyRURGOTAyNTJCL3dlYi93YXAiXSwic2l6ZSI6IDMzNiwiaW5wdXRzIjogMiwib3V0cHV0cyI6IDIsIm1ldGEiOiBbIHsgImFuYWx5emVyc19saWJfbmFtZSI6ICJGYXVzdCBBbmFseXplciBMaWJyYXJ5IiB9LHsgImFuYWx5emVyc19saWJfdmVyc2lvbiI6ICIwLjEiIH0seyAiYXV0aG9yIjogIk9sZWcgS2FwaXRvbm92IiB9LHsgImJhc2ljc19saWJfYnlwYXNzMV9hdXRob3IiOiAiSnVsaXVzIFNtaXRoIiB9LHsgImJhc2ljc19saWJfbmFtZSI6ICJGYXVzdCBCYXNpYyBFbGVtZW50IExpYnJhcnkiIH0seyAiYmFzaWNzX2xpYl92ZXJzaW9uIjogIjAuNiIgfSx7ICJjb21waWxhdGlvbl9vcHRpb25zIjogIi1zaW5nbGUgLXNjYWwgLUkgbGlicmFyaWVzLyAtSSBwcm9qZWN0LyAtbGFuZyB3YXNtIiB9LHsgImNvbXBpbGVfb3B0aW9ucyI6ICItbGFuZyB3YXNtLWliIC1jbiBjb21wcmVzc29yIC1lcyAxIC1tY2QgMTYgLXNpbmdsZSAtZnR6IDIiIH0seyAiZmlsZW5hbWUiOiAiY29tcHJlc3Nvci5kc3AiIH0seyAiZmlsdGVyc19saWJfZGNibG9ja2VyX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2RjYmxvY2tlcl9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfZGNibG9ja2VyX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9maWx0ZXJiYW5rX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2ZpbHRlcmJhbmtfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2ZpbHRlcmJhbmtfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX2Zpcl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9maXJfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2Zpcl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfaGlnaHBhc3NfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfaGlnaHBhc3NfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2hpZ2hzaGVsZl9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9oaWdoc2hlbGZfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX2hpZ2hzaGVsZl9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfaWlyX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2lpcl9jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfaWlyX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9sb3dwYXNzMF9oaWdocGFzczEiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfbG93cGFzczBfaGlnaHBhc3MxX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX2xvd3Bhc3NfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfbG93cGFzc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfbmFtZSI6ICJGYXVzdCBGaWx0ZXJzIExpYnJhcnkiIH0seyAiZmlsdGVyc19saWJfcGVha19lcV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl9wZWFrX2VxX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl9wZWFrX2VxX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl9wb2xlX2F1dGhvciI6ICJKdWxpdXMgTy4gU21pdGggSUlJIiB9LHsgImZpbHRlcnNfbGliX3BvbGVfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3BvbGVfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMV9hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFfY29weXJpZ2h0IjogIkNvcHlyaWdodCAoQykgMjAwMy0yMDE5IGJ5IEp1bGl1cyBPLiBTbWl0aCBJSUkgPGpvc0BjY3JtYS5zdGFuZm9yZC5lZHU+IiB9LHsgImZpbHRlcnNfbGliX3RmMV9saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdGYxc19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjFzX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl90ZjJfbGljZW5zZSI6ICJNSVQtc3R5bGUgU1RLLTQuMyBsaWNlbnNlIiB9LHsgImZpbHRlcnNfbGliX3RmMnNfYXV0aG9yIjogIkp1bGl1cyBPLiBTbWl0aCBJSUkiIH0seyAiZmlsdGVyc19saWJfdGYyc19jb3B5cmlnaHQiOiAiQ29weXJpZ2h0IChDKSAyMDAzLTIwMTkgYnkgSnVsaXVzIE8uIFNtaXRoIElJSSA8am9zQGNjcm1hLnN0YW5mb3JkLmVkdT4iIH0seyAiZmlsdGVyc19saWJfdGYyc19saWNlbnNlIjogIk1JVC1zdHlsZSBTVEstNC4zIGxpY2Vuc2UiIH0seyAiZmlsdGVyc19saWJfdmVyc2lvbiI6ICIwLjMiIH0seyAiZmlsdGVyc19saWJfemVyb19hdXRob3IiOiAiSnVsaXVzIE8uIFNtaXRoIElJSSIgfSx7ICJmaWx0ZXJzX2xpYl96ZXJvX2NvcHlyaWdodCI6ICJDb3B5cmlnaHQgKEMpIDIwMDMtMjAxOSBieSBKdWxpdXMgTy4gU21pdGggSUlJIDxqb3NAY2NybWEuc3RhbmZvcmQuZWR1PiIgfSx7ICJmaWx0ZXJzX2xpYl96ZXJvX2xpY2Vuc2UiOiAiTUlULXN0eWxlIFNUSy00LjMgbGljZW5zZSIgfSx7ICJsaWJyYXJ5X3BhdGgwIjogIi9saWJyYXJpZXMvc3RkZmF1c3QubGliIiB9LHsgImxpYnJhcnlfcGF0aDEiOiAiL2xpYnJhcmllcy9iYXNpY3MubGliIiB9LHsgImxpYnJhcnlfcGF0aDIiOiAiL2xpYnJhcmllcy9maWx0ZXJzLmxpYiIgfSx7ICJsaWJyYXJ5X3BhdGgzIjogIi9saWJyYXJpZXMvbWF0aHMubGliIiB9LHsgImxpYnJhcnlfcGF0aDQiOiAiL2xpYnJhcmllcy9wbGF0Zm9ybS5saWIiIH0seyAibGlicmFyeV9wYXRoNSI6ICIvbGlicmFyaWVzL2FuYWx5emVycy5saWIiIH0seyAibGljZW5zZSI6ICJHUEx2MyIgfSx7ICJtYXRoc19saWJfYXV0aG9yIjogIkdSQU1FIiB9LHsgIm1hdGhzX2xpYl9jb3B5cmlnaHQiOiAiR1JBTUUiIH0seyAibWF0aHNfbGliX2xpY2Vuc2UiOiAiTEdQTCB3aXRoIGV4Y2VwdGlvbiIgfSx7ICJtYXRoc19saWJfbmFtZSI6ICJGYXVzdCBNYXRoIExpYnJhcnkiIH0seyAibWF0aHNfbGliX3ZlcnNpb24iOiAiMi41IiB9LHsgIm5hbWUiOiAiY29tcHJlc3NvciIgfSx7ICJwbGF0Zm9ybV9saWJfbmFtZSI6ICJHZW5lcmljIFBsYXRmb3JtIExpYnJhcnkiIH0seyAicGxhdGZvcm1fbGliX3ZlcnNpb24iOiAiMC4yIiB9LHsgInZlcnNpb24iOiAiMS4yIiB9XSwidWkiOiBbIHsidHlwZSI6ICJ2Z3JvdXAiLCJsYWJlbCI6ICJjb21wcmVzc29yIiwiaXRlbXMiOiBbIHsidHlwZSI6ICJjaGVja2JveCIsImxhYmVsIjogIjk5X2J5cGFzcyIsImFkZHJlc3MiOiAiL2NvbXByZXNzb3IvOTlfYnlwYXNzIiwiaW5kZXgiOiAwfSx7InR5cGUiOiAidnNsaWRlciIsImxhYmVsIjogImJhc3MiLCJhZGRyZXNzIjogIi9jb21wcmVzc29yL2Jhc3MiLCJpbmRleCI6IDEyOCwiaW5pdCI6IDAsIm1pbiI6IC0xNSwibWF4IjogMTUsInN0ZXAiOiAwLjF9LHsidHlwZSI6ICJ2c2xpZGVyIiwibGFiZWwiOiAiZHJpdmUiLCJhZGRyZXNzIjogIi9jb21wcmVzc29yL2RyaXZlIiwiaW5kZXgiOiA3MiwiaW5pdCI6IDYzLCJtaW4iOiAwLCJtYXgiOiAxMDAsInN0ZXAiOiAwLjAxfSx7InR5cGUiOiAidnNsaWRlciIsImxhYmVsIjogIm1pZGRsZSIsImFkZHJlc3MiOiAiL2NvbXByZXNzb3IvbWlkZGxlIiwiaW5kZXgiOiAxNTIsImluaXQiOiAwLCJtaW4iOiAtMTUsIm1heCI6IDE1LCJzdGVwIjogMC4xfSx7InR5cGUiOiAidnNsaWRlciIsImxhYmVsIjogInRyZWJsZSIsImFkZHJlc3MiOiAiL2NvbXByZXNzb3IvdHJlYmxlIiwiaW5kZXgiOiAxNzIsImluaXQiOiAwLCJtaW4iOiAtMTUsIm1heCI6IDE1LCJzdGVwIjogMC4xfSx7InR5cGUiOiAidnNsaWRlciIsImxhYmVsIjogInZvaWNlIiwiYWRkcmVzcyI6ICIvY29tcHJlc3Nvci92b2ljZSIsImluZGV4IjogMjgwLCJpbml0IjogMC41LCJtaW4iOiAwLCJtYXgiOiAxLCJzdGVwIjogMC4wMDF9LHsidHlwZSI6ICJ2c2xpZGVyIiwibGFiZWwiOiAidm9sdW1lIiwiYWRkcmVzcyI6ICIvY29tcHJlc3Nvci92b2x1bWUiLCJpbmRleCI6IDQsImluaXQiOiAwLjUsIm1pbiI6IDAsIm1heCI6IDEsInN0ZXAiOiAwLjAwMX1dfV19";
}

/*
 faust2wasm: GRAME 2017-2019
*/

("use strict");

if (typeof AudioWorkletNode === "undefined") {
  alert("AudioWorklet is not supported in this browser !");
}

class kppdistorderNode extends AudioWorkletNode {
  constructor(context, baseURL, options) {
    super(context, "kppdistorder", options);

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
          kppdistorderNode.remap(value, 0, 127, this.fCtrlLabel[ctrl][i].min, this.fCtrlLabel[ctrl][i].max)
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
      this.setParamValue(pw.path, kppdistorderNode.remap(wheel, 0, 16383, pw.min, pw.max));
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
export default class kppdistorder {
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

      let real_url = this.baseURL === "" ? "kppdistorder.wasm" : this.baseURL + "/kppdistorder.wasm";
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
          let kppdistorderProcessorString1 = kppdistorderProcessorString.replace(re, json);
          let real_url = window.URL.createObjectURL(
            new Blob([kppdistorderProcessorString1], { type: "text/javascript" })
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
      this.node = new kppdistorderNode(this.context, this.baseURL, {
        numberOfInputs: parseInt(json_object.inputs) > 0 ? 1 : 0,
        numberOfOutputs: parseInt(json_object.outputs) > 0 ? 1 : 0,
        channelCount: Math.max(1, parseInt(json_object.inputs)),
        outputChannelCount: [parseInt(json_object.outputs)],
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        processorOptions: options,
      });
      this.node.onprocessorerror = () => {
        console.log("An error from kppdistorder-processor was detected.");
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
            var element = createkppdistorderGUI(this.node);
            resolve(element);
          };
        } else {
          // LINK EXIST, WE AT LEAST CREATED ONE INSTANCE PREVIOUSLY
          // so we can create another instance
          var element = createkppdistorderGUI(this.node);
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

let kppdistorderProcessorString = `

    'use strict';

    // Monophonic Faust DSP
    class kppdistorderProcessor extends AudioWorkletProcessor {
        
        // JSON parsing functions
        static parse_ui(ui, obj, callback)
        {
            for (var i = 0; i < ui.length; i++) {
                kppdistorderProcessor.parse_group(ui[i], obj, callback);
            }
        }
        
        static parse_group(group, obj, callback)
        {
            if (group.items) {
                kppdistorderProcessor.parse_items(group.items, obj, callback);
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
                kppdistorderProcessor.parse_items(item.items, obj, callback);
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
                kppdistorderProcessor.parse_items(item.items, obj, callback);
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
            kppdistorderProcessor.parse_ui(JSON.parse(\`JSON_STR\`).ui, params, kppdistorderProcessor.parse_item1);
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
            
            this.kppdistorder_instance = new WebAssembly.Instance(options.processorOptions.wasm_module, importObject);
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
            
            this.factory = this.kppdistorder_instance.exports;
            this.HEAP = this.kppdistorder_instance.exports.memory.buffer;
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
                kppdistorderProcessor.parse_ui(this.json_object.ui, this, kppdistorderProcessor.parse_item2);
                
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
        registerProcessor('kppdistorder', kppdistorderProcessor);
    } catch (error) {
        console.warn(error);
    }
`;

const dspName = "kppdistorder";

// WAP factory or npm package module
if (typeof module === "undefined") {
  window.kppdistorder = kppdistorder;
  window.Faustkppdistorder = kppdistorder;
  window[dspName] = kppdistorder;
} else {
  module.exports = { kppdistorder };
}
