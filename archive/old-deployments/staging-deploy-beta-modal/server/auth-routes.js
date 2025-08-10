import { Router } from 'express';
import './types.js';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from './storage.js';
import { db } from './db.js';
import * as schema from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import '../types';
const authRouter = Router();
authRouter.post('/login', async (req, res) => {
    try {
        const loginSchema = z.object({
            identifier: z.string().min(1, 'Username or email is required'),
            password: z.string().min(1, 'Password is required'),
        });
        const { identifier, password } = loginSchema.parse(req.body);
        console.log(`Login attempt for identifier: ${identifier}`);
        const isEmail = identifier.includes('@');
        const [user] = isEmail
            ? await db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, identifier))
            : await db
                .select()
                .from(schema.users)
                .where(eq(schema.users.username, identifier));
        if (!user) {
            console.log(`User not found: ${identifier}`);
            return res.status(401).json({ message: 'Invalid username/email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log(`Invalid password for user: ${identifier}`);
            return res.status(401).json({ message: 'Invalid username/email or password' });
        }
        console.log(`User has role: ${user.role}`);
        const userWithRole = {
            ...user,
            role: user.role || 'participant'
        };
        req.session.userId = user.id;
        const { password: _, ...userDataWithoutPassword } = userWithRole;
        console.log(`Login successful for user with role: ${userDataWithoutPassword.role}`);
        res.status(200).json(userDataWithoutPassword);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
authRouter.post('/register', async (req, res) => {
    try {
        const registerSchema = z.object({
            username: z.string().min(3, 'Username must be at least 3 characters'),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            name: z.string().min(1, 'Name is required'),
            email: z.string().email('Invalid email').optional().nullable(),
            title: z.string().optional().nullable(),
            organization: z.string().optional().nullable(),
        });
        const userData = registerSchema.parse(req.body);
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const newUser = await storage.createUser({
            ...userData,
            password: hashedPassword,
            role: 'participant',
        });
        req.session.userId = newUser.id;
        const { password: _, ...userDataWithoutPassword } = newUser;
        res.status(201).json(userDataWithoutPassword);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
authRouter.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});
authRouter.get('/user', async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password: _, ...userDataWithoutPassword } = user;
        res.status(200).json(userDataWithoutPassword);
    }
    catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export { authRouter };
