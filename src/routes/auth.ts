import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user'; // Adjust the import if necessary

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 8) {
    console.log('Invalid username or password format');
    return res.status(400).json({ message: 'Invalid username or password format' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword });
    console.log('User registered:', user.username);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('Username already taken');
      res.status(400).json({ message: 'Username already taken' });
    } else {
      console.error('Error registering user:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
});

// Login a user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      console.log('Invalid username or password');
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error: any) {
    console.error('Error logging in user:', error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;
