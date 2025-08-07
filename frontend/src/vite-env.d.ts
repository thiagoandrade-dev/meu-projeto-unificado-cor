/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Adicione outras variáveis de ambiente que você usa aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
