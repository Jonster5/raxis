/**
 * Class representing a 2 dimensional vector
 * @param {number} [x = 0]
 * @param {number} [y = 0]
 */
export class Vec2 {
	/** @property `X` component of a vector */
	x: number;
	/** @property `Y` component of a vector */
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Creates a new vector from the given inputs
	 */
	static from(v: Vec2 | number[] | { x: number; y: number }): Vec2 {
		if (v instanceof Array) {
			return new Vec2(v[0], v[1]);
		} else {
			return new Vec2(v.x, v.y);
		}
	}

	/**
	 * Creates a unit vector from a given angle
	 */
	static fromAngle(angle: number): Vec2 {
		return new Vec2(Math.cos(angle % (2 * Math.PI)), Math.sin(angle % (2 * Math.PI)));
	}

	/**
	 * Creates a vector from polar coordinates
	 */
	static fromPolar(r: number, angle: number): Vec2 {
		return new Vec2(r * Math.cos(angle % (2 * Math.PI)), r * Math.sin(angle % (2 * Math.PI)));
	}

	/**
	 * Creates a vector with each component randomized between -1 and 1
	 */
	static random(): Vec2 {
		return new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1);
	}

	/**
	 * Adds the input vector or scalar to this vector
	 */
	add(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x += v;
			this.y += v;

			return this;
		} else {
			this.x += v.x;
			this.y += v.y;

			return this;
		}
	}

	/**
	 * Creates a vector from two input vectors added together or an input vector with a scalar added to it
	 */
	static add(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x + b, a.y + b);
		else return new Vec2(a.x + b.x, a.y + b.y);
	}

	/**
	 * Subtracts the input vector or scalar from this vector
	 */
	sub(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x -= v;
			this.y -= v;

			return this;
		} else {
			this.x -= v.x;
			this.y -= v.y;

			return this;
		}
	}

	/**
	 * Creates a vector from the first vector minus the second vector or the scalar
	 */
	static sub(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x - b, a.y - b);
		else return new Vec2(a.x - b.x, a.y - b.y);
	}

	/**
	 * multiplies this vector by the input vector or scalar
	 */
	mul(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x *= v;
			this.y *= v;

			return this;
		} else {
			this.x *= v.x;
			this.y *= v.y;

			return this;
		}
	}

	/**
	 * Creates a vector from the first vector times the second vector or scalar
	 */
	static mul(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x * b, a.y * b);
		else return new Vec2(a.x * b.x, a.y * b.y);
	}

	/**
	 * Divides this vector by the input vector or scalar
	 */
	div(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x /= v;
			this.y /= v;

			return this;
		} else {
			this.x /= v.x;
			this.y /= v.y;

			return this;
		}
	}

	/**
	 * Creates a vector from the first vector divided by the second vector or scalar
	 */
	static div(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x / b, a.y / b);
		else return new Vec2(a.x / b.x, a.y / b.y);
	}

	/**
	 * @returns the dot product of this vector and the input vector
	 */
	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y;
	}

	/**
	 * @property Same as the `X` component
	 */
	get width(): number {
		return this.x;
	}

	set width(w: number) {
		this.x = w;
	}

	/**
	 * @property Same as the `Y` component
	 */
	get height(): number {
		return this.y;
	}

	set height(h: number) {
		this.y = h;
	}

	/**
	 * Converts this vector to it's right normal
	 */
	perpRight() {
		const x = this.y;
		const y = -this.x;

		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Converts this vector to it's left normal
	 */
	perpLeft() {
		const x = -this.y;
		const y = this.x;

		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Converts this vector to it's unit vector
	 */
	unit(): Vec2 {
		const m = this.mag();

		if (m > 0) {
			this.x /= m;
			this.y /= m;
		}

		return this;
	}

	/**
	 * Creates a unit vector from the input vector
	 */
	static unit(v: Vec2): Vec2 {
		const m = v.mag();

		if (m > 0) {
			return new Vec2(v.x / m, v.y / m);
		}

		return new Vec2(0, 0);
	}

	/**
	 * @returns The angle of the vector
	 */
	angle(): number {
		return (2 * Math.PI + Math.atan2(this.y, this.x)) % (2 * Math.PI);
	}

	/**
	 * @returns The angle of the input vector with respect to this vector
	 */
	angleTo(v: Vec2): number {
		return (2 * Math.PI + Math.atan2(v.y - this.y, v.x - this.x)) % (2 * Math.PI);
	}

	/**
	 * Sets the angle of this vector
	 */
	setAngle(angle: number): Vec2 {
		const m = this.mag();

		this.x = m * Math.cos(angle);
		this.y = m * Math.sin(angle);

		return this;
	}

	/**
	 * @returns the magnitude of this vector
	 */
	mag(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	/**
	 * @returns the magnitude of this vector squared
	 */
	magSq(): number {
		return this.x * this.x + this.y * this.y;
	}

	/**
	 * Sets the magnitude of this vector to the input value
	 */
	setMag(m: number): Vec2 {
		const m2 = this.mag();

		if (m2 > 0) {
			this.x *= m / m2;
			this.y *= m / m2;
		}

		return this;
	}

	/**
	 * Sets this vector to the input values
	 */
	set(x: number | [number, number] | { x: number; y: number }, y?: number): Vec2 {
		if (x instanceof Array) {
			this.x = x[0];
			this.y = x[0];
		} else if (typeof x === 'object') {
			this.x = x.x;
			this.y = x.y;
		} else if (typeof x === 'number' && y !== undefined) {
			this.x = x;
			this.y = y;
		}

		return this;
	}

	/**
	 * Sets this vector to be a unit vector based on the input angle
	 */
	setFromAngle(angle: number): Vec2 {
		this.x = Math.cos(angle % (2 * Math.PI));
		this.y = Math.sin(angle % (2 * Math.PI));

		return this;
	}

	/**
	 * Sets this vector from the input polar coordinates
	 */
	setFromPolar(r: number, angle: number): Vec2 {
		this.x = r * Math.cos(angle % (2 * Math.PI));
		this.y = r * Math.sin(angle % (2 * Math.PI));

		return this;
	}

	/**
	 * Randomize this vector's components between -1 and 1
	 */
	random(): Vec2 {
		this.x = Math.random() * 2 - 1;
		this.y = Math.random() * 2 - 1;

		return this;
	}

	/**
	 * @returns A clone of this vector
	 */
	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	/**
	 * @returns This vector's components as an array
	 */
	toArray(): [number, number] {
		return [this.x, this.y];
	}

	/**
	 * @returns This vector's components in an object
	 */
	toObject(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	/**
	 * @returns Serializes this vector as a string
	 */
	toString(): string {
		return `Vec2(${this.x}, ${this.y})`;
	}

	/**
	 * Creates a new vector from a serialized string
	 */
	static fromString(s: string): Vec2 {
		const [x, y] = s.split(',');
		return new Vec2(parseFloat(x.slice(x.indexOf('(')! + 1)), parseFloat(y.slice(0, y.length - 1)));
	}

	/**
	 * Clamps this vector's components between input minimums and maximimums
	 */
	clamp(min: Vec2 | number, max: Vec2 | number): Vec2 {
		if (typeof min === 'number') {
			this.x = Math.max(min, this.x);
			this.y = Math.max(min, this.y);
		} else if (min instanceof Vec2) {
			this.x = Math.max(min.x, this.x);
			this.y = Math.max(min.y, this.y);
		}

		if (typeof max === 'number') {
			this.x = Math.min(max, this.x);
			this.y = Math.min(max, this.y);
		} else if (max instanceof Vec2) {
			this.x = Math.min(max.x, this.x);
			this.y = Math.min(max.y, this.y);
		}

		return this;
	}

	/**
	 * Creates a new vector from the input vector that is clamped between the input minimums and maximums
	 */
	static clamp(v: Vec2, min: Vec2 | number, max: Vec2 | number): Vec2 {
		const n = v.clone();

		if (typeof min === 'number') {
			n.x = Math.max(min, n.x);
			n.y = Math.max(min, n.y);
		} else if (min instanceof Vec2) {
			n.x = Math.max(min.x, n.x);
			n.y = Math.max(min.y, n.y);
		}

		if (typeof max === 'number') {
			n.x = Math.min(max, n.x);
			n.y = Math.min(max, n.y);
		} else if (max instanceof Vec2) {
			n.x = Math.min(max.x, n.x);
			n.y = Math.min(max.y, n.y);
		}

		return n;
	}

	/**
	 * Clamps the magnitude of this vector between the input minimum and maximum
	 */
	clampMag(min: number, max: number): Vec2 {
		const m = this.mag();

		if (m > max) {
			this.setMag(max);
		} else if (m < min) {
			this.setMag(min);
		}

		return this;
	}

	/**
	 * Creates a new vector from the input vector with a magnitude clamped between the input minimum and maximum
	 */
	static clampMag(v: Vec2, min: number, max: number): Vec2 {
		const m = v.mag();

		if (m > max) {
			return new Vec2((v.x * max) / m, (v.y * max) / m);
		} else if (m < min) {
			return new Vec2((v.x * min) / m, (v.y * min) / m);
		}

		return v;
	}

	/**
	 * Linearly interpolates this vector to the input vector by the input amount
	 */
	lerp(v: Vec2, t: number): Vec2 {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;

		return this;
	}

	/**
	 * Creates a new vector from the first input vector that is linearly interpolated to the second vector by the input amount
	 */
	static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
		return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
	}

	/**
	 * @returns Boolean indicating if the input vector is equal to this vector
	 */
	equals(v: Vec2): boolean {
		return this.x === v.x && this.y === v.y;
	}

	/**
	 * @returns Boolean indicating if the input vector is close to this vector within the input margins
	 */
	closeTo(v: Vec2, margin: number): boolean {
		return Math.abs(this.x - v.x) <= margin && Math.abs(this.y - v.y) <= margin;
	}

	/**
	 * @returns The distance from this vector to the input vector
	 */
	distanceTo(v: Vec2): number {
		const dx = this.x - v.x;
		const dy = this.y - v.y;

		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * @returns The distance from this vector to the input vector squared
	 */
	distanceToSq(v: Vec2): number {
		const dx = this.x - v.x;
		const dy = this.y - v.y;

		return dx * dx + dy * dy;
	}

	/**
	 * @returns The manhattan values of this vector
	 */
	manhattan(): number {
		return Math.abs(this.x) + Math.abs(this.y);
	}

	/**
	 * @returns the manhattan distance between this vector and the input vector
	 */
	manhattanDistanceTo(v: Vec2): number {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
	}

	/**
	 * Rounds this vector to the nearest whole numbers
	 */
	round(): Vec2 {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		return this;
	}

	/**
	 * Creates a vector from the input vector rounded to the nearest whole numbers
	 */
	static round(v: Vec2): Vec2 {
		return new Vec2(Math.round(v.x), Math.round(v.y));
	}

	/**
	 * Rounds the values of this vector down
	 */
	floor(): Vec2 {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);

		return this;
	}

	/**
	 * Creates a new vector from the input vector with the values rounded down
	 */
	static floor(v: Vec2): Vec2 {
		return new Vec2(Math.floor(v.x), Math.floor(v.y));
	}

	/**
	 * Rounds the values of this vector up
	 */
	ceil(): Vec2 {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);

		return this;
	}

	/**
	 * Creates a new vector from the input vector with the values rounded up
	 */
	static ceil(v: Vec2): Vec2 {
		return new Vec2(Math.ceil(v.x), Math.ceil(v.y));
	}

	/**
	 * Rounds the values towards 0
	 */
	roundToZero(): Vec2 {
		this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);

		return this;
	}

	/**
	 * Creates a new Vector from the input vector with it's values rounded towards 0
	 */
	static roundToZero(v: Vec2): Vec2 {
		return new Vec2(v.x < 0 ? Math.ceil(v.x) : Math.floor(v.x), v.y < 0 ? Math.ceil(v.y) : Math.floor(v.y));
	}

	/**
	 * Sets this vectors values to the smallest values between this vector and the input vector
	 */
	min(v: Vec2): Vec2 {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);

		return this;
	}

	/**
	 * Creates a new vector with the smallest values from both input vectors
	 */
	static min(a: Vec2, b: Vec2): Vec2 {
		return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}

	/**
	 * Sets this vectors values to the largest values between this vector and the input vector
	 */
	max(v: Vec2): Vec2 {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);

		return this;
	}

	/**
	 * Creates a new vector with the largest values from both input vectors
	 */
	static max(a: Vec2, b: Vec2): Vec2 {
		return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	/**
	 * Applies the input function to both components of this vector
	 */
	map(fn: (v: number) => number): Vec2 {
		this.x = fn(this.x);
		this.y = fn(this.y);

		return this;
	}

	/**
	 * Creates a vector from the input vector with the input function applied to each component
	 */
	static map(v: Vec2, fn: (v: number) => number): Vec2 {
		return new Vec2(fn(v.x), fn(v.y));
	}

	/**
	 * @returns Serialized string of this vector
	 */
	serialize() {
		return this.toString();
	}

	/**
	 * Creates a vector from the input serialized string
	 */
	static deserialize(str: string) {
		return Vec2.fromString(str);
	}

	/**
	 * Freezes this vector so it's values can no longer be change in any way
	 */
	freeze(): Vec2 {
		return Object.freeze(this);
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
	}

	[Symbol.toPrimitive](hint: string): string | number {
		if (hint === 'string') return this.toString();
		else if (hint === 'number') return this.mag();
		else return 'Vec2';
	}
}
