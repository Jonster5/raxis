import { ECS, Resource } from '../';
export declare class Assets extends Resource {
    [key: string]: any;
}
export declare function loadImageFile(url: string): Promise<HTMLElement>;
export declare function loadImages(...urls: string[]): Promise<HTMLElement[]>;
export declare function loadJSONFile(url: string): Promise<any>;
export declare function loadJSON(...urls: string[]): Promise<any[]>;
export declare function loadSoundFile(url: string): Promise<AudioBuffer>;
export declare function loadSounds(...urls: string[]): Promise<AudioBuffer[]>;
export declare function AssetsPlugin(ecs: ECS): void;
