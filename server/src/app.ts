// FILE: server/src/app.ts
import './utils/bigint.utils';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import companiesRoutes from './routes/companies.routes'; // ADD THIS
import watchlistRoutes from './routes/watchlist.routes';
import syncRoutes from './routes/sync.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ 
  origin: env.CLIENT_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'BlueWhale Terminal API' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/companies', companiesRoutes); // ADD THIS
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/sync', syncRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;