import { Router } from 'express';
import { handleListarVagas, handleRecomendarVagas } from '../controllers/vagasController.js';

const router = Router();

router.get('/', handleListarVagas);
router.post('/recomendadas', handleRecomendarVagas);

export default router;
