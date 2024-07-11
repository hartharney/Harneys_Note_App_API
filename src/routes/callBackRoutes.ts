// auth.ts
import express from 'express';
import passport from '../middlewares/passport'; 
import { generateToken } from '../utils/utils';
import { User } from '../firebase/models/User';

const router = express.Router();

// Google Auth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'consent' }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req , res) => {
  

    const user = req.user as User;
    const token = await generateToken(user.email, user.id); 
    res.redirect(`http://localhost:5173/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);


export default router;
