import { Router } from 'express';
import logger from '../../utils/logger.js';

const router = Router();

// In a real application, you'd use a database and password hashing (e.g., bcrypt)
const MOCK_USERS = [
    { id: 'user-01', email: 'client@saas.com', password: 'password' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (user) {
    logger.info(`Successful login for user: ${email}`);
    // In a real app, you'd generate a JWT here. For this dashboard, we'll just send user info.
    res.status(200).json({ id: user.id, email: user.email });
  } else {
    logger.warn(`Failed login attempt for user: ${email}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

export default router;
