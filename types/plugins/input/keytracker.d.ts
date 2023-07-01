export declare class KeyTracker {
    keys: string[];
    isDown: boolean;
    isUp: boolean;
    private okd;
    private oku;
    private kdb;
    private kub;
    constructor(...keys: string[]);
    destroy(): void;
    private kd;
    private ku;
    onKeyDown(cb: () => void, thisArg?: any): void;
    onKeyUp(cb: () => void, thisArg?: any): void;
}
