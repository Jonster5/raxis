import type { ECS } from './ecs';

/**
 * @type Describes the constructor of a given component type.
 *
 * @example In order to use a component `T` in the ECS, you must first register it's `CompType<T>` in the ECS component registry.
 * ```ts
 * class MyComp extends Component { ... }
 *
 * // anywhere with a reference to the ECS you want to use
 * // usually where the ecs is created or in a plugin
 * ecs.addComponentType(MyComp);
 *
 *
 * In that example, the value `MyComp` being passed into method is of type `CompType<MyComp>`
 * ```
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
	getName(): string {
		return this.constructor.name;
	}

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
	getType(): CompType<this> {
		return this.constructor as CompType<this>;
	}

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
	clone(): Component {
		return structuredClone(this);
	}

	/**
	 * @optional
	 * @abstract Optional method that can be used to serialize a component's state into an ArrayBuffer.
	 */
	serialize?(): ArrayBufferLike;

	/**
	 * @optional
	 * @param buffer An ArrayBuffer created from this object's `serialize` method
	 * @returns A new instance of `this` created from the serialized input buffer
	 */
	static deserialize?(buffer: ArrayBufferLike): Component;
}

export class TreeNode {
	parent: number | null = null;
	children: number[] = [];

	onDestroy(ecs: ECS, eid: number) {
		if (this.children.length > 0) this.children.forEach((child) => ecs.destroy(child));
		if (this.parent === null) return;

		ecs.entity(this.parent).removeChild(eid);
	}
}
