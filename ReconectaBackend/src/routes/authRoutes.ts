import { Router } from 'express';
import { handleLogin, handleRegister, handleMe, handleLogout } from '../controllers/authController.js';

const router = Router();

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.get('/me', handleMe);
router.post('/logout', handleLogout);

export default router;
