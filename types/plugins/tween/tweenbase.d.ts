export declare abstract class TweenBase {
    duration: number;
    protected _state: any;
    protected _value: any;
    ease: (x: number) => number;
    protected _onUpdate: Function;
    protected _onCompletion: Function;
    done: boolean;
    constructor(duration: number, easing?: (x: number) => number, onCompletion?: () => void, onUpdate?: Function);
    onUpdate(cb: Function): this;
    onCompletion(cb: Function): this;
    abstract update(dt: number): void;
    get state(): any;
    set state(v: any);
    get value(): any;
}
