/**
 * @type Describes the constructor of a given resource type `T`
 */
export type ResType<T extends Resource = Resource> = new (...args: any[]) => T;
/**
 * Class which all ECS resources must inherit from.
 */
export declare class Resource {
    /**
     * @returns The name of this resources's type
     */
    getName(): string;
    /**
     * @returns the resource's type
     */
    getType(): ResType<this>;
}
