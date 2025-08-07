import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Priorizar variáveis do Vercel, depois .env, depois fallback
  let API_URL = 'https://imobiliaria-firenze-backend.onrender.com/api'; // fallback
  
  if (process.env.VITE_API_URL) {
    API_URL = process.env.VITE_API_URL;
  } else if (env.VITE_API_URL) {
    API_URL = env.VITE_API_URL;
  }
  
  // Garantir que sempre termine com /api
  if (!API_URL.endsWith('/api')) {
    API_URL = API_URL + '/api';
  }
  
  console.log('Vite Config - Mode:', mode);
  console.log('Vite Config - Final API_URL:', API_URL);
  console.log('Vite Config - env.VITE_API_URL:', env.VITE_API_URL);
  console.log('Vite Config - process.env.VITE_API_URL:', process.env.VITE_API_URL);
  
  return {
    server: {
      host: "::",
      port: 8081,
      historyApiFallback: true,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode === 'development',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
