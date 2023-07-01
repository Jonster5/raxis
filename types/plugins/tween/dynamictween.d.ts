import { TweenBase } from './tweenbase';
export declare class DynamicTween<T extends {
    [key: string]: number;
}, P extends [...string[]]> extends TweenBase {
    obj: T;
    start: {
        [key: string]: number;
    };
    target: T;
    fields: string[];
    protected _state: number;
    protected _onUpdate: (obj: T) => void;
    constructor(obj: T, target: T, props: [...P], duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: (obj: T) => void);
    update(dt: number): void;
}
