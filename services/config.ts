// services/config.ts

/**
 * Configuração do Backend (Node.js)
 * Usa apenas variáveis de ambiente do servidor
 */

export const dbConfig = {
  mongodb: {
    // URI de conexão com o MongoDB real
    url:
      process.env.MONGODB_URI ||
      'mongodb://72.60.249.175:27017/livego',
  },

  server: {
    // Porta do backend (não usar porta do Vite)
    port: Number(process.env.PORT) || 3000,
  },
};
