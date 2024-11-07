import { RingBuffer } from "./types";

declare const getRingBuffer: (moduleId?: string) => typeof RingBuffer;

export default getRingBuffer;
