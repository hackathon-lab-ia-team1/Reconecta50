import { Router } from 'express';
import {
  handlePrepararCandidatura,
  handleEnviarCandidatura,
  handleListarCandidaturas,
} from '../controllers/candidaturasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', handleListarCandidaturas);
router.post('/', handleEnviarCandidatura);
router.post('/preparar', handlePrepararCandidatura);
router.post('/enviar', handleEnviarCandidatura);

export default router;
