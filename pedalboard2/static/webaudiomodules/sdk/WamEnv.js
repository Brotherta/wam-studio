/** @typedef {import('../api').WamProcessor} IWamProcessor */
/** @typedef {import('../api').WamEnv} IWamEnv */
/** @typedef {import('../api').WamGroup} IWamGroup */
/** @typedef {import('../api').WamEvent} WamEvent */
/** @typedef {import('../api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */

/**
 * @param {string} apiVersion
 */
const initializeWamEnv = (apiVersion) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;
	if (audioWorkletGlobalScope.AudioWorkletProcessor 
		&& audioWorkletGlobalScope.webAudioModules) return; // already initialized

	/** @type {Map<string, any>} */
	const moduleScopes = new Map();

	/** @type {Map<string, IWamGroup>} */
	const groups = new Map();
	
	/**
	 * @implements {IWamEnv}
	 */
	class WamEnv {
		constructor() {}

		get apiVersion() {
			return apiVersion;
		}

		/**
		 * @param {string} moduleId 
		 * @returns {Record<string, any>}
		*/
		getModuleScope(moduleId) {
			if (!moduleScopes.has(moduleId)) moduleScopes.set(moduleId, {});
			return moduleScopes.get(moduleId);
		}

		/** 
		 * @param {string} groupId
		 * @param {string} groupKey
		 */
		getGroup(groupId, groupKey) {
			const group = groups.get(groupId);
			if (group.validate(groupKey)) return group;
			else throw 'Invalid key';
		}

		/**
		 * @param {IWamGroup} group
		 */
		addGroup(group) {
			if (!groups.has(group.groupId)) groups.set(group.groupId, group);
		}

		/**
		 * @param {IWamGroup} group
		 */
		removeGroup(group) {
			groups.delete(group.groupId);
		}

		/**
		 * @param {IWamProcessor} wam
		 */
		addWam(wam) {
			/** @type {IWamGroup} */
			const group = groups.get(wam.groupId);
			group.addWam(wam);
		}

		/**
		 * @param {IWamProcessor} wam
		 */
		removeWam(wam) {
			/** @type {IWamGroup} */
			const group = groups.get(wam.groupId);
			group.removeWam(wam);
		}

		/**
		 * @param {string} groupId
		 * @param {string} fromId
		 * @param {string} toId
		 * @param {number} [output]
		 */
		connectEvents(groupId, fromId, toId, output = 0) {
			/** @type {IWamGroup} */
			const group = groups.get(groupId);
			group.connectEvents(fromId, toId, output);
		}

		/**
		 * @param {string} groupId
		 * @param {string} fromId
		 * @param {string} [toId]
		 * @param {number} [output]
		 */
		disconnectEvents(groupId, fromId, toId, output) {
			/** @type {IWamGroup} */
			const group = groups.get(groupId);
			group.disconnectEvents(fromId, toId, output);
		}

		/**
		 * @param {IWamProcessor} from
		 * @param {WamEvent[]} events 
		 */
		emitEvents(from, ...events) {
			/** @type {IWamGroup} */
			const group = groups.get(from.groupId);
			group.emitEvents(from, ...events);
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		if (!audioWorkletGlobalScope.webAudioModules) audioWorkletGlobalScope.webAudioModules = new WamEnv();
	}
};

export default initializeWamEnv;
