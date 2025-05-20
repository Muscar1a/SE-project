import express from 'express';
import { registerUser } from '../controllers/users.js';

const router = express.Router();

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', registerUser);

export default router;
