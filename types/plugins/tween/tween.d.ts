import { Component, ECS, Entity } from '../..';
import type { TweenBase } from './tweenbase';
export declare class TweenManager extends Component {
    tweens: Map<string, TweenBase>;
    constructor(tweens?: Map<string, TweenBase>);
}
export declare function updateTweens(ecs: ECS): void;
export declare function addTween<T extends TweenBase>(entity: Entity, label: string, tween: T): T;
export declare function tweenIsDone(entity: Entity, label: string): boolean;
export declare function getTween(entity: Entity, label: string): TweenBase | null;
export declare function removeTween(entity: Entity, label: string): void;
