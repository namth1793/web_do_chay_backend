const express = require('express');
const db = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { sendOrderNotification } = require('../email');

const router = express.Router();

// POST /api/orders — tạo đơn hàng (có thể không cần đăng nhập)
router.post('/', optionalAuth, async (req, res) => {
  const { size, price, quantity, customer_name, phone, address, payment } = req.body;

  if (!size || !price || !customer_name || !phone || !address || !payment) {
    return res.status(400).json({ error: 'Thiếu thông tin đơn hàng' });
  }

  const qty = Math.max(1, parseInt(quantity) || 1);

  try {
    const user_id = req.user ? req.user.id : null;
    const result = db
      .prepare(
        'INSERT INTO orders (user_id, size, price, quantity, customer_name, phone, address, payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(user_id, size, price, qty, customer_name, phone, address, payment);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

    // Gửi email thông báo admin (không chặn response nếu lỗi)
    sendOrderNotification(order).catch((err) =>
      console.error('❌ Gửi email thất bại:', err.message)
    );

    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server, vui lòng thử lại' });
  }
});

// GET /api/orders/my — lịch sử đơn hàng của user đăng nhập
router.get('/my', authenticateToken, (req, res) => {
  try {
    const orders = db
      .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
