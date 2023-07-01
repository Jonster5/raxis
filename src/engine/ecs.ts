import { NumberAllocator } from 'number-allocator';
import { Entity } from './entity';
import { type QueryDef, type CompTypeMod, QueryHandler, QueryResults } from './query';
import { EventHandler, type ECSEvent, EventReader, type EventType, EventWriter } from './event';
import { TreeNode, type CompType, type Component } from './component';
import type { ResType, Resource } from './resource';
import type { AsyncSystem, System, SystemContext } from './system';
import type { ECSPlugin } from './plugin';

/**
 * Creates ECS instance
 */
export class ECS {
	private components: Map<CompType, Component[]>;
	private nodes: Map<number, TreeNode>;
	private allocator: NumberAllocator;
	private entities: Set<number>;

	private startupSystems: SystemContext[];
	private mainSystems: SystemContext[];
	private shutdownSystems: SystemContext[];

	private resources: Map<ResType, Resource>;

	private handlers: Map<EventType, EventHandler>;

	private queries: Map<QueryDef, QueryHandler>;

	private updater!: number | NodeJS.Timeout | null;
	private frameCount: number;

	private context: SystemContext;
	private defaultContext: SystemContext;

	private server: boolean;

	constructor() {
		this.components = new Map();
		this.allocator = new NumberAllocator(0, 4294967294);
		this.entities = new Set();
		this.nodes = new Map();

		this.startupSystems = [];
		this.mainSystems = [];
		this.shutdownSystems = [];

		this.resources = new Map();

		this.handlers = new Map();
		this.queries = new Map();

		this.updater = null;
		this.frameCount = 0;

		this.defaultContext = {
			executor: () => {},
			enabled: false,
			async: false,
			name: 'default',
			queries: new Map(),
			readers: new Map(),
			writers: new Map(),
			resources: new Map(),
		};

		this.context = this.defaultContext;

		this.server = typeof window === 'undefined';
	}

	/**
	 * Adds specified component type to the component registry.
	 * All components must be registered before they can be used.
	 * @param type Any component type
	 * @returns `this`
	 */
	addComponentType(type: CompType) {
		this.components.set(type, []);

		return this;
	}

	/**
	 * Adds all specified component types to the component registry.
	 * @param types Array of any component types
	 * @returns `this`
	 */
	addComponentTypes(...types: CompType[]) {
		types.forEach((c) => this.addComponentType(c));

		return this;
	}

	/**
	 * Adds specified event type to the event registry.
	 * All events must be registered before they can be used.
	 * @param type Any event type
	 * @returns `this`
	 */
	addEventType(type: EventType) {
		if (this.handlers.has(type)) {
			throw new Error(`Event type [${type.name}] already exists`);
		}

		const handler = new EventHandler(this, type);

		this.handlers.set(type, handler);

		return this;
	}

	/**
	 * Adds all specified event types to the event registry.
	 * @param types Array of any event types
	 * @returns `this`
	 */
	addEventTypes(...types: EventType[]) {
		types.forEach((e) => this.addEventType(e));

		return this;
	}

	/**
	 * Adds specified system to ECS as a `main` system
	 * All `main` systems run once per frame
	 * @param system A synchronous or asynchronous ECS system
	 * @returns `this`
	 */
	addMainSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.mainSystems.push({
			name,
			executor,
			async,
			enabled,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	/**
	 * Adds specified system to ECS as a `startup` system
	 * All `startup` systems run once when the ECS first starts up
	 * @param system A synchronous or asynchronous ECS system
	 * @returns `this`
	 */
	addStartupSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.startupSystems.push({
			name,
			executor,
			enabled,
			async,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	/**
	 * Adds specified system to ECS as a `shutdown` system
	 * All `shutdown` systems run once when the ECS shuts down
	 * @param system A synchronous or asynchronous ECS system
	 * @returns `this`
	 */
	addShutdownSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.shutdownSystems.push({
			name,
			executor,
			enabled,
			async,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	/**
	 * Adds all specified `main` systems
	 * @param systems Array of synchronous or asynchronous ECS systems
	 * @returns `this`
	 */
	addMainSystems(...systems: (System | AsyncSystem)[]) {
		systems.forEach((s) => this.addMainSystem(s));

		return this;
	}

	/**
	 * Adds all specified `startup` systems
	 * @param systems Array of synchronous or asynchronous ECS systems
	 * @returns `this`
	 */
	addStartupSystems(...systems: (System | AsyncSystem)[]) {
		systems.forEach((s) => this.addStartupSystem(s));

		return this;
	}

	/**
	 * Adds all specified `shutdown` systems
	 * @param systems Array of synchronous or asynchronous ECS systems
	 * @returns `this`
	 */
	addShutdownSystems(...systems: System[]) {
		systems.forEach((s) => this.addShutdownSystem(s));

		return this;
	}

	/**
	 * Toggles the specified system's enabled state. If the specified system does not exist on the ECS then an error will be thrown.
	 *
	 * Systems that have been disabled will not run.
	 * @param system synchronous or asynchronous system, or system name
	 * @returns `this`
	 */
	toggleSystem(system: System | AsyncSystem | string): this {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = !sys.enabled;
		}

		return this;
	}

	/**
	 * Enables the specified system. If the specified system does not exist on the ECS then an error will be thrown.
	 *
	 * Systems that have been disabled will not run.
	 * @param system synchronous or asynchronous system, or system name
	 * @returns `this`
	 */
	enableSystem(system: System | AsyncSystem | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = true;
		}
	}

	/**
	 * Disables the specified system. If the specified system does not exist on the ECS then an error will be thrown.
	 *
	 * Systems that have been disabled will not run.
	 * @param system synchronous or asynchronous system, or system name
	 * @returns `this`
	 */
	disableSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = false;
		}
	}

	/**
	 * Inserts the specified plugin into the ECS
	 * @returns `this`
	 */
	insertPlugin(plugin: ECSPlugin) {
		plugin(this);

		return this;
	}

	/**
	 * Inserts all specified plugins to the ECS
	 * @returns `this`
	 */
	insertPlugins(...plugins: ECSPlugin[]) {
		plugins.forEach((plugin) => this.insertPlugin(plugin));

		return this;
	}

	/**
	 * @returns Boolean indicating whether the specified component type has been registered to the ECS.
	 * @param type Any component type
	 */
	hasComponent(type: CompType) {
		return this.components.has(type);
	}

	/**
	 * @returns The current frame number.
	 */
	frame() {
		return this.frameCount;
	}

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
	spawn(...comps: Component[]) {
		const eid = this.allocator.alloc();

		if (eid === null) {
			throw new Error('Max Javascript Array size reached.');
		}

		this.entities.add(eid);
		this.nodes.set(eid, new TreeNode());

		const entity = new Entity(this, this.components, this.queries, this.nodes, eid);

		entity.insert(...comps);

		return entity;
	}

	/**
	 * Used to create `Entity` instances from raw entity IDs.
	 * @param eid Entity ID number
	 * @returns `Entity` instance associated with the specified ID
	 */
	entity(eid: number) {
		return new Entity(this, this.components, this.queries, this.nodes, eid);
	}

	/**
	 * Destroys the specified entity and it's components, as well all of it's children if it has any.
	 * @param eid ID number of the entity.
	 * @param force If true, then all data associated with the specified ID will be destroyed whether or not there is technically an entity associated with that ID. If false or omitted and the specified entity does not exist, then a warning will be emitted and the method will abort
	 * @returns `this`
	 */
	destroy(eid: number, force?: boolean) {
		if (!this.entities.has(eid)) {
			if (!force) {
				console.warn(`Entity [${eid}] does not exist`);
				return this;
			}
		}

		if (this.nodes.get(eid)!.children.length) {
			this.nodes.get(eid)!.children.forEach((c) => this.destroy(c));
		}

		this.entities.delete(eid);
		this.allocator.free(eid);

		this.nodes.get(eid)?.onDestroy(this, eid);

		for (let comps of this.components.values()) {
			if (comps[eid] && comps[eid].onDestroy) comps[eid].onDestroy!(this, eid);
		}

		for (let comps of this.components.values()) {
			delete comps[eid];
		}

		for (let handler of this.queries.values()) {
			if (handler.affectedBy(eid)) handler.removeEntity(eid);
		}

		return this;
	}

	/**
	 * @returns Boolean indicating whether the specified resource type exists in the ECS
	 */
	hasResource(res: ResType): boolean {
		return this.resources.has(res);
	}

	/**
	 * Dynamically inserts the specified resource into the ECS. There can only be one instance of any given resource type in the ECS
	 * @param res Any resource instance
	 * @param replace If true then if the is already an instance of the specified resource then it will be replaced with the new one. If false or omitted then an error will be thrown if there is already an instance of the specified resource in the ECS.
	 * @returns `this`
	 */
	insertResource(res: Resource, replace?: boolean) {
		if (this.resources.has(res.getType()) && !replace) {
			throw new Error(`Resource of type [${res.getName()}] already exists`);
		}

		this.resources.set(res.getType(), res);

		return this;
	}

	/**
	 * @returns Boolean indicating whether or not the specified resource type exists in the current system context
	 */
	hasLocalResource(res: ResType): boolean {
		return this.context.resources.has(res);
	}

	/**
	 * Dynamically inserts the specified resource in the current `system context`. There can only be one instance of any given resource type in the local `system context`, however different systems can have the same local resources because they are locally scoped.
	 * @param res Any resource instance
	 * @param replace If true then if the is already an instance of the specified resource then it will be replaced with the new one. If false or omitted then an error will be thrown if there is already an instance of the specified resource in the system context.
	 * @returns `this`
	 */
	insertLocalResource(res: Resource, replace?: boolean) {
		if (this.resources.has(res.getType()) && !replace) {
			throw new Error(`Resource of type [${res.getName()}] already exists on System(${this.context.name})`);
		}

		this.context.resources.set(res.getType(), res);

		return this;
	}

	/**
	 * Retrieves the resource instance of a specified resource type on the ECS. If the resource doesn't exist then a warning will be emitted.
	 * @param T Resource instance
	 * @param type Resource type
	 * @returns The resource instance or null if the resource doesn't exist
	 */
	getResource<T extends Resource>(type: ResType<T>): T | null {
		if (!this.resources.has(type)) {
			console.warn(`Resource of type [${type.name}] does not exist`);
			return null;
		}

		return this.resources.get(type) as T;
	}

	/**
	 * Retrieves a locally scoped resource of a specified type on the current system context. If the resource doesn't exist then a warning will be emitted.
	 * @param T Resource instance
	 * @param type Resource type
	 * @returns The resource instance or null if the resource doesn't exist.
	 */
	getLocalResource<T extends Resource>(type: ResType<T>): T | null {
		if (!this.context.resources.has(type)) {
			console.warn(`Resource of type [${type.name}] does not exist on System(${this.context.name})`);
			return null;
		}

		return this.context.resources.get(type);
	}

	/**
	 * Removes the specified resource from the ECS. If the specified resource does not exist then a warning will be emitted.
	 * @param type Resource type to be removed
	 * @returns Boolean indicating whether or not the removal was successful
	 */
	removeResource(type: ResType) {
		if (!this.resources.delete(type)) {
			console.warn(`Resource of type [${type.name}] can't be removed because it does not exist`);
			return false;
		}
		return true;
	}

	/**
	 * Removes the specified local resource from the current system context
	 * @param type Resource type to be removed
	 * @returns Boolean indicating whether or not the removal was successful
	 */
	removeLocalResource(type: ResType) {
		if (!this.context.resources.delete(type)) {
			console.warn(
				`Resource of type [${type.name}] can't be removed because it does not exist on System(${this.context.name})`
			);
			return false;
		}
		return true;
	}

	/**
	 * Retrieves the current system's own locally scoped event writer associated with the specified event type. If the event type has not been registered with the ECS an error will be thrown.
	 * @param type Event type
	 * @returns `EventWriter` associated with the specified event type
	 */
	getEventWriter<T extends ECSEvent>(type: EventType<T>): EventWriter<T> {
		if (!this.handlers.has(type)) {
			throw new Error(`Event type [${type.name}] has not been registered.`);
		}

		if (!this.context) {
			const handler = this.handlers.get(type)!;

			const w = new EventWriter(handler);

			handler.addWriter(w);

			return w;
		}

		if (!this.context.writers.has(type)) {
			const w = new EventWriter(this.handlers.get(type)!);

			this.handlers.get(type)!.addWriter(w);

			this.context.writers.set(type, w);
		}

		return this.context.writers.get(type)!;
	}

	/**
	 * Retrieves the current system's own locally scoped event reader associated with the specified event type. If the event type has not been registered with the ECS an error will be thrown.
	 * @param type Event type
	 * @returns `EventReader` associated with the specified event type
	 */
	getEventReader<T extends ECSEvent>(type: EventType<T>): EventReader<T> {
		if (!this.handlers.has(type)) {
			throw new Error(`Event type [${type.name}] has not been registered.`);
		}

		if (!this.context) {
			const r = new EventReader(this.handlers.get(type)!);

			this.handlers.get(type)!.addReader(r);

			return r;
		}

		if (!this.context.readers.has(type)) {
			const r = new EventReader(this.handlers.get(type)!);

			this.handlers.get(type)!.addReader(r);

			this.context.readers.set(type, r);
		}

		return this.context.readers.get(type)!;
	}

	/**
	 * Searches the ECS based on the specified component types and component type modifiers to curate any combination of components and entities in any order.
	 * The searches are not performance intensive and extremely optimized for use in the ECS.
	 * @param types Tuple array of all the component types being queried
	 * @param mods Array of component type modifiers to filter the results
	 * @returns Locally scoped `QueryResults` instance associated with the specified component types and component type mods
	 */
	query<
		T extends [...CompType[]] = CompType[],
		M extends [...CompTypeMod[]] = CompTypeMod[],
		Q extends QueryDef<T, M> = QueryDef<T, M>
	>(types: [...T], ...mods: [...M]): QueryResults<T, M> {
		const input: Q = { types, mods: mods ?? new Array<CompTypeMod>() } as unknown as Q;

		let query: Q | undefined = undefined;

		for (let [def, handler] of this.queries.entries()) {
			if (handler.match(input)) {
				query = def as Q;
				break;
			}
		}

		if (!query) {
			const q = new QueryHandler(this.components, input);

			this.queries.set(input, q);

			this.entities.forEach((eid) => q.validateEntity(eid));

			query = input;
		}

		if (!this.context.queries.has(query)) {
			const r = new QueryResults<T, M>(this, this.queries.get(query) as QueryHandler<T, M>);

			this.context.queries.set(query, r);
		}

		return this.context.queries.get(query) as QueryResults<T, M>;
	}

	/**
	 * Starts the ECS.
	 * This runs all the startup systems and subsequently begins the main loop
	 * @async
	 * @param frameTime Use to specify time in ms each frame should try to take. If omitted frames will run as fast as possible. Only works in servers.
	 * @returns `Promise<this>`
	 */
	async run(frameTime?: number) {
		await this.startup();
		await this.loop(frameTime ?? 0);

		return this;
	}

	/**
	 * Runs all startup systems
	 * @async
	 * @returns `Promise<this>`
	 */
	async startup() {
		for (let i = 0; i < this.startupSystems.length; i++) {
			if (!this.startupSystems[i].enabled) continue;

			this.context = this.startupSystems[i];

			await this.startupSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	private async loop(frameTime: number) {
		await this.update.call(this);

		if (this.server) {
			this.updater = setInterval(this.update.bind(this), frameTime);
		} else {
			this.updater = requestAnimationFrame(this.loop.bind(this));
		}
	}

	/**
	 * @returns Amount of entities there are
	 */
	entityCount() {
		return this.entities.size;
	}

	/**
	 * Runs all of the main systems once without looping
	 * @async
	 * @returns `Promise<this>`;
	 */
	async update() {
		for (let [, handler] of this.handlers) {
			handler.data.forEach((d, i) => {
				if (d.deadline === undefined || d.deadline >= this.frame()) return;

				handler.setReadersGen(d.gen);

				handler.data.splice(i, 1);
			});
		}

		this.frameCount++;

		for (let i = 0; i < this.mainSystems.length; i++) {
			if (!this.mainSystems[i].enabled) continue;

			this.context = this.mainSystems[i];

			await this.mainSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	/**
	 * Runs all shutdown systems
	 * @async
	 * @returns `Promise<this>`
	 */
	async shutdown() {
		for (let i = 0; i < this.shutdownSystems.length; i++) {
			if (!this.shutdownSystems[i].enabled) continue;

			this.context = this.shutdownSystems[i];

			await this.shutdownSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	/**
	 * Stops the main loop. If the main loop isn't running then an error will be thrown. Does not run shutdown systems
	 * @returns `this`
	 */
	stop() {
		if (!this.updater) {
			throw new Error(`ECS is not running`);
		}

		if (this.server) {
			clearInterval(this.updater as NodeJS.Timeout);
		} else {
			cancelAnimationFrame(this.updater as number);
		}

		this.updater = null;

		return this;
	}

	/**
	 * Destroys all component instances on the ECS
	 */
	wipe() {
		for (const eid of this.entities.values()) {
			this.destroy(eid);
		}
	}
}
