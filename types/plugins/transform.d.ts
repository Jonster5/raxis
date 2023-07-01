import { Component, ECS, Entity } from '..';
import { Vec2 } from '../math/vec2';
export declare class Transform extends Component {
    size: Vec2;
    pos: Vec2;
    angle: number;
    vel: Vec2;
    avel: number;
    last: {
        pos: Vec2;
        angle: number;
    };
    constructor(size?: Vec2, pos?: Vec2, angle?: number, vel?: Vec2, avel?: number, last?: {
        pos: Vec2;
        angle: number;
    });
    clone(): Transform;
    serialize(): string;
    static deserialize(str: string): Transform;
}
export declare function globalPos(e: Entity): Vec2;
export declare function globalAngle(e: Entity): number;
export declare function globalVel(e: Entity): Vec2;
export declare function globalAvel(e: Entity): number;
export declare function TransformPlugin(ecs: ECS): void;
