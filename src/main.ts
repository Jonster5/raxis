import type { ECSPlugin } from './engine';
import { AssetsPlugin } from './plugins/assets';
import { AudioPlugin } from './plugins/audio';
import { GraphicsPlugin } from './plugins/graphics';
import { InputPlugin } from './plugins/input';
import { ParticlePlugin } from './plugins/particle';
import { SocketPlugin } from './plugins/socket';
import { TimePlugin } from './plugins/time';
import { TransformPlugin } from './plugins/transform';
import { TweenPlugin } from './plugins/tween';

export const defaultPlugins: ECSPlugin[] = [
	AssetsPlugin,
	TimePlugin,
	TransformPlugin,
	GraphicsPlugin,
	AudioPlugin,
	InputPlugin,
	TweenPlugin,
	ParticlePlugin,
	SocketPlugin,
];

export * from './engine/ecs';
export * from './engine/component';
