import typescript from '@rollup/plugin-typescript';

const generateConfig = (path) => ({
	input: `./src/${path}/index.ts`,
	plugins: [typescript()],
	output: {
		file: `./dist/${path}/index.js`,
		format: 'cjs'
	}
});

export default [generateConfig('server'), generateConfig('client')];
