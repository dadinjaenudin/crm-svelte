import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🚀 CRM Backend API Server Started   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📊 Available Endpoints:');
  console.log('   GET    /api/members');
  console.log('   POST   /api/members');
  console.log('   GET    /api/points');
  console.log('   POST   /api/points');
  console.log('   GET    /api/vouchers');
  console.log('   POST   /api/vouchers');
  console.log('   GET    /api/redeem');
  console.log('   POST   /api/redeem');
  console.log('');
  console.log('✅ Ready to accept requests!');
  console.log('');
});

export default app;
