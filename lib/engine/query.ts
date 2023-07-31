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
export const With = <T extends Component>(c: CompType<T>): CompTypeMod<'With', T> => {
	return () => ['With', c];
};

/**
 * @returns An exclusionary component type modifier of component type `T`
 */
export const Without = <T extends Component>(c: CompType<T>): CompTypeMod<'Without', T> => {
	return () => ['Without', c];
};

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
export class QueryHandler<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	def: QueryDef<T, M>;

	private compRef: Map<CompType, Component[]>;

	components: Map<CompType, Component[]>;
	entities: Set<number>;

	results: QueryResults<T, M>[];

	constructor(compRef: Map<CompType, Component[]>, def: QueryDef<T, M>) {
		this.def = def;

		this.compRef = compRef;

		this.results = [];

		this.components = new Map();

		this.def.types.forEach((t) => this.components.set(t, []));

		this.entities = new Set();
	}

	affectedBy(type: CompType | number): boolean {
		if (typeof type === 'number') {
			return this.entities.has(type);
		} else {
			return this.def.types.includes(type) || this.def.mods.map((m) => m()[1]).includes(type);
		}
	}

	validateEntity(eid: number) {
		if (this.def.mods.length > 0) {
			for (let mod of this.def.mods) {
				const [type, comp] = mod();

				if (type === 'With') {
					if (this.compRef.get(comp)![eid] === undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				} else {
					if (this.compRef.get(comp)![eid] !== undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				}
			}
		}

		if (this.def.types.length > 0) {
			for (let type of this.def.types) {
				if (this.compRef.get(type)![eid] !== undefined) continue;

				if (this.entities.has(eid)) this.removeEntity(eid);
				return false;
			}
		}

		if (!this.entities.has(eid)) this.addEntity(eid);
		return true;
	}

	replace(eid: number, comp: Component) {
		this.components.get(comp.getType())![eid] = comp;
	}

	addEntity(eid: number) {
		this.entities.add(eid);

		for (let type of this.def.types) {
			this.components.get(type)![eid] = this.compRef.get(type)![eid];
		}
	}

	removeEntity(eid: number) {
		this.entities.delete(eid);

		for (let type of this.def.types) {
			delete this.components.get(type)![eid];
		}
	}

	match(query: QueryDef) {
		if (this.def.types.length !== query.types.length) return false;

		for (let i = 0; i < this.def.types.length; i++) {
			if (this.def.types[i] !== query.types[i]) return false;
		}

		if (this.def.mods.length !== query.mods.length) return false;

		if (this.def.mods.length > 0) {
			for (let m1 of this.def.mods) {
				if (query.mods.every((m2) => m1()[0] !== m2()[0] || m1()[1] !== m2()[1])) return false;
			}
		}

		return true;
	}

	toString() {
		return `{${this.def.types.map((t) => t.name).join(', ')}}|{${this.def.mods
			.map((m) => `${m()[0]}(${m()[1].name})`)
			.join(', ')}}`;
	}

	addResult(q: QueryResults<T, M>) {
		this.results.push(q);
	}
}

/**
 * Class which provides functionality for accessing query search results
 */
export class QueryResults<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	private handler: QueryHandler<T, M>;
	private ecs: ECS;

	constructor(ecs: ECS, handler: QueryHandler<T, M>) {
		this.handler = handler;
		this.ecs = ecs;
		this.handler.addResult(this);
	}

	/**
	 * @returns Amount of entities contained in this query
	 */
	size() {
		return this.handler.entities.size;
	}

	/**
	 * @returns Boolean indicating whether this query has no entities
	 */
	empty() {
		return this.handler.entities.size < 1;
	}

	/**
	 * @returns Array where each element is a tuple array containing the queried components in their specified order with the optional callback function applied to each tuple of components. If the query contains no entities then an empty array will be return
	 *
	 * @param cb Callback function which is applied to each element of the outer array. If omitted then the array will be returned as is
	 */
	results<R = ExtractCompList<T>>(cb?: (v: ExtractCompList<T>) => R): R[] {
		let ret: ExtractCompList<T>[] = [];

		for (let eid of this.handler.entities.values()) {
			let out = [] as ExtractCompList<T>;
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			ret.push(out as ExtractCompList<T>);
		}

		if (cb) return ret.map(cb);
		else return ret as R[];
	}

	/**
	 * Only use if the query is intended to only ever have a single entity.
	 * @returns Tuple array containing the queried components of the only entity in the query. If there is more than entity in the query then only the first entity's components will be returned and a warning will be emitted. If the query is empty then the method will return `null`
	 */
	single(): ExtractCompList<T> | null {
		if (this.handler.entities.size > 1) {
			console.warn(
				`Only the components of the first entity out of [${this.handler.entities.size}] are being returned. If there are multiple entities in this query considering using results() instead.`
			);
		}

		for (let eid of this.handler.entities.values()) {
			let out = [] as ExtractCompList<T>;
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			return out as ExtractCompList<T>;
		}

		return null;
	}

	/**
	 * @returns Array of entity IDs contained in the query. If the query has no entities then an empty array will be returned
	 */
	entities(): number[] {
		return Array.from(this.handler.entities);
	}

	/**
	 * @returns `Entity` instance of the only entity in the query. If there is more than one entity in the query then only the first one will be returned and a warning will be emitted. If the query is empty then null will be returned
	 */
	entity(): Entity | null {
		if (this.handler.entities.size > 1) {
			console.warn(
				`Only the first entity out of [${this.handler.entities.size}] are being returned. If there are multiple entities in this query considering using entities() instead.`
			);
		}

		for (let eid of this.handler.entities.values()) {
			return this.ecs.entity(eid);
		}

		return null;
	}
}
