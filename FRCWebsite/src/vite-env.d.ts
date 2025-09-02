/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '192.168.2.203',   // 👈 exposes to your network
        port: 5173,        // (optional, but keep fixed so you know what to open)
    },
})