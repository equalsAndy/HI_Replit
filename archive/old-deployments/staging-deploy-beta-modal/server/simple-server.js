import express from 'express';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import './types.js';
import cookieParser from 'cookie-parser';
import { router } from './routes';
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session_aws',
    createTableIfMissing: false,
    schemaName: 'public',
    pruneSessionInterval: 60 * 15,
});
sessionStore.on('error', (error) => {
    console.error('❌ Session store error:', error);
});
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'heliotrope-workshop-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
console.log('Initializing database connection...');
app.use('/api', router);
if (process.env.NODE_ENV === 'production') {
    const clientDistDir = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientDistDir));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api'))
            return;
        res.sendFile(path.join(clientDistDir, 'index.html'));
    });
}
const server = createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
export { app, server };
