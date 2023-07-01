import { Component, ECS, Resource } from '../..';
import { Vec2 } from '../../math/vec2';
export declare class Canvas extends Component {
    target: HTMLElement;
    element: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    aspect: number;
    size: Vec2;
    zoom: number;
    def: DOMMatrix;
    root: number | null;
    last: {
        zoom: number;
        tcw: number;
        tch: number;
    };
    constructor(target: HTMLElement, element: HTMLCanvasElement, ctx: CanvasRenderingContext2D, aspect: number, size: Vec2, zoom: number, def: DOMMatrix, root: number | null, last: {
        zoom: number;
        tcw: number;
        tch: number;
    });
}
export declare class CanvasSettings extends Resource {
    settings: {
        target: HTMLElement;
        width: number;
        rendering?: 'crisp-edges' | 'pixelated';
        extraStyling?: string;
    };
    constructor(settings: {
        target: HTMLElement;
        width: number;
        rendering?: 'crisp-edges' | 'pixelated';
        extraStyling?: string;
    });
}
export declare function setupCanvas(ecs: ECS): void;
export declare function updateCanvasZoom(ecs: ECS): void;
export declare function updateCanvasDimensions(ecs: ECS): void;
export declare function renderCanvas(ecs: ECS): void;
