import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [dts({ insertTypesEntry: true })],
	build: {
		lib: {
			entry: ['./lib/main.ts', './lib/math.ts'],
			name: 'raxis',
			fileName: (f, n) => `raxis-${n}.${f === 'cjs' ? f : 'js'}`,
			formats: ['es', 'cjs'],
		},
	},
	server: {
		port: 7700,
		host: true,
	},
	resolve: {
		alias: {
			'raxis/math': path.resolve(__dirname, './lib/math'),
			raxis: path.resolve(__dirname, './lib/main'),
		},
	},
});
