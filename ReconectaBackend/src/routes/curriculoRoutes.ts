import { Router } from 'express';
import { handleGerarCurriculo } from '../controllers/curriculoController.js';

const router = Router();

router.post('/gerar', handleGerarCurriculo);

export default router;
