// ─── Backend API Entry Point ──────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

// ─── Khởi tạo Express App ─────────────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Serve Screenshots (static files) ────────────────────────────────────────
app.use('/screenshots', express.static('./screenshots'));

// ─── Routes ───────────────────────────────────────────────────────────────────
const scriptsRouter    = require('./routes/scripts');
const executionsRouter = require('./routes/executions');

app.use('/api/scripts',    scriptsRouter);
app.use('/api',            executionsRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'RPA Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} không tồn tại` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── Khởi động Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();   // Kiểm tra kết nối PostgreSQL trước khi listen
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}

bootstrap();