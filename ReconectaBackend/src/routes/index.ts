import { Router } from 'express';
import authRoutes from './authRoutes.js';
import curriculoRoutes from './curriculoRoutes.js';
import vagasRoutes from './vagasRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/api/curriculo', curriculoRoutes);
router.use('/api/vagas', vagasRoutes);

export default router;
