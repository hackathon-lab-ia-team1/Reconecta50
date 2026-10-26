import { Router } from 'express';
import {
  handleGerarCurriculo,
  handleSalvarCurriculo,
  handleObterMeuCurriculo,
} from '../controllers/curriculoController.js';

const router = Router();

router.post('/gerar', handleGerarCurriculo);
router.post('/salvar', handleSalvarCurriculo);
router.get('/meu', handleObterMeuCurriculo);

export default router;
