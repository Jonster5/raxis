import { Component } from '../..';
export declare class Sprite extends Component {
    type: 'rectangle' | 'ellipse' | 'image' | 'none';
    material: string | CanvasGradient | CanvasPattern | HTMLImageElement[] | undefined;
    visible: boolean;
    filter: string | undefined;
    alpha: number;
    borderColor: string;
    borderWidth: number;
    shifter: number | undefined;
    delay: number | undefined;
    ci: number;
    constructor(type: 'rectangle' | 'ellipse' | 'image' | 'none', material?: string | CanvasGradient | CanvasPattern | HTMLImageElement[] | undefined, visible?: boolean, filter?: string | undefined, alpha?: number, borderColor?: string, borderWidth?: number, shifter?: number | undefined, delay?: number | undefined, ci?: number);
    onDestroy(): void;
}
export declare class Root extends Component {
}
export declare function startImageAnimation(sprite: Sprite, delay: number): void;
export declare function stopImageAnimation(sprite: Sprite): void;
export declare function gotoImageFrame(sprite: Sprite, index: number): void;
