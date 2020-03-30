import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'umd' }
    ],
    plugins: [typescript(), resolve(), svelte()]
  }
]
