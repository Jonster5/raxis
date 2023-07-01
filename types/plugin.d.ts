import type { ECS } from './ecs';
/**
 * @type Describes the definition of an ECS plugin
 */
export type ECSPlugin = (ecs: ECS) => void;
