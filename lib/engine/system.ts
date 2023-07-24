import type { ECS } from './ecs';
import type { EventType, EventReader, EventWriter } from './event';
import type { QueryDef, QueryResults } from './query';
import type { ResType } from './resource';

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
