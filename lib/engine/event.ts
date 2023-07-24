import type { ECS } from './ecs';

/**
 * Class which all custom ECS event types must inherit from
 */
export abstract class ECSEvent {
	/**
	 * @returns The name of this event's type
	 */
	getName(): string {
		return this.constructor.name;
	}

	/**
	 * @returns this event instance's constructor
	 */
	getType(): EventType<this> {
		return this.constructor as EventType<this>;
	}

	clone(): ECSEvent {
		return structuredClone(this);
	}
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

	data: { body: ECSEvent | null; gen: number; deadline: number }[];

	gen: number;

	readers: EventReader<T>[];
	writers: EventWriter<T>[];

	constructor(ecs: ECS, type: EventType<T>) {
		this.ecs = ecs;
		this.type = type;
		this.data = [];
		this.gen = 0;

		this.readers = [];
		this.writers = [];
	}

	write(data?: T) {
		if (data && !(data instanceof this.type)) {
			throw new Error(`data sent through event must match event type [${this.type.name}]`);
		}

		this.gen++;

		this.data.push({ body: data ?? null, gen: this.gen, deadline: this.ecs.frame() + 2 });
	}

	addReader(reader: EventReader<T>) {
		this.readers.push(reader);
	}

	addWriter(writer: EventWriter<T>) {
		this.writers.push(writer);
	}

	setReadersGen(gen: number) {
		const save = this.gen;

		this.gen = gen;

		this.readers.forEach((reader) => reader.clear());

		this.gen = save;
	}
}

/**
 * Class which provides functionality for sending ECS events
 */
export class EventWriter<T extends ECSEvent> {
	private handler: EventHandler<T>;

	constructor(handler: EventHandler<T>) {
		this.handler = handler;
	}

	/**
	 * Emits an event of type `T`
	 *
	 * @param data If data is omitted then the event will still be emittied, however it will carry no data and be recieved as `null` by event readers listening for this event type.
	 */
	send(data?: T): void {
		this.handler.write(data);
	}
}

/**
 * Class which provides functionality for reading ECS events
 */
export class EventReader<T extends ECSEvent> {
	private handler: EventHandler<T>;
	private gen: number;

	constructor(handler: EventHandler<T>) {
		this.handler = handler;

		this.gen = handler.gen;
	}

	/**
	 * @returns boolean indicating whether there is at least one new unread event of type `T`
	 */
	available(): boolean {
		return this.gen < this.handler.gen && this.handler.data.length > 0;
	}

	/**
	 * @returns boolean indicating if there are no unread events of type `T`
	 */
	empty(): boolean {
		return this.gen >= this.handler.gen || this.handler.data.length <= 0;
	}

	/**
	 * When called this method will mark all events as read making any unhandled events will be innaccessable.
	 * @returns An array containing all unread events or an empty array if there are none.
	 */
	get(): (T | null)[] {
		if (this.empty()) return [];

		const data = this.handler.data.filter(({ gen }) => gen > this.gen).map(({ body }) => body?.clone()) as T[];

		this.gen = this.handler.gen;

		return data;
	}

	/**
	 * Marks all events as read, making them innaccessable
	 */
	clear(): void {
		this.gen = this.handler.gen;
	}
}
