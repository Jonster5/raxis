import { Component, ECS, Entity } from '..';
export declare class Particle extends Component {
    tleft: number;
    constructor(tleft: number);
}
export declare class ParticleGenerator extends Component {
    amount: number;
    onGenerate: (p: Entity) => void;
    duration: number;
    delay: number;
    repeat: boolean;
    done: boolean;
    tleft: number;
    constructor(amount: number, onGenerate?: (p: Entity) => void, duration?: number, delay?: number, repeat?: boolean, done?: boolean, tleft?: number);
}
export declare function ParticlePlugin(ecs: ECS): void;
