
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Middleware Global de Erros
 * Intercepta qualquer erro lançado na API e formata para o Frontend.
 */
// Fix: Changed req and res to any to resolve issues where standard properties like method and path were not recognized.
export const globalErrorHandler = (err: any, req: any, res: any, next: NextFunction) => {
    console.error(`[REST_API_EXCEPTION] ${req.method} ${req.path}:`, err);

    // Erros específicos de Mongoose (Banco de Dados)
    if (err.name === 'ValidationError') {
        return sendError(res, 'Falha de validação nos dados enviados.', 400, err.errors);
    }

    if (err.name === 'CastError') {
        return sendError(res, 'ID de recurso inválido ou mal formatado.', 400);
    }

    if (err.code === 11000) {
        return sendError(res, 'Dado duplicado detectado (E-mail ou ID já existe).', 409);
    }

    // Erro de Autenticação JWT
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 'Token de segurança inválido.', 401);
    }

    // Erro Genérico
    return sendError(res, err.message || 'Erro inesperado na intermediação de dados.', err.status || 500);
};
