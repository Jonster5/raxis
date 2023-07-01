import { Component, Entity } from '../../';
import { Sound } from './sound';
import { SoundEffect } from './soundeffect';
export declare class SoundManager extends Component {
    sounds: Map<string, Sound | SoundEffect>;
    constructor(sounds?: Map<string, Sound | SoundEffect>);
    onDestroy(): void;
}
export declare function addAudio<T extends Sound | SoundEffect>(entity: Entity, label: string, sound: T): T;
export declare function getSound(entity: Entity, label: string): Sound | null;
export declare function getSoundEffect(entity: Entity, label: string): SoundEffect | null;
export declare function removeAudio(entity: Entity, label: string): void;
