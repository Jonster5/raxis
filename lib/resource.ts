/**
 * @type Describes the constructor of a given resource type `T`
 */
export type ResType<T extends Resource = Resource> = new (...args: any[]) => T;

/**
 * Class which all ECS resources must inherit from.
 */
export class Resource {
	/**
	 * @returns The name of this resources's type
	 */
	getName(): string {
		return this.constructor.name;
	}

	/**
	 * @returns the resource's type
	 */
	getType(): ResType<this> {
		return this.constructor as ResType<this>;
	}
}
