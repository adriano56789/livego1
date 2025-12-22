
// services/config.ts

/**
 * Configuração de conexão com o Banco de Dados Real.
 * Requer a variável de ambiente VITE_MONGODB_URI ou MONGODB_URI.
 */

const getEnv = () => {
  try {
    // Tenta pegar do import.meta (Vite) ou process.env (Node)
    const env = (import.meta as any).env || process.env || {};
    return env;
  } catch {
    return process.env || {};
  }
};

const env = getEnv();

export const dbConfig = {
  mongodb: {
    // URI de conexão real. Se não existir, undefined (o que causará erro na conexão)
    url: env.VITE_MONGODB_URI || env.MONGODB_URI || 'mongodb://localhost:27017/bricked_real',
  },
  server: {
    port: env.PORT || 3000
  }
};
