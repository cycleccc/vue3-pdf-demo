import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/vue3-pdf-demo/',
    build: {
        target: 'esnext', // 确保支持私有字段
    },
});
