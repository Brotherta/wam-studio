import { TypedArray, TypedArrayConstructor } from "@webaudiomodules/sdk";



/** 
 * A first-in-first-out buffer that can be used to communicate between a consumer and a producer.
 * The buffer is implemented as a ring buffer, with a fixed capacity.
 * The buffer can be create thread-safe, and can be used to communicate between a worker and the main thread.
 * 
 * It can be upload on the AudioWorklet alone because it depends on no non-type-erased imports.
 * 
 * @author Samuel DEMONT
 */
export class RingBuffer<T extends TypedArrayConstructor> {

    /**  The internal buffer used to store everything*/
    private _buffer: ArrayBuffer

    /** The reader pointer */
    private _read_ptr: Uint32Array

    /** The writer pointer */
    private _write_ptr: Uint32Array

    /** The storage for the elements */
    private _storage

    /** The capacity of the buffer, in number of elements */
    private _capacity: number

    /** The type of the elements stored in the buffer as a array constructor */
    private _type

    /**
     * Create a new Pipe buffer with a given internal buffer and type.
     * @param buffer The internal buffer used to store everything
     * @param type The type of the elements stored in the buffer as a array constructor
     */
    private constructor(buffer: ArrayBuffer, type: T) {
        const uintsize = Uint32Array.BYTES_PER_ELEMENT
        this._type = type;
        this._capacity = (buffer.byteLength - uintsize * 2) / type.BYTES_PER_ELEMENT;
        this._buffer = buffer;
        this._write_ptr = new Uint32Array(this._buffer, 0, 1);
        this._read_ptr = new Uint32Array(this._buffer, uintsize, 1);
        this._storage = new type(this._buffer, uintsize * 2, this._capacity);
    }

    private static getStorageForCapacity(capacity: number, type: TypedArrayConstructor) {
        return Uint32Array.BYTES_PER_ELEMENT * 2 + (capacity + 1) * type.BYTES_PER_ELEMENT;
    }

    /**
     * Create a new shared PipeBuffer with a given capacity and type.
     * It can be used to communicate between a worker and the main thread.
     * @param capacity The capacity of the buffer, in number of elements
     * @param type The type of the elements stored in the buffer as a array constructor
     * @returns The new PipeBuffer
     */
    public static createShared<T extends TypedArrayConstructor>(capacity: number, type: T) {
        return new RingBuffer<T>(
            new SharedArrayBuffer(RingBuffer.getStorageForCapacity(capacity, type)),
            type
        )
    }

    /**
     * Create a new non-shared PipeBuffer with a given capacity and type.
     * It cannot be used to communicate between a worker and the main thread.
     * @param capacity The capacity of the buffer, in number of elements
     * @param type The type of the elements stored in the buffer as a array constructor
     * @returns The new PipeBuffer
     */
    public static createLocal<T extends TypedArrayConstructor>(capacity: number, type: T) {
        return new RingBuffer<T>(
            new ArrayBuffer(RingBuffer.getStorageForCapacity(capacity, type)),
            type
        )
    }

    /**
     * Wrap a given buffer in a PipeBuffer.
     * Depending on the type of the buffer, it could be used to communicate between a worker and the main thread.
     * @param buffer The buffer to wrap
     * @param type The type of the elements stored in the buffer as a array constructor
     * @throws If the buffer is not large enough to store the pointers and the elements
     * @returns The new PipeBuffer
     */
    public static make<T extends TypedArrayConstructor>(buffer: ArrayBuffer, type: T) {
        if(buffer.byteLength < RingBuffer.getStorageForCapacity(1, type))throw Error("The buffer is not large enough to store the pointers and the elements")
        return new RingBuffer<T>(buffer, type)
    }


    /**
     * @return the type of the underlying ArrayBuffer for this RingBuffer. This allows implementing crude type checking.
     */
    get type() {
        return this._type.name;
    }

    /**
     * Push elements to the pipe buffer.
     * @param elements Elements to push to the queue.
     * @param offset If passed, a starting index in elements from which
     * the elements are read. If not passed, elements are read from index 0.
     * @param length If passed, the maximum number of elements to push.
     * If not passed, all elements in the input array are pushed.
     * @return the number of elements written to the queue.
     */
    push(elements: InstanceType<T>, offset = 0, length = elements.length-offset): number {
        const rd = Atomics.load(this._read_ptr, 0);
        const wr = Atomics.load(this._write_ptr, 0);

        if ((wr + 1) % this._capacity === rd) return 0; // The buffer is full

        const to_write = Math.min(this._available_write(rd, wr), length);
        const first_part = Math.min(this.capacity - wr, to_write);
        const second_part = to_write - first_part;

        RingBuffer._copy(elements, offset, this._storage, wr, first_part);
        RingBuffer._copy(elements, offset + first_part, this._storage, 0, second_part);

        // publish the enqueued data to the other side
        Atomics.store( this._write_ptr, 0, (wr + to_write) % this._capacity );

        return to_write;
    }

    /**
     * Read up to `elements.length` elements from the ring buffer.
     * Returns the number of elements read from the queue, they are placed at the
     * beginning of the array passed as parameter.
     * @param elements An array in which the elements read from the
     * queue will be written, starting at the beginning of the array.
     * @param  offset If passed, an index in elements in which the data is
     * written to. `elements.length - offset` must be greater or equal to
     * `length`.
     * @param  length If passed, the maximum number of elements to pop. If
     * not passed, up to elements.length are popped.
     * @return The number of elements read from the queue.
     */
    pop(elements: InstanceType<T>, offset = 0, length = elements.length-offset) {
        const rd = Atomics.load(this._read_ptr, 0);
        const wr = Atomics.load(this._write_ptr, 0);

        if (wr === rd) return 0; // The buffer is empty

        const len = length !== undefined ? length : elements.length;
        const to_read = Math.min(this._available_read(rd, wr), len);

        const first_part = Math.min(this._capacity - rd, to_read);
        const second_part = to_read - first_part;

        RingBuffer._copy(this._storage, rd, elements, offset, first_part);
        RingBuffer._copy(this._storage, 0, elements, offset + first_part, second_part);

        Atomics.store(this._read_ptr, 0, (rd + to_read) % this._capacity);

        return to_read;
    }

    /**
     * @return True if the ring buffer is empty false otherwise. This can be late
     * on the reader side: it can return true even if something has just been
     * pushed.
     */
    get isEmpty() {
        const rd = Atomics.load(this._read_ptr, 0)
        const wr = Atomics.load(this._write_ptr, 0)
        return wr === rd
    }

    /**
     * @return True if the ring buffer is full, false otherwise. This can be late
     * on the write side: it can return true when something has just been popped.
     */
    get isFull() {
        const rd = Atomics.load(this._read_ptr, 0);
        const wr = Atomics.load(this._write_ptr, 0);
        return (wr + 1) % this._capacity === rd;
    }

    /**
     * @return The usable capacity for the ring buffer: the number of elements
     * that can be stored.
     */
    get capacity() {
        return this._capacity - 1;
    }

    /**
     * @return The number of elements available for reading. This can be late, and
     * report less elements that is actually in the queue, when something has just
     * been enqueued.
     */
    get availableRead() {
        const rd = Atomics.load(this._read_ptr, 0);
        const wr = Atomics.load(this._write_ptr, 0);
        return this._available_read(rd, wr);
    }

    /**
     * @return The number of elements available for writing. This can be late, and
     * report less elements that is actually available for writing, when something
     * has just been dequeued.
     */
    get availableWrite() {
        const rd = Atomics.load(this._read_ptr, 0);
        const wr = Atomics.load(this._write_ptr, 0);
        return this._available_write(rd, wr);
    }


    // private methods //

    private _available_read(rd:number, wr:number) {
        return (wr + this._capacity - rd) % this._capacity;
    }

    private _available_write(rd:number, wr:number) {
        return this.capacity - this._available_read(rd, wr);
    }

    /**
     * Copy `size` elements from `input`, starting at offset `offset_input`, to
     * `output`, starting at offset `offset_output`.
     * @param input The array to copy from
     * @param offset_input The index at which to start the copy
     * @param output The array to copy to
     * @param offset_output The index at which to start copying the elements to
     * @param size The number of elements to copy
     * @private
     */
    private static _copy<T extends TypedArray>(input: T, offset_input: number, output: T, offset_output: number, size: number) {
        for (let i = 0; i < size; i++) {
            output[offset_output + i] = input[offset_input + i];
        }
    }
}