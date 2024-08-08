/** @typedef {import('../api').WamParameter} IWamParameter */
/** @typedef {typeof import('../api').WamParameter} WamParameterContructor */
/** @typedef {import('../api').WamParameterInfo} WamParameterInfo */
/** @typedef {import('../api').AudioWorkletGlobalScope} AudioWorkletGlobalScope */
/** @typedef {import('./types').WamSDKBaseModuleScope} WamSDKBaseModuleScope */

/**
 * @param {string} [moduleId]
 * @returns {WamParameterContructor}
 */
const getWamParameter = (moduleId) => {
	/** @type {AudioWorkletGlobalScope} */
	// @ts-ignore
	const audioWorkletGlobalScope = globalThis;

	/** @implements {IWamParameter} */
	class WamParameter {
		/** @param {WamParameterInfo} info */
		constructor(info) {
			/** @readonly @type {WamParameterInfo} */
			this.info = info;
			/** @private @type {number} */
			this._value = info.defaultValue;
		}
	
		/**
		 * Set current (denormalized) value
		 * @param {number} value
		*/
		set value(value) {
			this._value = value;
		}
	
		/**
		 * Get current (denormalized) value
		 * @returns {number}
		 */
		get value() {
			return this._value;
		}
	
		/**
		 * Set current value in normalized range
		 * @param {number} valueNorm
		 */
		set normalizedValue(valueNorm) {
			this.value = this.info.denormalize(valueNorm);
		}
	
		/**
		 * Get current value in normalized range
		 * @returns {number}
		 */
		get normalizedValue() {
			return this.info.normalize(this.value);
		}
	}

	if (audioWorkletGlobalScope.AudioWorkletProcessor) {
		/** @type {WamSDKBaseModuleScope} */
		const ModuleScope = audioWorkletGlobalScope.webAudioModules.getModuleScope(moduleId);
	
		if (!ModuleScope.WamParameter) ModuleScope.WamParameter = WamParameter;
	}

	return WamParameter;
};

export default getWamParameter;
