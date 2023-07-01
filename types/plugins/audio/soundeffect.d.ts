export declare class SoundEffect {
    actx: AudioContext;
    oscillator: OscillatorNode;
    wait: number;
    constructor(frequencyValue: number, attack?: number, decay?: number, type?: OscillatorType, volumeValue?: number, panValue?: number, wait?: number, pitchBendAmount?: number, reverse?: boolean, randomValue?: number, echo?: [number, number, number] | undefined, reverb?: [number, number, boolean] | undefined);
    play(): void;
    onDestroy(): void;
}
