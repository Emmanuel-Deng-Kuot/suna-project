import { defineConfig } from 'vite';

export default defineConfig({
  // Build optimization
  build: {
    // Modern JavaScript target
    target: ['es2020', 'edge88', 'firefox78', 'chrome90', 'safari14'],
    
    // Code splitting strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor code from app code
          vendor: ['swiper'],
        },
        // Optimize chunk sizes
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(name)) {
            return 'fonts/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name)) {
            return 'css/[name]-[hash][extname]';
          }
          if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(name)) {
            return 'images/[name]-[hash][extname]';
          }
          return '[name]-[hash][extname]';
        },
      },
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Optimization
    reportCompressedSize: false,
    cssCodeSplit: true, // Split CSS into separate files
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
  },

  // Development server optimization
  server: {
    middlewareMode: false,
    // Warm up frequently used modules
    warmup: {
      clientFiles: ['./src/js/main.js', './src/styles/main.scss'],
    },
  },

  // CSS processing optimization
  css: {
    preprocessorOptions: {
      scss: {
        // Optimize SASS output
        outputStyle: 'compressed',
        sourceMap: false,
      },
    },
  },
});
