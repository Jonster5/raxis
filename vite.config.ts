import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [dts({ insertTypesEntry: true })],
	build: {
		lib: {
			entry: ['./src/main.ts', './src/math.ts'],
			name: 'raxis',
			fileName: (f, n) => `raxis-${n}.${f === 'cjs' ? f : 'js'}`,
			formats: ['es', 'cjs'],
		},
	},
});
