import { TreeNode, type CompType, type Component } from './component';
import { ECS } from './ecs';
import type { CompTypeMod, QueryDef, QueryHandler } from './query';
/**
 * Class that provides functionality for manipulating entities.
 *
 * You should NOT directly instantiate `Entity`, In order to gain access to an Entity from an entity ID number, use the following ECS method
 *
 * ```
 * // eid is is your entity ID number
 * const myEntity = ecs.entity(eid);
 * ```
 */
export declare class Entity {
    private readonly eid;
    private isValid;
    private _ecs;
    private compRef;
    private queries;
    private node;
    constructor(ecs: ECS, compRef: Map<CompType, Component[]>, queries: Map<QueryDef, QueryHandler>, nodeRef: Map<number, TreeNode>, eid: number);
    /**
     * @returns boolean indicating whether there is a component of the specified type associated with this entity
     */
    has(type: CompType): boolean;
    /**
     * Inserts component instances into this entity
     *
     * @returns A reference to this entity to allow for method chaining
     *
     * @example
     *
     * myEntity.insert(new myComp1(), new myComp2());
     */
    insert(...comps: Component[]): this;
    /**
     * @returns The component of the specified type on this entity or null if it doesn't exist
     *
     * @example
     * // returns an instance of MyComp
     * myEntity.get(MyComp);
     */
    get<T extends Component>(type: CompType<T>): T | null;
    /**
     * A reference to the ECS
     * @readonly
     */
    get ecs(): ECS;
    /**
     * Deletes components of specified types from this entity
     *
     * @example
     * const myEntity = ecs.spawn(new MyComp());
     *
     * // Returns true
     * myEntity.has(MyComp);
     *
     * myEntity.delete(MyComp);
     *
     * // Returns false
     * myEntity.has(MyComp);
     *
     * @returns A reference to this entity to allow for method chaining
     */
    delete(...types: CompType[]): this;
    /**
     * Destroys this entity. Same as calling `ecs.destroy(myEntity.id())`
     */
    destroy(): void;
    /**
     * @returns This entity's ID number
     */
    id(): number;
    /**
     * @returns This ID number of the entity's parent or `null` if it doesn't exist
     *
     * @param newParant If specified, then this entity's parent will be changed to the new ID or removed if `null`
     */
    parent(newParent?: number | null): number | null;
    /**
     * @returns An array containing the entity IDs of all of this entity's children that meet the component type modifiers specified. If no modifiers are specified then it will return all of this entity's children.
     */
    children(...mods: CompTypeMod[]): number[];
    /**
     * Sets the specified entity to be a child of this entity. The child entity's parent will also be altered to reflect the new relationship.
     * If the specified entity is already a child of this entity then the method will quietly return.
     *
     * @param child Entity instance or entity ID number
     * @returns A reference to this entity to allow for method chaining
     */
    addChild(child: Entity | number): this;
    /**
     * Calls `addChild` on all input entities
     * @returns A reference to this entity to allow for method chaining
     */
    addChildren(...children: (Entity | number)[]): this;
    /**
     * The specified entity will stop being a child of this entity and the specified child entity's parent will be set to null.
     * If the specified entity is not a child of this entity then the method will quietly return.
     *
     * @param child Entity instance or entity ID number
     * @returns A reference to this entity to allow for method chaining
     */
    removeChild(child: Entity | number): this;
    removeChildren(...children: (Entity | number)[]): this;
}
