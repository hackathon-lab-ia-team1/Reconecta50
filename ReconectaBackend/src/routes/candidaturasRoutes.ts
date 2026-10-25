import { Router } from 'express';
import {
  handlePrepararCandidatura,
  handleEnviarCandidatura,
  handleListarCandidaturas,
} from '../controllers/candidaturasController.js';

const router = Router();

router.get('/', handleListarCandidaturas);
router.post('/', handleEnviarCandidatura);
router.post('/preparar', handlePrepararCandidatura);
router.post('/enviar', handleEnviarCandidatura);

export default router;
