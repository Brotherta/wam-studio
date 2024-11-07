import apiVersion from "./apiVersion.js";
import addFunctionModule from "./addFunctionModule.js";
import initializeWamEnv from "./WamEnv.js";
import initializeWamGroup from "./WamGroup.js";

/**
 * @param {BaseAudioContext} audioContext
 * @param {string} [hostGroupId]
 * @param {string} [hostGroupKey]
 * @returns {Promise<[string, string]>} [hostGroupId, hostGroupKey]
 */
const initializeWamHost = async (
  audioContext,
  hostGroupId = `wam-host-${performance.now().toString()}`,
  hostGroupKey = performance.now().toString(),
) => {
  await addFunctionModule(
    audioContext.audioWorklet,
    initializeWamEnv,
    apiVersion,
  );
  await addFunctionModule(
    audioContext.audioWorklet,
    initializeWamGroup,
    hostGroupId,
    hostGroupKey,
  );
  return [hostGroupId, hostGroupKey];
};

export default initializeWamHost;
