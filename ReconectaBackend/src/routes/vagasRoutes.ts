import { Router } from 'express';
import { handleListarVagas } from '../controllers/vagasController.js';

const router = Router();

router.get('/', handleListarVagas);

export default router;
