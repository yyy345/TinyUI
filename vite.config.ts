import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'

  return {
    plugins: [vue(), eslintPlugin()],
    resolve: {
      alias: {
        '@': '/src/',
        '@components': '/src/components',
      }
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'TinyElement',
            fileName: (format) => format === 'es' ? 'tiny-element.js' : 'tiny-element.umd.js',
            formats: ['es', 'umd']
          },
          rollupOptions: {
            external: ['vue'],
            output: {
              exports: 'named',
              globals: {
                vue: 'Vue'
              }
            }
          }
        }
      : undefined
  }
})
