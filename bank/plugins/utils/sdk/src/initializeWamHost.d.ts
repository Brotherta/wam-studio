/**
 * Automatically initialize a WamEnv and a WamGroup in the AudioWorklet
 *
 * @returns [hostGroupId, hostGroupKey]
 */
declare const initializeWamHost: (audioContext: BaseAudioContext, groupId?: string, groupKey?: string) => Promise<[string, string]>;

export default initializeWamHost;
