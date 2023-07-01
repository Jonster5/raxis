import { Entity } from './entity';
import { type QueryDef, type CompTypeMod, QueryResults } from './query';
import { type ECSEvent, EventReader, type EventType, EventWriter } from './event';
import { type CompType, type Component } from './component';
import type { ResType, Resource } from './resource';
import type { AsyncSystem, System } from './system';
import type { ECSPlugin } from './plugin';
/**
 * Creates ECS instance
 */
export declare class ECS {
    private components;
    private nodes;
    private allocator;
    private entities;
    private startupSystems;
    private mainSystems;
    private shutdownSystems;
    private resources;
    private handlers;
    private queries;
    private updater;
    private frameCount;
    private context;
    private defaultContext;
    constructor();
    /**
     * Adds specified component type to the component registry.
     * All components must be registered before they can be used.
     * @param type Any component type
     * @returns `this`
     */
    addComponentType(type: CompType): this;
    /**
     * Adds all specified component types to the component registry.
     * @param types Array of any component types
     * @returns `this`
     */
    addComponentTypes(...types: CompType[]): this;
    /**
     * Adds specified event type to the event registry.
     * All events must be registered before they can be used.
     * @param type Any event type
     * @returns `this`
     */
    addEventType(type: EventType): this;
    /**
     * Adds all specified event types to the event registry.
     * @param types Array of any event types
     * @returns `this`
     */
    addEventTypes(...types: EventType[]): this;
    /**
     * Adds specified system to ECS as a `main` system
     * All `main` systems run once per frame
     * @param system A synchronous or asynchronous ECS system
     * @returns `this`
     */
    addMainSystem(system: System | AsyncSystem): this;
    /**
     * Adds specified system to ECS as a `startup` system
     * All `startup` systems run once when the ECS first starts up
     * @param system A synchronous or asynchronous ECS system
     * @returns `this`
     */
    addStartupSystem(system: System | AsyncSystem): this;
    /**
     * Adds specified system to ECS as a `shutdown` system
     * All `shutdown` systems run once when the ECS shuts down
     * @param system A synchronous or asynchronous ECS system
     * @returns `this`
     */
    addShutdownSystem(system: System | AsyncSystem): this;
    /**
     * Adds all specified `main` systems
     * @param systems Array of synchronous or asynchronous ECS systems
     * @returns `this`
     */
    addMainSystems(...systems: (System | AsyncSystem)[]): this;
    /**
     * Adds all specified `startup` systems
     * @param systems Array of synchronous or asynchronous ECS systems
     * @returns `this`
     */
    addStartupSystems(...systems: (System | AsyncSystem)[]): this;
    /**
     * Adds all specified `shutdown` systems
     * @param systems Array of synchronous or asynchronous ECS systems
     * @returns `this`
     */
    addShutdownSystems(...systems: System[]): this;
    /**
     * Toggles the specified system's enabled state. If the specified system does not exist on the ECS then an error will be thrown.
     *
     * Systems that have been disabled will not run.
     * @param system synchronous or asynchronous system, or system name
     * @returns `this`
     */
    toggleSystem(system: System | AsyncSystem | string): this;
    /**
     * Enables the specified system. If the specified system does not exist on the ECS then an error will be thrown.
     *
     * Systems that have been disabled will not run.
     * @param system synchronous or asynchronous system, or system name
     * @returns `this`
     */
    enableSystem(system: System | AsyncSystem | string): void;
    /**
     * Disables the specified system. If the specified system does not exist on the ECS then an error will be thrown.
     *
     * Systems that have been disabled will not run.
     * @param system synchronous or asynchronous system, or system name
     * @returns `this`
     */
    disableSystem(system: System | string): void;
    /**
     * Inserts the specified plugin into the ECS
     * @returns `this`
     */
    insertPlugin(plugin: ECSPlugin): this;
    /**
     * Inserts all specified plugins to the ECS
     * @returns `this`
     */
    insertPlugins(...plugins: ECSPlugin[]): this;
    /**
     * @returns Boolean indicating whether the specified component type has been registered to the ECS.
     * @param type Any component type
     */
    hasComponent(type: CompType): boolean;
    /**
     * @returns The current frame number.
     */
    frame(): number;
    /**
     * Used to create a new entity with a unique ID number and with all specified components automatically inserted.
     *
     * @param comps Array of component instances to be inserted to the new entity. If omitted then the entity will be empty.
     * @returns `Entity` instance of the newly created entity
     *
     * @example
     * // Returns new Entity instance with no components inserted
     * ecs.spawn();
     *
     * // Returns new Entity instance with and instance of MyComp automatically inserted
     * ecs.spawn(new MyComp())
     */
    spawn(...comps: Component[]): Entity;
    /**
     * Used to create `Entity` instances from raw entity IDs.
     * @param eid Entity ID number
     * @returns `Entity` instance associated with the specified ID
     */
    entity(eid: number): Entity;
    /**
     * Destroys the specified entity and it's components, as well all of it's children if it has any.
     * @param eid ID number of the entity.
     * @param force If true, then all data associated with the specified ID will be destroyed whether or not there is technically an entity associated with that ID. If false or omitted and the specified entity does not exist, then a warning will be emitted and the method will abort
     * @returns `this`
     */
    destroy(eid: number, force?: boolean): this;
    /**
     * @returns Boolean indicating whether the specified resource type exists in the ECS
     */
    hasResource(res: ResType): boolean;
    /**
     * Dynamically inserts the specified resource into the ECS. There can only be one instance of any given resource type in the ECS
     * @param res Any resource instance
     * @param replace If true then if the is already an instance of the specified resource then it will be replaced with the new one. If false or omitted then an error will be thrown if there is already an instance of the specified resource in the ECS.
     * @returns `this`
     */
    insertResource(res: Resource, replace?: boolean): this;
    /**
     * @returns Boolean indicating whether or not the specified resource type exists in the current system context
     */
    hasLocalResource(res: ResType): boolean;
    /**
     * Dynamically inserts the specified resource in the current `system context`. There can only be one instance of any given resource type in the local `system context`, however different systems can have the same local resources because they are locally scoped.
     * @param res Any resource instance
     * @param replace If true then if the is already an instance of the specified resource then it will be replaced with the new one. If false or omitted then an error will be thrown if there is already an instance of the specified resource in the system context.
     * @returns `this`
     */
    insertLocalResource(res: Resource, replace?: boolean): this;
    /**
     * Retrieves the resource instance of a specified resource type on the ECS. If the resource doesn't exist then a warning will be emitted.
     * @param T Resource instance
     * @param type Resource type
     * @returns The resource instance or null if the resource doesn't exist
     */
    getResource<T extends Resource>(type: ResType<T>): T | null;
    /**
     * Retrieves a locally scoped resource of a specified type on the current system context. If the resource doesn't exist then a warning will be emitted.
     * @param T Resource instance
     * @param type Resource type
     * @returns The resource instance or null if the resource doesn't exist.
     */
    getLocalResource<T extends Resource>(type: ResType<T>): T | null;
    /**
     * Removes the specified resource from the ECS. If the specified resource does not exist then a warning will be emitted.
     * @param type Resource type to be removed
     * @returns Boolean indicating whether or not the removal was successful
     */
    removeResource(type: ResType): boolean;
    /**
     * Removes the specified local resource from the current system context
     * @param type Resource type to be removed
     * @returns Boolean indicating whether or not the removal was successful
     */
    removeLocalResource(type: ResType): boolean;
    /**
     * Retrieves the current system's own locally scoped event writer associated with the specified event type. If the event type has not been registered with the ECS an error will be thrown.
     * @param type Event type
     * @returns `EventWriter` associated with the specified event type
     */
    getEventWriter<T extends ECSEvent>(type: EventType<T>): EventWriter<T>;
    /**
     * Retrieves the current system's own locally scoped event reader associated with the specified event type. If the event type has not been registered with the ECS an error will be thrown.
     * @param type Event type
     * @returns `EventReader` associated with the specified event type
     */
    getEventReader<T extends ECSEvent>(type: EventType<T>): EventReader<T>;
    /**
     * Searches the ECS based on the specified component types and component type modifiers to curate any combination of components and entities in any order.
     * The searches are not performance intensive and extremely optimized for use in the ECS.
     * @param types Tuple array of all the component types being queried
     * @param mods Array of component type modifiers to filter the results
     * @returns Locally scoped `QueryResults` instance associated with the specified component types and component type mods
     */
    query<T extends [...CompType[]] = CompType[], M extends [...CompTypeMod[]] = CompTypeMod[], Q extends QueryDef<T, M> = QueryDef<T, M>>(types: [...T], ...mods: [...M]): QueryResults<T, M>;
    /**
     * Starts the ECS.
     * This runs all the startup systems and subsequently begins the main loop
     * @async
     * @returns `Promise<this>`
     */
    run(): Promise<this>;
    /**
     * Runs all startup systems
     * @async
     * @returns `Promise<this>`
     */
    startup(): Promise<this>;
    private loop;
    /**
     * @returns Amount of entities there are
     */
    entityCount(): number;
    /**
     * Runs all of the main systems once without looping
     * @async
     * @returns `Promise<this>`;
     */
    update(): Promise<this>;
    /**
     * Runs all shutdown systems
     * @async
     * @returns `Promise<this>`
     */
    shutdown(): Promise<this>;
    /**
     * Stops the main loop. If the main loop isn't running then an error will be thrown. Does not run shutdown systems
     * @returns `this`
     */
    stop(): this;
    /**
     * Destroys all component instances on the ECS
     */
    wipe(): void;
}
