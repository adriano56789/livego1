/**
 * CONFIGURAÇÃO ÚNICA E REAL
 * Conecta o Frontend diretamente à API na porta 3000 da VPS.
 */
const VPS_IP = '72.60.249.175';
const BACKEND_URL = `http://${VPS_IP}:3000`;

export const API_CONFIG = {
    BASE_URL: `${BACKEND_URL}/api`,
    WS_URL: BACKEND_URL,
    STATIC_URL: `${BACKEND_URL}/uploads`
};