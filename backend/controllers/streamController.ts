import { StreamerModel } from '../models/Streamer';

export const streamController = {
    listByCategory: async (req: any, res: any) => {
        try {
            const { category } = req.params;
            // Se category for popular, trazemos todos ordenados por viewers
            const query = category === 'popular' ? {} : { category };
            const streams = await StreamerModel.find(query).sort({ viewers: -1 });
            res.json({ data: streams });
        } catch (err: any) {
            res.status(500).json({ error: "Erro ao buscar lives do banco: " + err.message });
        }
    },

    create: async (req: any, res: any) => {
        try {
            const stream = await StreamerModel.create({
                ...req.body,
                id: `live-${Date.now()}`,
                viewers: Math.floor(Math.random() * 100) // Simulação inicial de viewers
            });
            res.status(201).json({ data: stream });
        } catch (err: any) {
            res.status(500).json({ error: "Erro ao registrar live no banco: " + err.message });
        }
    }
};