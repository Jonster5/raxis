import { TweenBase } from './tweenbase';
export declare class BasicTween extends TweenBase {
    start: number;
    finish: number;
    distance: number;
    protected _state: number;
    protected _value: number;
    constructor(start: number, finish: number, duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (val: number) => void);
    update(dt: number): void;
}
