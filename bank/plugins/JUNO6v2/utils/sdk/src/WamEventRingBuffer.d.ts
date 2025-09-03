import { WamEventRingBuffer } from './types';

declare const getWamEventRingBuffer: (moduleId?: string) => typeof WamEventRingBuffer;

export default getWamEventRingBuffer;
