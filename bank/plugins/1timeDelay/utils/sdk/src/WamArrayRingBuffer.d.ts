import { WamArrayRingBuffer } from "./types";

declare const getWamArrayRingBuffer: (
  moduleId?: string,
) => typeof WamArrayRingBuffer;

export default getWamArrayRingBuffer;
