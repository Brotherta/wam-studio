import { WebAudioModule } from './sdk/index.js';
import { CompositeAudioNode, ParamMgrFactory } from './sdk/parammgr.js';
import * as patch from "./cmaj_Pro54.js";
import { createPatchViewHolder } from "./cmaj_api/cmaj-patch-view.js"

const getBaseUrl = (relativeURL) => {
  const baseURL = relativeURL.href.substring(0, relativeURL.href.lastIndexOf('/'));
  return baseURL;
};

class CmajNode extends CompositeAudioNode
{
  constructor (context, options)
  {
    super (context, options);
  }

  setup (patchConnection, paramManagerNode)
  {
    this.patchConnection = patchConnection;

    const getInputWithPurpose = (purpose) =>
    {
      for (const i of this.patchConnection.inputEndpoints)
        if (i.purpose === purpose)
          return i.endpointID;
    }

    if (getInputWithPurpose ("audio in"))
      this.connect (this.patchConnection.audioNode, 0, 0);

    this._wamNode = paramManagerNode;
    this._output = this.patchConnection.audioNode;

    const midiEndpointID = getInputWithPurpose ("midi in");

    if (midiEndpointID)
    {
      this._wamNode.addEventListener('wam-midi', ({ detail }) =>
      {
//        console.log(detail);
        this.patchConnection.sendMIDIInputEvent (midiEndpointID, detail.data.bytes[2] | (detail.data.bytes[1] << 8) | (detail.data.bytes[0] << 16));
      });
    }
  }
}

export default class CmajModule extends WebAudioModule
{
  async createAudioNode (options)
  {
    const node = new CmajNode(this.audioContext);

    this.patchConnection = await patch.createAudioWorkletNodePatchConnection (this.audioContext, "Pro54");

    const parameterList = this.buildParameterList();
    const paramMgrNode = await ParamMgrFactory.create(this, { internalParamsConfig: parameterList } );

    node.setup (this.patchConnection, paramMgrNode);

    return node;
  }

  async initialize (state)
  {
    const hasPurpose = (endpoints, purpose) =>
    {
      for (const i of endpoints)
        if (i.purpose === purpose)
          return true;

      return false;
    }

    const descriptor =
    {
      identifier:     patch.manifest.ID,
      name:           patch.manifest.name,
      description:    patch.manifest.description,
      version:        patch.manifest.version,
      vendor:         patch.manifest.manufacturer,
      isInstrument:   patch.manifest.isInstrument,
      thumbnail:      patch.manifest.icon,
      website:        patch.manifest.URL,
      hasMidiInput:   hasPurpose (patch.getInputEndpoints(), "midi in"),
      hasAudioInput:  hasPurpose (patch.getInputEndpoints(), "audio in"),
      hasMidiOutput:  hasPurpose (patch.getOutputEndpoints(), "midi out"),
      hasAudioOutput: hasPurpose (patch.getOutputEndpoints(), "audio out"),
    };

    Object.assign (this.descriptor, descriptor);
    return super.initialize(state);
  }

  buildParameterList()
  {
    const paramList = {};

    const inputParameters  = this.patchConnection.inputEndpoints.filter (({ purpose }) => purpose === "parameter");

    inputParameters.forEach ((endpoint) =>
    {
      paramList[endpoint.endpointID] =
      {
        defaultValue: endpoint.annotation.init,
        minValue: endpoint.annotation.min,
        maxValue: endpoint.annotation.max,
        onChange: (value) => { this.patchConnection.sendEventOrValue (endpoint.endpointID, value); }
      };
    });

    return paramList;
  }

  createGui()
  {
    return createPatchViewHolder (this.patchConnection);
  }

  destroyGui()
  {
  }
}
