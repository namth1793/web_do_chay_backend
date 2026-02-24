require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const orderRoutes = require('./src/routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép mọi localhost (bất kỳ port nào) và không có origin (curl, Postman)
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // FRONTEND_URL có thể là danh sách cách nhau bởi dấu phẩy
      const allowed = (process.env.FRONTEND_URL || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Cashew Essence API' }));
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Endpoint không tồn tại' }));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
