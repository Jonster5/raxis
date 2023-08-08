export type MemPoolOptions<T> = {
	size?: number;
	growBy?: number;
	sanitizer?: (obj: T) => void;
};

export class MemPool<T extends object> {
	private objects: T[];
	private ffi: number;

	sanitize?: (obj: T) => void;

	readonly growBy: number;

	constructor(public factory: () => T, options?: MemPoolOptions<T>) {
		let { size = 10, growBy = 64, sanitizer } = options ?? {};

		if (growBy < 0) growBy = 0;

		this.sanitize = sanitizer;
		this.growBy = growBy;

		this.objects = new Array(0);
		this.ffi = 0;

		this.grow(size);
	}

	grow(amount: number) {
		const offset = this.objects.length;
		this.objects.length = offset + amount;

		for (let i = offset; i < offset + amount; i++) {
			const obj = this.factory();

			Object.defineProperty(obj, '__memAddr__', { value: i, enumerable: false, writable: true });
			Object.defineProperty(obj, '__inUse__', { value: false, enumerable: false, writable: true });

			this.objects[i] = obj;
		}
	}

	reclaim() {
		this.objects.length = this.ffi;
	}

	use(): T {
		if (this.ffi >= this.objects.length) {
			if (this.growBy > 0) this.grow(this.growBy);
			else throw new Error('MemPool is at capacity');
		}
		const obj = this.objects[this.ffi++];
		(obj as { __inUse__: boolean }).__inUse__ = true;

		return obj;
	}

	free(obj: T): void {
		if (!Object.getOwnPropertyDescriptor(obj, '__memAddr__')) {
			throw new Error(`Object [${obj}] is not a member of this MemPool`);
		}

		if (!(obj as { __inUse__: boolean }).__inUse__) return;

		const addr = (obj as { __memAddr__: number }).__memAddr__;

		if (addr !== this.ffi - 1) {
			const dirty = this.objects[this.ffi - 1];
			const dAddr = (dirty as { __memAddr__: number }).__memAddr__;

			(dirty as { __memAddr__: number }).__memAddr__ = addr;
			(obj as { __memAddr__: number }).__memAddr__ = dAddr;

			this.objects[dAddr] = obj;
			this.objects[addr] = dirty;
		}

		if (this.sanitize) this.sanitize(obj);
		(obj as { __inUse__: boolean }).__inUse__ = false;
		this.ffi--;
	}

	get size() {
		return this.objects.length;
	}

	get inUse() {
		return this.ffi;
	}

	get available() {
		return this.objects.length - this.ffi;
	}
}
