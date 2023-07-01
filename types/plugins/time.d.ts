import { ECS, Resource } from '..';
export declare class Time extends Resource {
    elapsed: number;
    delta: number;
    last: number;
    speed: number;
    constructor(elapsed?: number, delta?: number, last?: number, speed?: number);
}
export declare function TimePlugin(ecs: ECS): void;
