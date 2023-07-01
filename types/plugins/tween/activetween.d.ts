import { TweenBase } from '.';
import { BasicTween } from './basictween';
export declare class Tween<T extends {
    [key: string]: number;
}> extends TweenBase {
    obj: T;
    target: T;
    fields: {
        name: string;
        tween: BasicTween;
    }[];
    protected _state: number;
    protected _onUpdate: (obj: T) => void;
    constructor(obj: any, to: T, duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (obj: T) => void);
    update(dt: number): void;
    get state(): number;
    set state(v: number);
    get value(): any;
}
