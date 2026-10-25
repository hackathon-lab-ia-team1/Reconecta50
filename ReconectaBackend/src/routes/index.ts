import { Router } from 'express';
import authRoutes from './authRoutes.js';
import curriculoRoutes from './curriculoRoutes.js';
import vagasRoutes from './vagasRoutes.js';
import candidaturasRoutes from './candidaturasRoutes.js';
import { handleProfile } from '../controllers/authController.js';

const router = Router();

router.use('/auth', authRoutes);
router.get('/api/profile', handleProfile);
router.use('/api/curriculo', curriculoRoutes);
router.use('/api/vagas', vagasRoutes);
router.use('/api/candidaturas', candidaturasRoutes);

export default router;
