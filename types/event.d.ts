import type { ECS } from './ecs';
/**
 * Class which all custom ECS event types must inherit from
 */
export declare abstract class ECSEvent {
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
export declare class EventHandler<T extends ECSEvent = any> {
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
export declare class EventWriter<T extends ECSEvent> {
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
export declare class EventReader<T extends ECSEvent> {
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
