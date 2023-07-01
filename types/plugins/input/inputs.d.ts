import { ECS, Resource } from '../..';
import { KeyTracker } from './keytracker';
import { PointerTracker } from './pointertracker';
export declare class Inputs extends Resource {
    keymap: Map<string, KeyTracker>;
    pointer: PointerTracker;
    constructor(keymap?: Map<string, KeyTracker>, pointer?: PointerTracker);
}
export declare class KeysToTrack extends Resource {
    keys: string[];
    constructor(keys: string[]);
}
export declare function setupKeyTrackers(ecs: ECS): void;
export declare function destroyKeyTrackers(ecs: ECS): void;
export declare function updatePointerPos(ecs: ECS): void;
