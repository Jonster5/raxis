/**
 * Class representing a 2 dimensional vector
 * @param {number} [x = 0]
 * @param {number} [y = 0]
 */
export declare class Vec2 {
    /** @property `X` component of a vector */
    x: number;
    /** @property `Y` component of a vector */
    y: number;
    constructor(x?: number, y?: number);
    /**
     * Creates a new vector from the given inputs
     */
    static from(v: Vec2 | number[] | {
        x: number;
        y: number;
    }): Vec2;
    /**
     * Creates a unit vector from a given angle
     */
    static fromAngle(angle: number): Vec2;
    /**
     * Creates a vector from polar coordinates
     */
    static fromPolar(r: number, angle: number): Vec2;
    /**
     * Creates a vector with each component randomized between -1 and 1
     */
    static random(): Vec2;
    /**
     * Adds the input vector or scalar to this vector
     */
    add(v: Vec2 | number): Vec2;
    /**
     * Creates a vector from two input vectors added together or an input vector with a scalar added to it
     */
    static add(a: Vec2, b: Vec2 | number): Vec2;
    /**
     * Subtracts the input vector or scalar from this vector
     */
    sub(v: Vec2 | number): Vec2;
    /**
     * Creates a vector from the first vector minus the second vector or the scalar
     */
    static sub(a: Vec2, b: Vec2 | number): Vec2;
    /**
     * multiplies this vector by the input vector or scalar
     */
    mul(v: Vec2 | number): Vec2;
    /**
     * Creates a vector from the first vector times the second vector or scalar
     */
    static mul(a: Vec2, b: Vec2 | number): Vec2;
    /**
     * Divides this vector by the input vector or scalar
     */
    div(v: Vec2 | number): Vec2;
    /**
     * Creates a vector from the first vector divided by the second vector or scalar
     */
    static div(a: Vec2, b: Vec2 | number): Vec2;
    /**
     * @returns the dot product of this vector and the input vector
     */
    dot(v: Vec2): number;
    /**
     * @property Same as the `X` component
     */
    get width(): number;
    set width(w: number);
    /**
     * @property Same as the `Y` component
     */
    get height(): number;
    set height(h: number);
    /**
     * Converts this vector to it's right normal
     */
    perpRight(): this;
    /**
     * Converts this vector to it's left normal
     */
    perpLeft(): this;
    /**
     * Converts this vector to it's unit vector
     */
    unit(): Vec2;
    /**
     * Creates a unit vector from the input vector
     */
    static unit(v: Vec2): Vec2;
    /**
     * @returns The angle of the vector
     */
    angle(): number;
    /**
     * @returns The angle of the input vector with respect to this vector
     */
    angleTo(v: Vec2): number;
    /**
     * Sets the angle of this vector
     */
    setAngle(angle: number): Vec2;
    /**
     * @returns the magnitude of this vector
     */
    mag(): number;
    /**
     * @returns the magnitude of this vector squared
     */
    magSq(): number;
    /**
     * Sets the magnitude of this vector to the input value
     */
    setMag(m: number): Vec2;
    /**
     * Sets this vector to the input values
     */
    set(x: number | [number, number] | {
        x: number;
        y: number;
    }, y?: number): Vec2;
    /**
     * Sets this vector to be a unit vector based on the input angle
     */
    setFromAngle(angle: number): Vec2;
    /**
     * Sets this vector from the input polar coordinates
     */
    setFromPolar(r: number, angle: number): Vec2;
    /**
     * Randomize this vector's components between -1 and 1
     */
    random(): Vec2;
    /**
     * @returns A clone of this vector
     */
    clone(): Vec2;
    /**
     * @returns This vector's components as an array
     */
    toArray(): [number, number];
    /**
     * @returns This vector's components in an object
     */
    toObject(): {
        x: number;
        y: number;
    };
    /**
     * @returns Serializes this vector as a string
     */
    toString(): string;
    /**
     * Creates a new vector from a serialized string
     */
    static fromString(s: string): Vec2;
    /**
     * Clamps this vector's components between input minimums and maximimums
     */
    clamp(min: Vec2 | number, max: Vec2 | number): Vec2;
    /**
     * Creates a new vector from the input vector that is clamped between the input minimums and maximums
     */
    static clamp(v: Vec2, min: Vec2 | number, max: Vec2 | number): Vec2;
    /**
     * Clamps the magnitude of this vector between the input minimum and maximum
     */
    clampMag(min: number, max: number): Vec2;
    /**
     * Creates a new vector from the input vector with a magnitude clamped between the input minimum and maximum
     */
    static clampMag(v: Vec2, min: number, max: number): Vec2;
    /**
     * Linearly interpolates this vector to the input vector by the input amount
     */
    lerp(v: Vec2, t: number): Vec2;
    /**
     * Creates a new vector from the first input vector that is linearly interpolated to the second vector by the input amount
     */
    static lerp(a: Vec2, b: Vec2, t: number): Vec2;
    /**
     * @returns Boolean indicating if the input vector is equal to this vector
     */
    equals(v: Vec2): boolean;
    /**
     * @returns Boolean indicating if the input vector is close to this vector within the input margins
     */
    closeTo(v: Vec2, margin: number): boolean;
    /**
     * @returns The distance from this vector to the input vector
     */
    distanceTo(v: Vec2): number;
    /**
     * @returns The distance from this vector to the input vector squared
     */
    distanceToSq(v: Vec2): number;
    /**
     * @returns The manhattan values of this vector
     */
    manhattan(): number;
    /**
     * @returns the manhattan distance between this vector and the input vector
     */
    manhattanDistanceTo(v: Vec2): number;
    /**
     * Rounds this vector to the nearest whole numbers
     */
    round(): Vec2;
    /**
     * Creates a vector from the input vector rounded to the nearest whole numbers
     */
    static round(v: Vec2): Vec2;
    /**
     * Rounds the values of this vector down
     */
    floor(): Vec2;
    /**
     * Creates a new vector from the input vector with the values rounded down
     */
    static floor(v: Vec2): Vec2;
    /**
     * Rounds the values of this vector up
     */
    ceil(): Vec2;
    /**
     * Creates a new vector from the input vector with the values rounded up
     */
    static ceil(v: Vec2): Vec2;
    /**
     * Rounds the values towards 0
     */
    roundToZero(): Vec2;
    /**
     * Creates a new Vector from the input vector with it's values rounded towards 0
     */
    static roundToZero(v: Vec2): Vec2;
    /**
     * Sets this vectors values to the smallest values between this vector and the input vector
     */
    min(v: Vec2): Vec2;
    /**
     * Creates a new vector with the smallest values from both input vectors
     */
    static min(a: Vec2, b: Vec2): Vec2;
    /**
     * Sets this vectors values to the largest values between this vector and the input vector
     */
    max(v: Vec2): Vec2;
    /**
     * Creates a new vector with the largest values from both input vectors
     */
    static max(a: Vec2, b: Vec2): Vec2;
    /**
     * Applies the input function to both components of this vector
     */
    map(fn: (v: number) => number): Vec2;
    /**
     * Creates a vector from the input vector with the input function applied to each component
     */
    static map(v: Vec2, fn: (v: number) => number): Vec2;
    /**
     * @returns Serialized string of this vector
     */
    serialize(): string;
    /**
     * Creates a vector from the input serialized string
     */
    static deserialize(str: string): Vec2;
    /**
     * Freezes this vector so it's values can no longer be change in any way
     */
    freeze(): Vec2;
    [Symbol.iterator](): Generator<number, void, unknown>;
}
