import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023'
    },
    preset: {
        ...preset,
        apple: {
            ...preset.apple,
            resizeOptions: { background: '#ffffff', fit: 'contain' }
        },
        maskable: {
            ...preset.maskable,
            resizeOptions: { background: '#ffffff', fit: 'contain' }
        },
        transparent: {
            ...preset.transparent,
            resizeOptions: { background: '#ffffff', fit: 'contain' }
        }
    },
    images: ['public/vite.svg']
})