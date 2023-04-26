# WebAudioModules SDK

### Writing a plugin

A plugin is composed of (at least) two files :
- `index.js`: an ES module that implements the _WebAudioModule_ class from the sdk
- `gui.js`: an ES module that exports a function to create a DOM node containing the plugin GUI


__index.js__
First create the WebAudioModule **ES module**.
This module must export as default a class that extends the sdk WebAudioModule class.
The only method that must be implemented is `async createAudioNode(options)`.
Example:
```js
import { WebAudioModule } from '@webaudiomodules/sdk';

export default class SimpleGainPlugin extends WebAudioModule {
	// The plugin redefines the async method createAudionode()
	// that must return an <Audionode>
	async createAudioNode(options) {
		const gainNode = new GainNode(this.audioContext, options);
		return gainNode;
	}
}
```
More complex plugins can return a CompositeNode (i.e a graph of WebAudio nodes seen as a single node. See examples pingpongdelay or quadrafuzz in the src/packages folder) or an AudioWorkletNode.

__gui.js__
If you want your plugin to export a GUI, create an ES module file named gui.js.
The module must export a named export createElement: `async function createElement(plugin)`.

The plugin parameter is the instance of the WebAudioModule that can be used by the GUI for example
to get a reference to the AudioNode etc..

The function must return a `HTMLElement`.

Example using native DOM :
```js
export async function createElement(plugin) {
	const div = document.createElement('div');
	div.textContent = `WebAudioModule[${plugin.name}]`;
	return div;
}
```

Example using React :
This example requires more build configuration in the plugin. The plugin must be passed to babel with jsx transform.
The `livegain` plugin is an example that uses React and TypeScript.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import SimpleGainComponent from './SimpleGainComponent';

export async function createElement(plugin) {
	const div = document.createElement('div');
    ReactDOM.render(<SimpleGainComponent plugin={plugin} />, div);
    return div;
}
```

### Loading a plugin
```js
    const { default: pluginFactory } = await import('./index.js'); // load main plugin file

	// Create a new instance of the plugin
	// You can can optionally specify additional information such as the initial state of the
	// plugin
	const pluginInstance = await pluginFactory.createInstance(audioContext, {});

	// instance.audioNode is the plugin WebAudio node (native, AudioWorklet or
	// Composite). It can then be connected to the WebAudio graph.

	...
	// for example...
	mediaElementSource.connect(pluginInstance.audioNode);
	audioNode.connect(audioContext.destination);

	// then create the GUI
	const pluginDomNode = await pluginInstance.createGui();
	// for example
	document.appendChild(pluginDomNode);
```

__WebAudioModule.createInstance()__

Now that your plugin is available, you can create an instance of it using `WebAudioModule.createInstance(audioContext)`.

Example:
```js
const audioContext = new AudioContext();
// The code part relative to the audio source and destination is not covered here.
// If you want a complete example, see the host code in host/src/index.js or host/src/livegain.js
const simpleGainPluginInstance = await SimpleGain.createInstance(audioContext);
simpleGainPluginInstance.setState({ enabled: true }); // plugins AudioNodes are bypassed by default.
```

__Connect the AudioNode__
Now that we have an instance of our plugin we can connect its AudioNode to ours.

Example:
```js
const simpleGainPluginAudioNode = simpleGainPluginInstance.getAudioNode();
mediaElementSource.connect(simpleGainPluginAudioNode);
simpleGainPluginAudioNode.connect(audioContext.destination);
```

__Show the GUI__
Now we have to create the HTMLElement that hosts the plugin GUI via the plugin method `async instance.createGui()`.
The method loads the GUI module if it was not loaded before and then calls its exported method `async createElement()`.


Now that you have an HTML element, append it to the host DOM.

Example:
```js
// For this very simple example, we just insert the SimpleGain Gui directly at the end of the body
const { body } = document;
const simpleGainPluginGui = simpleGainPluginInstance.createGui();
body.appendChild(domNode);
```

With all these pieces in place, we can now test the new plugin in the example host.
In order to test your plugin, you have to update `index.html` in the `src` folder inside the package `host`,
adding a link to your code in the list of available plugins like so:
```html
	<ul id="examples">
	<!-- ... -->
	<li data-plugin-url="simplegain/dist">Simple Gain</li>
	<!-- ... -->
```

When clicked, this will automatically populate the test host's WAM Plugin URL entry. Next click the 'LOAD PLUGIN'
button and your plugin should appear at the top of the page. Now you can test audio playback, MIDI, automation,
and saving/loading your plugin's internal state.

## sdk
A detailed description of the WAM SDK can be found in the [WIKI](https://github.com/53js/webaudiomodule/wiki/SDK-Overview).
