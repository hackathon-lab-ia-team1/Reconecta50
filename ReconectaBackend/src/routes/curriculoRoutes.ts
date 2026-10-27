import { Router } from 'express';
import {
  handleGerarCurriculo,
  handleSalvarCurriculo,
  handleObterMeuCurriculo,
} from '../controllers/curriculoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/gerar', handleGerarCurriculo);
router.post('/salvar', handleSalvarCurriculo);
router.get('/meu', handleObterMeuCurriculo);

export default router;
