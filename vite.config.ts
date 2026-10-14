import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// GitHub Pages のサブパス配信用
export default defineConfig({ base: '/react-useinview-toc-demo/', plugins: [react()] });
