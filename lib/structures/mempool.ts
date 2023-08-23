/**
 * Configuration options for the MemPool class.
 * @template T The type of objects stored in the memory pool.
 */
export type MemPoolOptions<T> = {
	size?: number;
	growBy?: number;
	sanitizer?: (obj: T) => void;
};

/**
 * A memory pool implementation in TypeScript.
 * Allows for efficient allocation and deallocation of objects by reusing previously allocated objects.
 * @template T The type of objects stored in the memory pool.
 */
export class MemPool<T extends object> {
	private objects: T[];
	private ffi: number;
	private metadata: WeakMap<T, [number, boolean]>;
	private sanitize?: (obj: T) => void;
	readonly growBy: number;

	/**
	 * Creates a new instance of MemPool.
	 * @param factory A function that creates a new object of type T.
	 * @param options Optional configuration options for the memory pool.
	 */
	constructor(public factory: () => T, options?: MemPoolOptions<T>) {
		let { size = 10, growBy = 64, sanitizer } = options ?? {};

		if (size < 0) {
			throw new Error('Size cannot be negative');
		}
		if (growBy < 0) {
			growBy = 0;
		}

		this.sanitize = sanitizer;
		this.growBy = growBy;

		this.objects = new Array(0);
		this.ffi = 0;

		this.metadata = new WeakMap();

		this.grow(size);
	}

	/**
	 * Increases the size of the memory pool by the specified amount.
	 * @param amount The number of objects to add to the memory pool.
	 */
	grow(amount: number) {
		if (amount < 0) {
			throw new Error('Amount must be a non-negative value');
		}
		const offset = this.objects.length;
		this.objects.length = offset + amount;

		for (let i = offset; i < offset + amount; i++) {
			const obj = this.factory();

			this.metadata.set(obj, [i, false]);

			this.objects[i] = obj;
		}
	}

	/**
	 * Reclaims unused memory by reducing the size of the memory pool to the current usage.
	 */
	reclaim() {
		this.objects.length = this.ffi;
	}

	/**
	 * Allocates an object from the memory pool.
	 * @returns The allocated object.
	 * @throws {Error} If the memory pool is at capacity and cannot grow.
	 */
	use(): T {
		if (this.ffi >= this.objects.length) {
			if (this.growBy > 0) {
				this.grow(this.growBy);
			} else {
				throw new Error('MemPool is at capacity');
			}
		}
		const obj = this.objects[this.ffi++];
		this.metadata.get(obj)![1] = true;

		return obj;
	}

	/**
	 * Frees an object and returns it to the memory pool.
	 * @param obj The object to free.
	 * @returns True if the object was successfully freed, false otherwise.
	 */
	free(obj: T): boolean {
		const omd = this.metadata.get(obj);

		if (!omd) {
			return false;
		}

		const addr = omd[0];

		if (addr !== this.ffi - 1) {
			const dirty = this.objects[this.ffi - 1];
			const dmd = this.metadata.get(dirty)!;
			const dAddr = dmd[0];

			dmd[0] = addr;
			omd[0] = dAddr;

			this.objects[dAddr] = obj;
			this.objects[addr] = dirty;
		}

		if (this.sanitize) {
			this.sanitize(obj);
		}
		omd[1] = false;
		this.ffi--;

		return true;
	}

	/**
	 * Gets the size of the memory pool.
	 */
	get size() {
		return this.objects.length;
	}

	/**
	 * Gets the number of objects in use.
	 */
	get inUse() {
		return this.ffi;
	}

	/**
	 * Gets the number of available objects.
	 */
	get available() {
		return this.objects.length - this.ffi;
	}
}
