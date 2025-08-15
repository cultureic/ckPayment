import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Plugin to copy SDK bundle
const copySDKPlugin = () => ({
  name: 'copy-sdk-bundle',
  writeBundle: async () => {
    const sdkSourceDir = path.resolve(__dirname, '../bundleSDK');
    const sdkTargetDir = path.resolve(__dirname, 'dist');
    
    // Files to copy from bundleSDK to dist
    const filesToCopy = ['cdkPay.js', 'cdkPay.js.LICENSE.txt', 'cdkPay.js.map'];
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(sdkSourceDir, file);
      const targetPath = path.join(sdkTargetDir, file);
      
      if (existsSync(sourcePath)) {
        try {
          await copyFile(sourcePath, targetPath);
          console.log(`✓ Copied ${file} to dist/`);
        } catch (error) {
          console.warn(`⚠ Failed to copy ${file}:`, error.message);
        }
      } else {
        console.warn(`⚠ SDK file not found: ${sourcePath}`);
      }
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    copySDKPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
    },
  },
  optimizeDeps: {
    include: ['framer-motion'],
  },
}));
