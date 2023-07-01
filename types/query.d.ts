import type { Component, CompType } from './component';
import type { ECS } from './ecs';
import type { Entity } from './entity';
/**
 * @type Describes a component type modifier for filtering entities and components in queries and other searches
 */
export type CompTypeMod<T extends ModType = ModType, C extends Component = Component> = () => [T, CompType<C>];
/**
 * @type Used for determing whether a component type modifier is inclusionary or exclusionary
 */
export type ModType = 'With' | 'Without';
/**
 * @returns An inclusionary component type modifier of component type `T`
 */
export declare const With: <T extends Component>(c: CompType<T>) => CompTypeMod<"With", T>;
/**
 * @returns An exclusionary component type modifier of component type `T`
 */
export declare const Without: <T extends Component>(c: CompType<T>) => CompTypeMod<"Without", T>;
/**
 * @type Infers component types from an unpredictable tuple array of component types
 */
export type ExtractCompList<T extends CompType<Component>[]> = {
    [K in keyof T]: T[K] extends CompType<infer C> ? C : never;
};
/**
 * @type Describes the search parameters of an ECS component query. Used internally to compare against existing queries and create new ones.
 */
export type QueryDef<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> = {
    types: T;
    mods: M;
};
/**
 * Class which handles entity validation for it's unique query definition
 */
export declare class QueryHandler<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> {
    def: QueryDef<T, M>;
    private compRef;
    components: Map<CompType, Component[]>;
    entities: Set<number>;
    results: QueryResults<T, M>[];
    constructor(compRef: Map<CompType, Component[]>, def: QueryDef<T, M>);
    affectedBy(type: CompType | number): boolean;
    validateEntity(eid: number): boolean;
    addEntity(eid: number): void;
    removeEntity(eid: number): void;
    match(query: QueryDef): boolean;
    toString(): string;
    addResult(q: QueryResults<T, M>): void;
}
/**
 * Class which provides functionality for accessing query search results
 */
export declare class QueryResults<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> {
    private handler;
    private ecs;
    constructor(ecs: ECS, handler: QueryHandler<T, M>);
    /**
     * @returns Amount of entities contained in this query
     */
    size(): number;
    /**
     * @returns Boolean indicating whether this query has no entities
     */
    empty(): boolean;
    /**
     * @returns Array where each element is a tuple array containing the queried components in their specified order with the optional callback function applied to each tuple of components. If the query contains no entities then an empty array will be return
     *
     * @param cb Callback function which is applied to each element of the outer array. If omitted then the array will be returned as is
     */
    results<R = ExtractCompList<T>>(cb?: (v: ExtractCompList<T>) => R): R[];
    /**
     * Only use if the query is intended to only ever have a single entity.
     * @returns Tuple array containing the queried components of the only entity in the query. If there is more than entity in the query then only the first entity's components will be returned and a warning will be emitted. If the query is empty then the method will return `null`
     */
    single(): ExtractCompList<T> | null;
    /**
     * @returns Array of entity IDs contained in the query. If the query has no entities then an empty array will be returned
     */
    entities(): number[];
    /**
     * @returns `Entity` instance of the only entity in the query. If there is more than one entity in the query then only the first one will be returned and a warning will be emitted. If the query is empty then null will be returned
     */
    entity(): Entity | null;
}
