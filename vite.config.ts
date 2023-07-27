import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [dts({ insertTypesEntry: true, exclude: 'src' })],
	build: {
		lib: {
			entry: './lib/main.ts',
			name: 'raxis',
			fileName: (f) => `raxis.${f === 'cjs' ? 'cjs' : 'js'}`,
			formats: ['es', 'cjs'],
		},
	},
	server: {
		port: 7700,
		host: true,
	},
	resolve: {
		alias: {
			raxis: path.resolve(__dirname, './lib/main'),
		},
	},
});
