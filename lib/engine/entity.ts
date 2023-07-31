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
export class Entity {
	private readonly eid: number;
	private isValid: boolean;
	private _ecs: ECS;
	private compRef: Map<CompType, Component[]>;
	private queries: Map<QueryDef, QueryHandler>;
	private node: TreeNode;

	constructor(
		ecs: ECS,
		compRef: Map<CompType, Component[]>,
		queries: Map<QueryDef, QueryHandler>,
		nodeRef: Map<number, TreeNode>,
		eid: number
	) {
		this._ecs = ecs;
		this.compRef = compRef;
		this.queries = queries;
		this.eid = eid;
		this.isValid = true;

		this.node = nodeRef.get(this.eid)!;
	}

	/**
	 * @returns boolean indicating whether there is a component of the specified type associated with this entity
	 */
	has(type: CompType): boolean {
		if (!this.compRef.has(type)) {
			throw new Error(`The component type [${type.name}] is not registered`);
		}

		if (this.compRef.get(type)![this.eid] !== undefined) return true;
		return false;
	}

	/**
	 * Inserts component instances into this entity
	 *
	 * @returns A reference to this entity to allow for method chaining
	 *
	 * @example
	 *
	 * myEntity.insert(new myComp1(), new myComp2());
	 */
	insert(...comps: Component[]): this {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		comps.forEach((comp) => {
			const type = comp.getType();

			if (!this.compRef.has(type)) {
				throw new Error(`The component type [${comp.getName()}] is not registered`);
			}

			if (this.compRef.get(type)![this.eid] !== undefined) {
				throw new Error(`There is already an instance of [${comp.getName()}] on this entity`);
			}

			this.compRef.get(type)![this.eid] = comp;
		});

		comps.forEach((comp) => {
			const type = comp.getType();

			for (let handler of this.queries.values()) {
				if (!handler.affectedBy(type)) continue;

				handler.validateEntity(this.eid);
			}
		});

		return this;
	}

	/**
	 * Replaces the existing component of the type inputted with the input component
	 *
	 * @param comp The component you which to replace with
	 */
	replace(comp: Component) {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		if (!this.compRef.has(comp.getType())) {
			throw new Error(`The component type [${comp.getName()}] is not registered`);
		}

		this.compRef.get(comp.getType())![this.eid] = comp;

		for (let handler of this.queries.values()) {
			if (!handler.affectedBy(comp.getType())) continue;

			handler.replace(this.eid, comp);
		}
	}

	/**
	 * @returns The component of the specified type on this entity or null if it doesn't exist
	 *
	 * @example
	 * // returns an instance of MyComp
	 * myEntity.get(MyComp);
	 */
	get<T extends Component>(type: CompType<T>): T | null {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		if (!this.compRef.has(type)) {
			throw new Error(`The component type [${type.name}] is not registered`);
		}

		return this.compRef.get(type)![this.eid] as T;
	}

	/**
	 * A reference to the ECS
	 * @readonly
	 */
	get ecs(): ECS {
		return this._ecs;
	}

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
	delete(...types: CompType[]): this {
		if (!this.isValid) {
			throw new Error(`Entities cannot be modified after being destroyed`);
		}

		types.forEach((type) => {
			if (!this.compRef.has(type)) {
				throw new Error(`Component Type [${type.name}] is not registered`);
			}

			const comp = this.compRef.get(type)![this.eid];

			if (comp && comp.onDestroy) {
				comp.onDestroy(this._ecs, this.eid);
			}

			delete this.compRef.get(type)![this.eid];
		});

		types.forEach((type) => {
			for (let handler of this.queries.values()) {
				if (!handler.affectedBy(type)) continue;

				handler.validateEntity(this.eid);
			}
		});

		return this;
	}

	/**
	 * Destroys this entity. Same as calling `ecs.destroy(myEntity.id())`
	 */
	destroy(): void {
		this._ecs.destroy(this.eid);
		this.isValid = false;
	}

	/**
	 * @returns This entity's ID number
	 */
	id(): number {
		return this.eid;
	}

	/**
	 * @returns This ID number of the entity's parent or `null` if it doesn't exist
	 *
	 * @param newParant If specified, then this entity's parent will be changed to the new ID or removed if `null`
	 */
	parent(newParent?: number | null): number | null {
		if (newParent === undefined) return this.node.parent;
		if (newParent === this.node.parent) return this.node.parent;

		if (typeof this.node.parent === 'number') {
			this.ecs.entity(this.node.parent).removeChild(this.eid);
		} else {
			this.ecs.removeRoot(this.eid);
		}

		if (typeof newParent === 'number') {
			this.ecs.entity(newParent).addChild(this);
		} else {
			this.ecs.addRoot(this.eid);
		}

		this.node.parent = newParent;

		return this.node.parent;
	}

	/**
	 * @returns An array containing the entity IDs of all of this entity's children that meet the component type modifiers specified. If no modifiers are specified then it will return all of this entity's children.
	 */
	children(...mods: CompTypeMod[]): number[] {
		if (mods.length < 1) return [...this.node.children];

		let eids = [...this.node.children];

		mods.forEach((m) => {
			const [mod, type] = m();

			if (!this.compRef.has(type)) {
				throw new Error(`Component Type [${type.name}] is not registered`);
			}

			if (mod === 'With') {
				eids = eids.filter((eid) => this.compRef.get(type)![eid] !== undefined);
			} else {
				eids = eids.filter((eid) => this.compRef.get(type)![eid] === undefined);
			}
		});

		return eids;
	}

	/**
	 * Sets the specified entity to be a child of this entity. The child entity's parent will also be altered to reflect the new relationship.
	 * If the specified entity is already a child of this entity then the method will quietly return.
	 *
	 * @param child Entity instance or entity ID number
	 * @returns A reference to this entity to allow for method chaining
	 */
	addChild(child: Entity | number): this {
		if (typeof child === 'number') child = this.ecs.entity(child);

		if (this.node.children.includes(child.id())) return this;

		this.node.children.push(child.id());
		child.parent(this.eid);

		return this;
	}

	/**
	 * Calls `addChild` on all input entities
	 * @returns A reference to this entity to allow for method chaining
	 */
	addChildren(...children: (Entity | number)[]): this {
		children.forEach((child) => this.addChild(child));

		return this;
	}

	/**
	 * The specified entity will stop being a child of this entity and the specified child entity's parent will be set to null.
	 * If the specified entity is not a child of this entity then the method will quietly return.
	 *
	 * @param child Entity instance or entity ID number
	 * @returns A reference to this entity to allow for method chaining
	 */
	removeChild(child: Entity | number): this {
		if (typeof child === 'number') child = this.ecs.entity(child);

		if (!this.node.children.includes(child.id())) return this;

		this.node.children.splice(this.node.children.indexOf(child.id()), 1);

		if (child.parent() === this.eid) child.parent(null);

		return this;
	}

	removeChildren(...children: (Entity | number)[]): this {
		children.forEach((child) => this.removeChild(child));

		return this;
	}
}
