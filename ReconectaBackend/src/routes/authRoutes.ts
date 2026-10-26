import { Router } from 'express';
import {
  handleLogin,
  handleRegister,
  handleLembreteSenha,
  handleMe,
  handleProfile,
  handleLogout,
} from '../controllers/authController.js';

const router = Router();

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.post('/lembrete-senha', handleLembreteSenha);
router.get('/me', handleMe);
router.get('/profile', handleProfile);
router.post('/logout', handleLogout);

export default router;
