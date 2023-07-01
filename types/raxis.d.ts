declare module "query" {
    import type { Component, CompType } from "component";
    import type { ECS } from "ecs";
    import type { Entity } from "entity";
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
    export const With: <T extends Component>(c: CompType<T>) => CompTypeMod<"With", T>;
    /**
     * @returns An exclusionary component type modifier of component type `T`
     */
    export const Without: <T extends Component>(c: CompType<T>) => CompTypeMod<"Without", T>;
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
    export class QueryHandler<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> {
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
    export class QueryResults<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> {
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
}
declare module "entity" {
    import { TreeNode, type CompType, type Component } from "component";
    import { ECS } from "ecs";
    import type { CompTypeMod, QueryDef, QueryHandler } from "query";
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
    export class Entity {
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
}
declare module "event" {
    import type { ECS } from "ecs";
    /**
     * Class which all custom ECS event types must inherit from
     */
    export abstract class ECSEvent {
        /**
         * @returns The name of this event's type
         */
        getName(): string;
        /**
         * @returns this event instance's constructor
         */
        getType(): EventType<this>;
        clone(): ECSEvent;
    }
    /**
     * @type Describes the constructor of a given event type.
     *
     * @example
     * In order to use an event `T` in the ECS, you must first register it's `EventType<T>` in the ECS event registry.
     * ```
     * // example event
     * class MyCustomEvent extends ECSEvent { ... }
     *
     * // anywhere with a reference to the ECS you want to use
     * // usually where the ecs is created or in a plugin
     * ecs.addEventType(MyCustomEvent);
     * ```
     *
     * In that example, the value `MyCustomEvent` being passed into method is of type `EventType<MyCustomEvent>`
     */
    export type EventType<T extends ECSEvent = any> = new (...args: any[]) => T;
    /**
     * Class which handles event data collection and propogation for a specific custom event type in the ECS
     */
    export class EventHandler<T extends ECSEvent = any> {
        type: EventType<T>;
        ecs: ECS;
        data: {
            body: ECSEvent | null;
            gen: number;
            deadline: number;
        }[];
        gen: number;
        readers: EventReader<T>[];
        writers: EventWriter<T>[];
        constructor(ecs: ECS, type: EventType<T>);
        write(data?: T): void;
        addReader(reader: EventReader<T>): void;
        addWriter(writer: EventWriter<T>): void;
        setReadersGen(gen: number): void;
    }
    /**
     * Class which provides functionality for sending ECS events
     */
    export class EventWriter<T extends ECSEvent> {
        private handler;
        constructor(handler: EventHandler<T>);
        /**
         * Emits an event of type `T`
         *
         * @param data If data is omitted then the event will still be emittied, however it will carry no data and be recieved as `null` by event readers listening for this event type.
         */
        send(data?: T): void;
    }
    /**
     * Class which provides functionality for reading ECS events
     */
    export class EventReader<T extends ECSEvent> {
        private handler;
        private gen;
        constructor(handler: EventHandler<T>);
        /**
         * @returns boolean indicating whether there is at least one new unread event of type `T`
         */
        available(): boolean;
        /**
         * @returns boolean indicating if there are no unread events of type `T`
         */
        empty(): boolean;
        /**
         * When called this method will mark all events as read making any unhandled events will be innaccessable.
         * @returns An array containing all unread events or null if there are none available.
         */
        get(): (T | null)[] | null;
        /**
         * Marks all events as read, making them innaccessable
         */
        clear(): void;
    }
}
declare module "resource" {
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
        getName(): string;
        /**
         * @returns the resource's type
         */
        getType(): ResType<this>;
    }
}
declare module "system" {
    import type { ECS } from "ecs";
    import type { EventType, EventReader, EventWriter } from "event";
    import type { QueryDef, QueryResults } from "query";
    import type { ResType } from "resource";
    /**
     * @type Describes a synchronous ECS system
     */
    export type System = (ecs: ECS) => void;
    /**
     * @type Describes an asynchronous ECS system
     */
    export type AsyncSystem = (ecs: ECS) => Promise<void>;
    /**
     * @type Describes the context which a system runs in
     */
    export type SystemContext = {
        executor: System | AsyncSystem;
        async: boolean;
        name: string;
        enabled: boolean;
        resources: Map<ResType, any>;
        queries: Map<QueryDef, QueryResults>;
        readers: Map<EventType, EventReader<any>>;
        writers: Map<EventType, EventWriter<any>>;
    };
}
declare module "plugin" {
    import type { ECS } from "ecs";
    /**
     * @type Describes the definition of an ECS plugin
     */
    export type ECSPlugin = (ecs: ECS) => void;
}
declare module "ecs" {
    import { Entity } from "entity";
    import { type QueryDef, type CompTypeMod, QueryResults } from "query";
    import { type ECSEvent, EventReader, type EventType, EventWriter } from "event";
    import { type CompType, type Component } from "component";
    import type { ResType, Resource } from "resource";
    import type { AsyncSystem, System } from "system";
    import type { ECSPlugin } from "plugin";
    /**
     * Creates ECS instance
     */
    export class ECS {
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
}
declare module "component" {
    import type { ECS } from "ecs";
    /**
     * @type Describes the constructor of a given component type.
     *
     * @example In order to use a component `T` in the ECS, you must first register it's `CompType<T>` in the ECS component registry.
     * ```
     * // example component
     * class MyComp extends Component { ... }
     *
     * // anywhere with a reference to the ECS you want to use
     * // usually where the ecs is created or in a plugin
     * ecs.addComponentType(MyComp);
     * ```
     *
     * In that example, the value `MyComp` being passed into method is of type `CompType<MyComp>`
     */
    export type CompType<T extends Component = Component> = new (...args: any[]) => T;
    /**
     * The class that all ECS components must inherit from
     */
    export abstract class Component {
        /**
         * @returns The name of this component's type
         *
         * @example
         * class MyComp extends Component { ... }
         *
         * const foo = new MyComp();
         *
         * // returns 'MyComp'
         * foo.getName()
         *
         */
        getName(): string;
        /**
         * @returns this component's type
         *
         *
         * @example
         * class MyComp extends Component { ... }
         *
         * const foo = new MyComp();
         *
         * // returns MyComp
         * foo.getType()
         */
        getType(): CompType<this>;
        /**
         * @abstract Optional method that is called when the component is being deleted from an entity, or the entity it's a part of is being destroyed
         *
         * @param ecs A reference to the ECS.
         * @param eid This component's entity ID number.
         */
        onDestroy?(ecs: ECS, eid: number): void;
        /**
         * @returns A deep copy of this component. Can be overridden if this behavior isn't desired, for example if the component contains a reference to another object that the clone should maintain a reference to, rather than copying it.
         *
         * @example
         * class MyComp extends Component {
         * 	...
         *
         * 	clone() {
         * 		return new MyComp(this.foo, this.bar, ...);
         * 	}
         * }
         */
        clone(): Component;
        /**
         * @abstract Optional method that can be used to serialize a component's state in a predictable way.
         */
        serialize?(): string;
        /**
         * @abstract Optional method that will produce a new component based on an input string.
         *
         * @param str A serialized component, usually created by a component's `serialize` method.
         */
        static deserialize?(str: string): Component;
    }
    export class TreeNode {
        parent: number | null;
        children: number[];
        onDestroy(ecs: ECS, eid: number): void;
    }
}
declare module "plugins/assets" {
    import { ECS, Resource } from "index";
    export class Assets extends Resource {
        [key: string]: any;
    }
    export function loadImageFile(url: string): Promise<HTMLElement>;
    export function loadImages(...urls: string[]): Promise<HTMLElement[]>;
    export function loadJSONFile(url: string): Promise<any>;
    export function loadJSON(...urls: string[]): Promise<any[]>;
    export function loadSoundFile(url: string): Promise<AudioBuffer>;
    export function loadSounds(...urls: string[]): Promise<AudioBuffer[]>;
    export function AssetsPlugin(ecs: ECS): void;
}
declare module "plugins/audio/sound" {
    export class Sound {
        buffer: AudioBuffer;
        loop: boolean;
        startTime: number;
        startOffset: number;
        actx: AudioContext;
        soundNode: AudioBufferSourceNode;
        volumeNode: GainNode;
        panNode: StereoPannerNode;
        convolverNode: ConvolverNode;
        delayNode: DelayNode;
        feedbackNode: GainNode;
        filterNode: BiquadFilterNode;
        playing: boolean;
        playbackRate: number;
        randomPitch: boolean;
        reverb: boolean;
        reverbImpulse: AudioBuffer | null;
        echo: boolean;
        delay: number;
        feedback: number;
        filter: number;
        constructor(buffer: AudioBuffer, loop?: boolean, startTime?: number, startOffset?: number);
        play(): void;
        playFrom(t: number): void;
        pause(): number | undefined;
        restart(): void;
        setEcho(on: boolean, delay?: number, feedback?: number, filter?: number): void;
        setReverb(on: boolean, duration?: number, decay?: number, reverse?: boolean): void;
        get volume(): number;
        set volume(v: number);
        get pan(): number;
        set pan(v: number);
        onDestroy(): void;
    }
}
declare module "plugins/audio/soundeffect" {
    export class SoundEffect {
        actx: AudioContext;
        oscillator: OscillatorNode;
        wait: number;
        constructor(frequencyValue: number, attack?: number, decay?: number, type?: OscillatorType, volumeValue?: number, panValue?: number, wait?: number, pitchBendAmount?: number, reverse?: boolean, randomValue?: number, echo?: [number, number, number] | undefined, reverb?: [number, number, boolean] | undefined);
        play(): void;
        onDestroy(): void;
    }
}
declare module "plugins/audio/soundmanager" {
    import { Component, Entity } from "index";
    import { Sound } from "plugins/audio/sound";
    import { SoundEffect } from "plugins/audio/soundeffect";
    export class SoundManager extends Component {
        sounds: Map<string, Sound | SoundEffect>;
        constructor(sounds?: Map<string, Sound | SoundEffect>);
        onDestroy(): void;
    }
    export function addAudio<T extends Sound | SoundEffect>(entity: Entity, label: string, sound: T): T;
    export function getSound(entity: Entity, label: string): Sound | null;
    export function getSoundEffect(entity: Entity, label: string): SoundEffect | null;
    export function removeAudio(entity: Entity, label: string): void;
}
declare module "plugins/audio/index" {
    import type { ECS } from "index";
    export * from "plugins/audio/soundmanager";
    export * from "plugins/audio/sound";
    export * from "plugins/audio/soundeffect";
    export function AudioPlugin(ecs: ECS): void;
}
declare module "plugins/time" {
    import { ECS, Resource } from "index";
    export class Time extends Resource {
        elapsed: number;
        delta: number;
        last: number;
        speed: number;
        constructor(elapsed?: number, delta?: number, last?: number, speed?: number);
    }
    export function TimePlugin(ecs: ECS): void;
}
declare module "math/vec2" {
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
}
declare module "plugins/transform" {
    import { Component, ECS, Entity } from "index";
    import { Vec2 } from "math/vec2";
    export class Transform extends Component {
        size: Vec2;
        pos: Vec2;
        angle: number;
        vel: Vec2;
        avel: number;
        last: {
            pos: Vec2;
            angle: number;
        };
        constructor(size?: Vec2, pos?: Vec2, angle?: number, vel?: Vec2, avel?: number, last?: {
            pos: Vec2;
            angle: number;
        });
        clone(): Transform;
        serialize(): string;
        static deserialize(str: string): Transform;
    }
    export function globalPos(e: Entity): Vec2;
    export function globalAngle(e: Entity): number;
    export function globalVel(e: Entity): Vec2;
    export function globalAvel(e: Entity): number;
    export function TransformPlugin(ecs: ECS): void;
}
declare module "plugins/graphics/sprite" {
    import { Component } from "index";
    export class Sprite extends Component {
        type: 'rectangle' | 'ellipse' | 'image' | 'none';
        material: string | CanvasGradient | CanvasPattern | HTMLImageElement[] | undefined;
        visible: boolean;
        filter: string | undefined;
        alpha: number;
        borderColor: string;
        borderWidth: number;
        shifter: number | undefined;
        delay: number | undefined;
        ci: number;
        constructor(type: 'rectangle' | 'ellipse' | 'image' | 'none', material?: string | CanvasGradient | CanvasPattern | HTMLImageElement[] | undefined, visible?: boolean, filter?: string | undefined, alpha?: number, borderColor?: string, borderWidth?: number, shifter?: number | undefined, delay?: number | undefined, ci?: number);
        onDestroy(): void;
    }
    export class Root extends Component {
    }
    export function startImageAnimation(sprite: Sprite, delay: number): void;
    export function stopImageAnimation(sprite: Sprite): void;
    export function gotoImageFrame(sprite: Sprite, index: number): void;
}
declare module "plugins/graphics/canvas" {
    import { Component, ECS, Resource } from "index";
    import { Vec2 } from "math/vec2";
    export class Canvas extends Component {
        target: HTMLElement;
        element: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        aspect: number;
        size: Vec2;
        zoom: number;
        def: DOMMatrix;
        root: number | null;
        last: {
            zoom: number;
            tcw: number;
            tch: number;
        };
        constructor(target: HTMLElement, element: HTMLCanvasElement, ctx: CanvasRenderingContext2D, aspect: number, size: Vec2, zoom: number, def: DOMMatrix, root: number | null, last: {
            zoom: number;
            tcw: number;
            tch: number;
        });
    }
    export class CanvasSettings extends Resource {
        settings: {
            target: HTMLElement;
            width: number;
            rendering?: 'crisp-edges' | 'pixelated';
            extraStyling?: string;
        };
        constructor(settings: {
            target: HTMLElement;
            width: number;
            rendering?: 'crisp-edges' | 'pixelated';
            extraStyling?: string;
        });
    }
    export function setupCanvas(ecs: ECS): void;
    export function updateCanvasZoom(ecs: ECS): void;
    export function updateCanvasDimensions(ecs: ECS): void;
    export function renderCanvas(ecs: ECS): void;
}
declare module "plugins/graphics/index" {
    import { ECS } from "index";
    export function checkGraphicsCompatibility(ecs: ECS): void;
    export function GraphicsPlugin(ecs: ECS): void;
    export * from "plugins/graphics/canvas";
    export * from "plugins/graphics/sprite";
}
declare module "plugins/input/keytracker" {
    export class KeyTracker {
        keys: string[];
        isDown: boolean;
        isUp: boolean;
        private okd;
        private oku;
        private kdb;
        private kub;
        constructor(...keys: string[]);
        destroy(): void;
        private kd;
        private ku;
        onKeyDown(cb: () => void, thisArg?: any): void;
        onKeyUp(cb: () => void, thisArg?: any): void;
    }
}
declare module "plugins/input/pointertracker" {
    import { Vec2 } from "math/vec2";
    export class PointerTracker {
        leftIsDown: boolean;
        leftIsUp: boolean;
        rightIsDown: boolean;
        rightIsUp: boolean;
        midIsDown: boolean;
        midIsUp: boolean;
        pos: Vec2;
        last: Vec2;
        offset: Vec2;
        private oldc;
        private oluc;
        private ordc;
        private oruc;
        private omdc;
        private omuc;
        private md;
        private mu;
        private mm;
        constructor();
        private ctm;
        private onMouseDown;
        private onMouseUp;
        private onMouseMove;
        onLeftDown(cb: () => void, thisArg?: any): void;
        onLeftUp(cb: () => void, thisArg?: any): void;
        onRightDown(cb: () => void, thisArg?: any): void;
        onRightUp(cb: () => void, thisArg?: any): void;
        onMidDown(cb: () => void, thisArg?: any): void;
        onMidUp(cb: () => void, thisArg?: any): void;
    }
}
declare module "plugins/input/inputs" {
    import { ECS, Resource } from "index";
    import { KeyTracker } from "plugins/input/keytracker";
    import { PointerTracker } from "plugins/input/pointertracker";
    export class Inputs extends Resource {
        keymap: Map<string, KeyTracker>;
        pointer: PointerTracker;
        constructor(keymap?: Map<string, KeyTracker>, pointer?: PointerTracker);
    }
    export class KeysToTrack extends Resource {
        keys: string[];
        constructor(keys: string[]);
    }
    export function setupKeyTrackers(ecs: ECS): void;
    export function destroyKeyTrackers(ecs: ECS): void;
    export function updatePointerPos(ecs: ECS): void;
}
declare module "plugins/input/index" {
    import type { ECS } from "index";
    export * from "plugins/input/keytracker";
    export * from "plugins/input/pointertracker";
    export * from "plugins/input/inputs";
    export function InputPlugin(ecs: ECS): void;
}
declare module "math/easings" {
    /** @module easings */
    export function linear(x: number): number;
    export function SineIn(x: number): number;
    export function SineOut(x: number): number;
    export function SineInOut(x: number): number;
    export function QuadIn(x: number): number;
    export function QuadOut(x: number): number;
    export function QuadInOut(x: number): number;
    export function CubicIn(x: number): number;
    export function CubicOut(x: number): number;
    export function CubicInOut(x: number): number;
    export function QuartIn(x: number): number;
    export function QuartOut(x: number): number;
    export function QuartInOut(x: number): number;
    export function QuintIn(x: number): number;
    export function QuintOut(x: number): number;
    export function QuintInOut(x: number): number;
    export function ExpoIn(x: number): number;
    export function ExpoOut(x: number): number;
    export function ExpoInOut(x: number): number;
    export function CircIn(x: number): number;
    export function CircOut(x: number): number;
    export function CircInOut(x: number): number;
    export function BackIn(x: number): number;
    export function BackOut(x: number): number;
    export function BackInOut(x: number): number;
    export function ElasticIn(x: number): number;
    export function ElasticOut(x: number): number;
    export function ElasticInOut(x: number): number;
    export function BounceIn(x: number): number;
    export function BounceOut(x: number): number;
    export function BounceInOut(x: number): number;
}
declare module "math/index" {
    export * from "math/vec2";
    export * from "math/easings";
}
declare module "plugins/particle" {
    import { Component, ECS, Entity } from "index";
    export class Particle extends Component {
        tleft: number;
        constructor(tleft: number);
    }
    export class ParticleGenerator extends Component {
        amount: number;
        onGenerate: (p: Entity) => void;
        duration: number;
        delay: number;
        repeat: boolean;
        done: boolean;
        tleft: number;
        constructor(amount: number, onGenerate?: (p: Entity) => void, duration?: number, delay?: number, repeat?: boolean, done?: boolean, tleft?: number);
    }
    export function ParticlePlugin(ecs: ECS): void;
}
declare module "plugins/socket" {
    import { Component, type ECS, Entity } from "index";
    export type SocketData<T = any> = {
        type: string;
        body: T;
    };
    export class SocketManager extends Component {
        sockets: Map<string, Socket>;
        constructor(sockets?: Map<string, Socket>);
        onDestroy(): void;
    }
    export class Socket {
        connection: WebSocket;
        url: string;
        constructor(url: string);
        isOpen(): boolean;
        send(type: string, data: string): void;
        close(code?: number, reason?: string): void;
        onOpen(cb: (socket: this) => void): this;
        onMessage(cb: (data: SocketData, socket: this) => void): this;
        onClose(cb: (reason: string, clean: boolean, socket: this) => void): this;
        onerror(cb: (socket: this) => void): this;
    }
    export function addSocket(e: Entity, label: string, socket: Socket): Socket | undefined;
    export function getSocket(e: Entity, label: string): Socket | undefined;
    export function removeSocket(e: Entity, label: string): void;
    export function SocketPlugin(ecs: ECS): void;
}
declare module "plugins/tween/tweenbase" {
    export abstract class TweenBase {
        duration: number;
        protected _state: any;
        protected _value: any;
        ease: (x: number) => number;
        protected _onUpdate: Function;
        protected _onCompletion: Function;
        done: boolean;
        constructor(duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: Function);
        onUpdate(cb: Function): this;
        onCompletion(cb: Function): this;
        abstract update(dt: number): void;
        get state(): any;
        set state(v: any);
        get value(): any;
    }
}
declare module "plugins/tween/tween" {
    import { Component, ECS, Entity } from "index";
    import type { TweenBase } from "plugins/tween/tweenbase";
    export class TweenManager extends Component {
        tweens: Map<string, TweenBase>;
        constructor(tweens?: Map<string, TweenBase>);
    }
    export function updateTweens(ecs: ECS): void;
    export function addTween<T extends TweenBase>(entity: Entity, label: string, tween: T): T;
    export function tweenIsDone(entity: Entity, label: string): boolean;
    export function getTween(entity: Entity, label: string): TweenBase | null;
    export function removeTween(entity: Entity, label: string): void;
}
declare module "plugins/tween/basictween" {
    import { TweenBase } from "plugins/tween/tweenbase";
    export class BasicTween extends TweenBase {
        start: number;
        finish: number;
        distance: number;
        protected _state: number;
        protected _value: number;
        constructor(start: number, finish: number, duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (val: number) => void);
        update(dt: number): void;
    }
}
declare module "plugins/tween/activetween" {
    import { TweenBase } from "plugins/tween/index";
    import { BasicTween } from "plugins/tween/basictween";
    export class Tween<T extends {
        [key: string]: number;
    }> extends TweenBase {
        obj: T;
        target: T;
        fields: {
            name: string;
            tween: BasicTween;
        }[];
        protected _state: number;
        protected _onUpdate: (obj: T) => void;
        constructor(obj: any, to: T, duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (obj: T) => void);
        update(dt: number): void;
        get state(): number;
        set state(v: number);
        get value(): any;
    }
}
declare module "plugins/tween/dynamictween" {
    import { TweenBase } from "plugins/tween/tweenbase";
    export class DynamicTween<T extends {
        [key: string]: number;
    }, P extends [...string[]]> extends TweenBase {
        obj: T;
        start: {
            [key: string]: number;
        };
        target: T;
        fields: string[];
        protected _state: number;
        protected _onUpdate: (obj: T) => void;
        constructor(obj: T, target: T, props: [...P], duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (obj: T) => void);
        update(dt: number): void;
    }
}
declare module "plugins/tween/index" {
    import type { ECS } from "index";
    export * from "math/easings";
    export * from "plugins/tween/tween";
    export * from "plugins/tween/tweenbase";
    export * from "plugins/tween/activetween";
    export * from "plugins/tween/basictween";
    export * from "plugins/tween/dynamictween";
    export function TweenPlugin(ecs: ECS): void;
}
declare module "plugins/index" {
    import type { ECSPlugin } from "index";
    export const defaultPlugins: ECSPlugin[];
    export * from "plugins/audio/index";
    export * from "plugins/input/index";
    export * from "plugins/tween/index";
    export * from "plugins/assets";
    export * from "plugins/particle";
    export * from "plugins/socket";
    export * from "plugins/time";
    export * from "plugins/transform";
}
declare module "index" {
    export * from "ecs";
    export * from "component";
    export * from "entity";
    export * from "query";
    export * from "event";
    export * from "resource";
    export * from "system";
    export * from "plugin";
    export * from "plugins/index";
    export * from "math/index";
}
